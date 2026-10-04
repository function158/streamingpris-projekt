import os
import json
import time
import html as _html
import urllib.request
import urllib.parse
import urllib.error
import http.client
import ssl
from datetime import datetime
from collections import defaultdict

SUPABASE_HOST = "jrjwronitlemdnctzkdj.supabase.co"
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]  # GitHub secret: SUPABASE_ANON_KEY
TELEGRAM_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

PREV_FAILURES_FILE = "link-check-prev-failures.json"

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

# Fejlfraser der indikerer en fejlside selv om HTTP-status er 200.
# "404" er udeladt: matcher CSS-klasser, farvekoder og tracking-ID'er i <head>.
ERROR_PHRASES = [
    "siden findes ikke",
    "page not found",
    "vi kan ikke finde",
    "ikke fundet",
    "product not found",
    "produktet findes ikke",
    "denne side eksisterer ikke",
    "no longer available",
    "er udgaaet",
    "er udgaaet",
    "vi har desvaerre ikke",
    "vi har desvaerre ikke",
    "beklager, vi kan ikke",
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
]

_ua_index = 0


def next_user_agent():
    global _ua_index
    ua = USER_AGENTS[_ua_index % len(USER_AGENTS)]
    _ua_index += 1
    return ua


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


def _do_request(url, method="HEAD"):
    ua = next_user_agent()
    req = urllib.request.Request(
        url,
        method=method,
        headers={
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "da-DK,da;q=0.9,en;q=0.8",
        },
    )
    return urllib.request.urlopen(req, timeout=12)


def _single_check(url, fetch_body=False):
    """
    Returnerer (ok, status, final_url, body_bytes).
    ok=None: kan ikke verificeres (429, 503, 403 paa GET).
    """
    body = b""
    try:
        with _do_request(url, method="HEAD") as r:
            final_url = r.url
            status = r.status
            if fetch_body:
                try:
                    with _do_request(url, method="GET") as r2:
                        body = r2.read(65536)  # 64 KB saa indhold naas
                except Exception:
                    pass
            return True, status, final_url, body
    except urllib.error.HTTPError as e:
        # Ændring 3: 429 og 503 = kan ikke verificere
        if e.code in (429, 503):
            return None, e.code, url, body
        if e.code in (405, 403):
            # HEAD ikke tilladt - prøv GET
            try:
                with _do_request(url, method="GET") as r:
                    body = r.read(65536) if fetch_body else b""
                    return True, r.status, r.url, body
            except urllib.error.HTTPError as e2:
                # Ændring 3: 429, 503 og 403 paa GET = kan ikke verificere
                if e2.code in (429, 503, 403):
                    return None, e2.code, url, body
                return False, e2.code, url, body
            except Exception:
                return False, 0, url, body
        return False, e.code, url, body
    except Exception:
        return False, 0, url, body


def check_url(url, fetch_body=False):
    """Returnerer (ok, status, final_url, body_bytes). Retry ved timeout og rate-limit."""
    ok, status, final_url, body = _single_check(url, fetch_body=fetch_body)

    if (ok is False and status == 0) or ok is None:
        time.sleep(5)
        ok, status, final_url, body = _single_check(url, fetch_body=fetch_body)

    return ok, status, final_url, body


def detect_soft404_by_redirect(original_url, final_url):
    """
    Returnerer (is_soft404, reason).
    Kører for alle typer (mobil, internet, bundle).
    Redirect til forsiden er altid en fejl.
    """
    orig_path = urllib.parse.urlparse(original_url).path.rstrip("/")
    final_path = urllib.parse.urlparse(final_url).path.rstrip("/")

    if orig_path == final_path:
        return False, None

    # Redirect til forsiden er altid en fejl hvis original havde en sti
    if orig_path and final_path == "":
        return True, "redirect til forsiden"

    orig_depth = len([s for s in orig_path.split("/") if s])
    final_depth = len([s for s in final_path.split("/") if s])
    if orig_depth >= 3 and final_depth < orig_depth / 2:
        return True, "redirect vaek fra produktsiden"

    return False, None


def detect_soft404_by_content(body_bytes):
    """
    True hvis body indeholder danske/engelske fejlfraser.
    Stoerrelsesbegrænsning er fjernet - 64 KB sikrer at indhold naaes.
    """
    if not body_bytes:
        return False
    text = body_bytes.decode("utf-8", errors="ignore").lower()
    return any(phrase in text for phrase in ERROR_PHRASES)


def url_matches_product(dest_url, product_name):
    """Mindst eet noegleord fra produktnavnet skal findes i URL-stien (bundles)."""
    path = urllib.parse.urlparse(dest_url).path.lower()
    skip = {"med", "og", "til", "fra", "sort", "hvid", "blue", "black", "white",
            "grey", "gray", "plus", "mini", "wifi", "inkl", "mdr", "2024", "2025"}
    tokens = []
    for word in product_name.lower().replace("-", " ").split():
        if word not in skip and len(word) >= 4:
            tokens.append(word)
    if not tokens:
        return True
    return any(token in path for token in tokens)


def failure_key(item):
    """Stabil noegle til 2-dages-tæller: 'type:id'. Upåvirket af navneændringer."""
    return item["type"] + ":" + item["id"]


def load_prev_failures():
    """Indlaes failures fra forrige koersel. Gamle label-baserede nøgler ignoreres stille."""
    if os.path.exists(PREV_FAILURES_FILE):
        try:
            with open(PREV_FAILURES_FILE, "r") as f:
                return set(json.load(f))
        except Exception:
            pass
    return set()


def save_current_failures(failure_keys):
    try:
        with open(PREV_FAILURES_FILE, "w") as f:
            json.dump(list(failure_keys), f)
    except Exception:
        pass


def tg_link(label, url):
    """Klikbart HTML-link til Telegram. Escaper label-tekst så & og < ikke ødelægger parse_mode=HTML."""
    return '<a href="' + url + '">' + _html.escape(label) + '</a>'


def send_telegram(msg):
    url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage"
    data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10)


def send_telegram_sections(sections):
    """Send sektioner som én eller flere beskeder, opdelt ved sektionsgrænser ved >4096 tegn."""
    MAX = 4096
    batch = []
    batch_len = 0
    for section in sections:
        cost = len(section) + (2 if batch else 0)  # +2 for \n\n separator
        if batch and batch_len + cost > MAX:
            send_telegram("\n\n".join(batch))
            batch = []
            batch_len = 0
        batch.append(section)
        batch_len += cost
    if batch:
        send_telegram("\n\n".join(batch))


_last_domain_request = {}


def throttle_domain(url):
    """Sørger for mindst 3 sekunders afstand mellem kald til samme domæne."""
    domain = urllib.parse.urlparse(url).netloc
    gap = time.time() - _last_domain_request.get(domain, 0)
    if gap < 3.0:
        time.sleep(3.0 - gap)
    _last_domain_request[domain] = time.time()


def round_robin_items(items):
    """Fletter items så alle udbydere skiftes (round-robin på provider_id).
    Undgår at tjekke alle links fra én udbyder i træk."""
    groups = defaultdict(list)
    for item in items:
        groups[item["provider_id"]].append(item)
    provider_ids = list(groups.keys())
    result = []
    while any(groups[pid] for pid in provider_ids):
        for pid in provider_ids:
            if groups[pid]:
                result.append(groups[pid].pop(0))
    return result


def fetch_all_links():
    items = []

    plans = supabase_get(
        "scraped_mobile_plans",
        "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
    )
    for p in plans:
        if p.get("link"):
            items.append({
                "id": p["id"],
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
                "id": p["id"],
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
                "id": b["id"],
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

    prev_failures = load_prev_failures()
    print("Kendte fejl fra forrige koersel: " + str(len(prev_failures)))

    provider_total = defaultdict(int)
    for item in items:
        provider_total[item["provider_id"]] += 1

    items = round_robin_items(items)

    results = []

    for item in items:
        extracted = extract_dest_url(item["link"])
        is_fallback = extracted is None
        dest = extracted if extracted else PROVIDER_URLS.get(item["provider_id"])
        if not dest:
            print("  SKIP: " + item["label"])
            continue

        # Body kun for bundles - bruges til indholdsbaseret soft 404
        fetch_body = item["type"] == "bundle" and not is_fallback
        throttle_domain(dest)
        ok, status, final_url, body = check_url(dest, fetch_body=fetch_body)

        results.append({
            "item": item,
            "dest": dest,
            "is_fallback": is_fallback,
            "ok": ok,
            "status": status,
            "final_url": final_url,
            "body": body,
        })

        if ok is True:
            print("  OK " + str(status) + ": " + item["label"])
        elif ok is None:
            print("  SKIP (ikke verificerbar): " + item["label"])
        else:
            print("  FEJL " + str(status) + ": " + item["label"])

    # Udbyder-nedetid: >=3 links fra samme udbyder fejler OG >=60%
    provider_failures = defaultdict(list)
    for r in results:
        if r["ok"] is False:
            provider_failures[r["item"]["provider_id"]].append(r)

    outage_providers = set()
    for pid, failures in provider_failures.items():
        total = provider_total[pid]
        if total >= 3 and len(failures) / total >= 0.6:
            outage_providers.add(pid)
            print("  NEDETID: " + pid + " (" + str(len(failures)) + "/" + str(total) + ")")

    current_failure_keys = set()
    broken = []
    warnings = []
    unverified = []
    outages = []

    for r in results:
        item = r["item"]
        pid = item["provider_id"]
        label = item["label"]
        fkey = failure_key(item)

        if r["ok"] is False:
            current_failure_keys.add(fkey)
            if pid in outage_providers:
                continue
            if fkey in prev_failures:
                broken.append({"label": label, "status": r["status"], "url": r["dest"]})
            else:
                print("  IKKE ALERTET (foerste gang): " + label)
            continue

        if r["ok"] is None:
            unverified.append({"label": label, "url": r["dest"]})
            continue

        # ok=True: redirect-tjek for ALLE typer (ikke fallback-links)
        if not r["is_fallback"]:
            is_soft, reason = detect_soft404_by_redirect(r["dest"], r["final_url"])
            if is_soft:
                current_failure_keys.add(fkey)
                # Redirect til forsiden alertes altid (dag 1); andre redirect-fejl efter 2 dage
                if reason == "redirect til forsiden" or fkey in prev_failures:
                    warnings.append({"label": label, "reason": reason, "url": r["final_url"]})
                continue

        # Bundle-specifikke tjek (ikke fallback-links)
        if item["type"] == "bundle" and not r["is_fallback"]:
            if detect_soft404_by_content(r["body"]):
                current_failure_keys.add(fkey)
                if fkey in prev_failures:
                    warnings.append({"label": label, "reason": "siden returnerer fejlindhold (2 dage i traek)", "url": r["final_url"]})
                continue

            if item["product_name"] and not url_matches_product(r["final_url"], item["product_name"]):
                current_failure_keys.add(fkey)
                if fkey in prev_failures:
                    warnings.append({"label": label, "reason": "produktnavn matcher ikke URL", "url": r["final_url"]})
                continue

    for pid in outage_providers:
        failures = provider_failures[pid]
        if any(failure_key(r["item"]) in prev_failures for r in failures):
            outages.append({
                "provider": pid,
                "count": len(failures),
                "total": provider_total[pid],
            })
        else:
            print("  OUTAGE IKKE ALERTET (foerste dag): " + pid)

    save_current_failures(current_failure_keys)

    ok_count = len([r for r in results if r["ok"] is True
                    and r["item"]["label"] not in [w["label"] for w in warnings]])

    date_str = datetime.now().strftime("%d. %b %Y")
    has_issues = broken or warnings or outages

    if not has_issues:
        send_telegram("<b>Link-tjek " + date_str + "</b>\n\nAlle " + str(ok_count) + " links OK.")
    else:
        sections = ["<b>Link-tjek " + date_str + "</b>"]

        if outages:
            lines = ["<b>Udbydernedetid (2+ dage):</b>"]
            for o in outages:
                lines.append("- " + _html.escape(o["provider"]) + ": " + str(o["count"]) + "/" + str(o["total"]) + " links")
            sections.append("\n".join(lines))

        if broken:
            lines = ["<b>" + str(len(broken)) + " links er nede (2+ dage):</b>"]
            for b in broken:
                s = str(b["status"]) if b["status"] else "timeout"
                lines.append("- " + tg_link(b["label"], b["url"]) + " (" + s + ")")
            sections.append("\n".join(lines))

        if warnings:
            lines = ["<b>" + str(len(warnings)) + " tilbud skal tjekkes:</b>"]
            for w in warnings:
                lines.append("- " + tg_link(w["label"], w["url"]))
                lines.append("  " + _html.escape(w["reason"]))
            sections.append("\n".join(lines))

        if unverified:
            lines = ["<b>Ikke verificeret (rate-limited/blokeret):</b>"]
            for u in unverified:
                lines.append("- " + tg_link(u["label"], u["url"]))
            sections.append("\n".join(lines))

        sections.append("OK: " + str(ok_count) + " links.")
        send_telegram_sections(sections)

    print("Telegram-besked sendt.")

    if broken or warnings:
        exit(1)


if __name__ == "__main__":
    main()
