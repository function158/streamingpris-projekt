import os
import json
import time
import urllib.request
import urllib.parse
import urllib.error
import http.client
import ssl
from datetime import datetime
from collections import defaultdict

SUPABASE_HOST = "jrjwronitlemdnctzkdj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyandyb25pdGxlbWRuY3R6a2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDQyMzgsImV4cCI6MjA4ODYyMDIzOH0.rlvdsZZTPfVIsjzq4IzcsIoMqz7DwgcgZP_RkUiwWYc"
TELEGRAM_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

PROVIDER_URLS = {
    "telmore": "https://www.telmore.dk/",
    "cbb": "https://www.cbb.dk/",
    "oister": "https://www.oister.dk/",
    "flexii": "https://www.flexii.dk/",
    "eesy": "https://www.eesy.dk/",
    "lebara": "https://www.lebara.dk/",
    "lyca-mobile": "https://www.lycamobile.dk/",
    "duka": "https://www.dukatale.dk/",
    "greentel": "https://www.greentel.dk/",
    "yousee": "https://www.yousee.dk/",
    "3": "https://www.3.dk/",
    "hiper": "https://www.hiper.dk/",
    "ewii": "https://www.ewii.dk/",
    "norlys": "https://www.norlys.dk/",
    "bornfiber": "https://www.bornfiber.dk/",
    "allente": "https://www.allente.dk/",
    "nextory": "https://www.nextory.dk/",
    "bookbeat": "https://bookbeat.com/dk/",
    "mofibo": "https://www.mofibo.com/dk/",
}

# Statuskoder der er definitive svar - ingen grund til at retry
DEFINITIVE_ERRORS = {404, 410, 301, 302, 303}


def supabase_get(table, params):
    path = "/rest/v1/" + table + "?" + params
    conn = http.client.HTTPSConnection(SUPABASE_HOST, context=ssl.create_default_context(), timeout=10)
    conn.request("GET", path, headers={"apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY})
    r = conn.getresponse()
    data = r.read()
    conn.close()
    if r.status != 200:
        raise Exception("Supabase " + str(r.status) + ": " + data[:200].decode())
    return json.loads(data)


def extract_dest_url(affiliate_link):
    parsed = urllib.parse.urlparse(affiliate_link)
    qs = urllib.parse.parse_qs(parsed.query)
    if "url" in qs:
        return urllib.parse.unquote(qs["url"][0])
    return None


def _single_check(url):
    """
    Eet enkelt forsog. Returnerer (ok, status, final_url).
    ok=None betyder 'kan ikke verificere' (429, osv.)
    """
    try:
        req = urllib.request.Request(
            url,
            method="HEAD",
            headers={"User-Agent": "Mozilla/5.0 (compatible; link-checker/1.0)"},
        )
        with urllib.request.urlopen(req, timeout=12) as r:
            return True, r.status, r.url
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return None, 429, url
        if e.code in (405, 403):
            try:
                req2 = urllib.request.Request(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; link-checker/1.0)"},
                )
                with urllib.request.urlopen(req2, timeout=12) as r:
                    return True, r.status, r.url
            except urllib.error.HTTPError as e2:
                if e2.code == 429:
                    return None, 429, url
                return False, e2.code, url
            except Exception:
                return False, 0, url
        return False, e.code, url
    except Exception:
        return False, 0, url


def check_url(url):
    """
    Returnerer (ok, status, final_url, note).
    ok=True: siden virker
    ok=False: siden er nede
    ok=None: kan ikke verificere (rate-limited)
    note: streng med ekstra info eller None
    """
    ok, status, final_url = _single_check(url)

    # Retry ved timeout eller 429 - vent 4 sekunder og prøv igen
    if ok is False and status == 0 or ok is None:
        time.sleep(4)
        ok, status, final_url = _single_check(url)

    # Stadig 429 efter retry = kan ikke verificere
    if ok is None:
        return None, 429, url, "rate-limited"

    return ok, status, final_url, None


def detect_soft404(original_url, final_url):
    """
    Returnerer True hvis siden redirectede til en meget kortere URL.
    Kun relevant for bundle-links der peger paa specifikke produktsider.
    """
    if final_url == original_url:
        return False
    orig_path = urllib.parse.urlparse(original_url).path.rstrip("/")
    final_path = urllib.parse.urlparse(final_url).path.rstrip("/")
    if orig_path == final_path:
        return False
    orig_depth = len([s for s in orig_path.split("/") if s])
    final_depth = len([s for s in final_path.split("/") if s])
    return orig_depth >= 3 and final_depth < orig_depth / 2


def url_matches_product(dest_url, product_name):
    """
    Mindst eet noegleord fra produktnavnet skal findes i URL-stien.
    Bruges kun for hardware bundles.
    """
    path = urllib.parse.urlparse(dest_url).path.lower()
    skip = {"med", "og", "til", "fra", "sort", "hvid", "blue", "black", "white",
            "grey", "gray", "pro", "max", "plus", "mini", "wifi", "inkl", "mdr"}
    tokens = []
    for word in product_name.lower().replace("-", " ").split():
        if word not in skip and len(word) >= 4:
            tokens.append(word)
    if not tokens:
        return True
    return any(token in path for token in tokens)


def send_telegram(msg):
    url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage"
    data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10)


def fetch_all_links():
    items = []

    plans = supabase_get(
        "scraped_mobile_plans",
        "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
    )
    for p in plans:
        if p.get("link"):
            items.append({
                "label": p["provider_id"] + " - " + p["name"],
                "link": p["link"],
                "provider_id": p["provider_id"],
                "product_name": None,
                "type": "mobil",
            })

    inet = supabase_get(
        "scraped_internet_plans",
        "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
    )
    for p in inet:
        if p.get("link"):
            items.append({
                "label": "[internet] " + p["provider_id"] + " - " + p["name"],
                "link": p["link"],
                "provider_id": p["provider_id"],
                "product_name": None,
                "type": "internet",
            })

    bundles = supabase_get(
        "hardware_bundles",
        "status=eq.active&select=id,product_name,provider_id,link&link=not.is.null"
    )
    for b in bundles:
        if b.get("link"):
            items.append({
                "label": "[gave] " + b["provider_id"] + " - " + b["product_name"],
                "link": b["link"],
                "provider_id": b["provider_id"],
                "product_name": b["product_name"],
                "type": "bundle",
            })

    return items


def main():
    print("Starter link-tjek " + datetime.now().strftime("%Y-%m-%d %H:%M"))
    items = fetch_all_links()
    print("Tjekker " + str(len(items)) + " links...")

    # Tael antal links per udbyder for outage-detection
    provider_total = defaultdict(int)
    for item in items:
        provider_total[item["provider_id"]] += 1

    results = []

    for item in items:
        dest = extract_dest_url(item["link"])
        if not dest:
            dest = PROVIDER_URLS.get(item["provider_id"])
            if not dest:
                print("  SKIP: " + item["label"])
                continue

        ok, status, final_url, note = check_url(dest)
        results.append({
            "item": item,
            "dest": dest,
            "ok": ok,
            "status": status,
            "final_url": final_url,
            "note": note,
        })

        if ok is True:
            print("  OK " + str(status) + ": " + item["label"])
        elif ok is None:
            print("  SKIP (rate-limited): " + item["label"])
        else:
            print("  FEJL " + str(status) + ": " + item["label"])

    # Udbyder-nedetid: hvis >=3 links fra samme udbyder fejler OG >=60% af deres links fejler
    provider_failures = defaultdict(list)
    for r in results:
        if r["ok"] is False:
            provider_failures[r["item"]["provider_id"]].append(r)

    outage_providers = set()
    for pid, failures in provider_failures.items():
        total = provider_total[pid]
        if total >= 3 and len(failures) / total >= 0.6:
            outage_providers.add(pid)
            print("  NEDETID detekteret for: " + pid + " (" + str(len(failures)) + "/" + str(total) + " links fejler)")

    # Kategoriser resultater
    broken = []       # Harde fejl (ikke outage)
    warnings = []     # Soft 404 eller URL matcher ikke produkt
    unverified = []   # Rate-limited efter retry
    outages = []      # Udbyder-nedetid

    for r in results:
        item = r["item"]
        pid = item["provider_id"]

        if r["ok"] is False:
            if pid in outage_providers:
                # Samles under outage i stedet
                continue
            broken.append({"label": item["label"], "status": r["status"], "url": r["dest"]})
            continue

        if r["ok"] is None:
            unverified.append({"label": item["label"]})
            continue

        # ok=True - tjek for soft 404 og URL-match (kun bundles)
        if item["type"] == "bundle":
            if detect_soft404(r["dest"], r["final_url"]):
                warnings.append({
                    "label": item["label"],
                    "reason": "siden redirecter vaek fra produktsiden",
                    "original": r["dest"],
                    "final": r["final_url"],
                })
                continue
            if item["product_name"] and not url_matches_product(r["final_url"], item["product_name"]):
                warnings.append({
                    "label": item["label"],
                    "reason": "produktnavn matcher ikke URL",
                    "original": r["dest"],
                    "final": r["final_url"],
                })
                continue

    for pid in outage_providers:
        failures = provider_failures[pid]
        outages.append({
            "provider": pid,
            "count": len(failures),
            "total": provider_total[pid],
        })

    ok_count = sum(1 for r in results if r["ok"] is True
                   and r["item"]["provider_id"] not in outage_providers
                   and r["item"]["label"] not in [w["label"] for w in warnings])

    # Byg Telegram-besked
    date_str = datetime.now().strftime("%d. %b %Y")
    has_issues = broken or warnings or outages or unverified

    if not has_issues:
        msg = "<b>Link-tjek " + date_str + "</b>\n\nAlle " + str(ok_count) + " links OK."
    else:
        parts = ["<b>Link-tjek " + date_str + "</b>"]

        if outages:
            lines = ["<b>Udbydernedetid (tjek igen i morgen):</b>"]
            for o in outages:
                lines.append("- " + o["provider"] + ": " + str(o["count"]) + "/" + str(o["total"]) + " links fejler")
            parts.append("\n".join(lines))

        if broken:
            lines = ["<b>" + str(len(broken)) + " links er nede:</b>"]
            for b in broken:
                s = str(b["status"]) if b["status"] else "timeout"
                lines.append("- " + b["label"] + " (" + s + ")")
            parts.append("\n".join(lines))

        if warnings:
            lines = ["<b>" + str(len(warnings)) + " links skal tjekkes manuelt:</b>"]
            for w in warnings:
                lines.append("- " + w["label"])
                lines.append("  " + w["reason"])
            parts.append("\n".join(lines))

        if unverified:
            lines = ["<b>" + str(len(unverified)) + " links kunne ikke verificeres (rate-limited):</b>"]
            for u in unverified:
                lines.append("- " + u["label"])
            parts.append("\n".join(lines))

        parts.append("OK: " + str(ok_count) + " links.")
        msg = "\n\n".join(parts)

    send_telegram(msg)
    print("Telegram-besked sendt.")

    if broken or warnings:
        exit(1)


if __name__ == "__main__":
    main()
