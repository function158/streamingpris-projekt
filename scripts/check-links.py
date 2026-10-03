#!/usr/bin/env python3
"""
Daglig link-tjekker for mineudgifter.dk
Henter aktive planer fra Supabase, udtrækker destination-URL fra affiliate-links
og checker om siderne stadig er tilgængelige.
"""

import os
import json
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]
TELEGRAM_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

# Fallback direkte URL hvis affiliate-link ikke har url= param
PROVIDER_URLS = {
    "telmore":    "https://www.telmore.dk/",
    "cbb":        "https://www.cbb.dk/",
    "oister":     "https://www.oister.dk/",
    "flexii":     "https://www.flexii.dk/",
    "eesy":       "https://www.eesy.dk/",
    "lebara":     "https://www.lebara.dk/",
    "lyca-mobile":"https://www.lycamobile.dk/",
    "duka":       "https://www.dukatale.dk/",
    "greentel":   "https://www.greentel.dk/",
    "yousee":     "https://www.yousee.dk/",
    "3":          "https://www.3.dk/",
    "hiper":      "https://www.hiper.dk/",
    "ewii":       "https://www.ewii.dk/",
    "norlys":     "https://www.norlys.dk/",
    "bornfiber":  "https://www.bornfiber.dk/",
    "allente":    "https://www.allente.dk/",
    "nextory":    "https://www.nextory.dk/",
    "bookbeat":   "https://bookbeat.com/dk/",
    "mofibo":     "https://www.mofibo.com/dk/",
}


def supabase_get(table, params):
      import http.client, ssl
      host = "jrjwronitlemdnctzkdj.supabase.co"
      path = f"/rest/v1/{table}?{params}"
      conn = http.client.HTTPSConnection(host, context=ssl.create_default_context(),
  timeout=10)
      conn.request("GET", path, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer
  {SUPABASE_KEY}"})
      r = conn.getresponse()
      data = r.read()
      conn.close()
      if r.status != 200:
          raise Exception(f"Supabase {r.status}: {data[:200]}")
      return json.loads(data)


def extract_dest_url(affiliate_link):
    """Udtræk url= parameteren fra affiliate-link. Returnerer None hvis ikke fundet."""
    parsed = urllib.parse.urlparse(affiliate_link)
    qs = urllib.parse.parse_qs(parsed.query)
    if "url" in qs:
        return urllib.parse.unquote(qs["url"][0])
    return None


def check_url(url):
    """
    Returnerer (ok: bool, status: int, final_url: str).
    Følger redirects. Bruger HEAD, fallback til GET.
    """
    try:
        req = urllib.request.Request(
            url,
            method="HEAD",
            headers={"User-Agent": "Mozilla/5.0 (compatible; link-checker/1.0)"},
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            return True, r.status, r.url
    except urllib.error.HTTPError as e:
        if e.code in (405, 403):
            # HEAD ikke tilladt — prøv GET
            try:
                req2 = urllib.request.Request(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; link-checker/1.0)"},
                )
                with urllib.request.urlopen(req2, timeout=10) as r:
                    return True, r.status, r.url
            except Exception:
                pass
        return False, e.code, url
    except Exception as e:
        return False, 0, url


def send_telegram(msg):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10)


def fetch_all_links():
    items = []

    # Mobilabonnementer
    plans = supabase_get(
        "scraped_mobile_plans",
        "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
    )
    for p in plans:
        if p.get("link"):
            items.append({"id": p["id"], "label": f"{p['provider_id']} – {p['name']}", "link": p["link"], "provider_id": p["provider_id"]})

    # Internetabonnementer
    inet = supabase_get(
        "scraped_internet_plans",
        "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
    )
    for p in inet:
        if p.get("link"):
            items.append({"id": p["id"], "label": f"[internet] {p['provider_id']} – {p['name']}", "link": p["link"], "provider_id": p["provider_id"]})

    # Hardware bundles
    bundles = supabase_get(
        "hardware_bundles",
        "status=eq.active&select=id,product_name,provider_id,link&link=not.is.null"
    )
    for b in bundles:
        if b.get("link"):
            items.append({"id": b["id"], "label": f"[gave] {b['provider_id']} – {b['product_name']}", "link": b["link"], "provider_id": b["provider_id"]})

    return items


def main():
    print(f"Starter link-tjek {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    items = fetch_all_links()
    print(f"Tjekker {len(items)} links...")

    broken = []
    ok_count = 0

    for item in items:
        dest = extract_dest_url(item["link"])
        if not dest:
            # Ingen url= param — brug provider fallback URL
            dest = PROVIDER_URLS.get(item["provider_id"])
            if not dest:
                print(f"  SKIP (ingen URL): {item['label']}")
                continue

        ok, status, final_url = check_url(dest)
        if ok:
            ok_count += 1
            print(f"  OK {status}: {item['label']}")
        else:
            broken.append({"label": item["label"], "status": status, "url": dest})
            print(f"  FEJL {status}: {item['label']} → {dest}")

    # Byg Telegram-besked
    date_str = datetime.now().strftime("%-d. %b %Y")

    if not broken:
        msg = (
            f"✅ <b>Link-tjek {date_str}</b>\n\n"
            f"Alle {ok_count} links OK."
        )
    else:
        lines = [f"⚠️ <b>Link-tjek {date_str}</b>\n"]
        lines.append(f"<b>{len(broken)} links skal tjekkes:</b>\n")
        for b in broken:
            status_str = str(b["status"]) if b["status"] else "timeout"
            lines.append(f"❌ {b['label']} ({status_str})")
        lines.append(f"\n✅ {ok_count} links OK.")
        msg = "\n".join(lines)

    send_telegram(msg)
    print("Telegram-besked sendt.")

    if broken:
        exit(1)


if __name__ == "__main__":
    main()
