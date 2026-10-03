#!/usr/bin/env python3
  """
  Daglig link-tjekker for mineudgifter.dk
  Henter aktive planer fra Supabase, udtrækker destination-URL fra affiliate-links
  og checker om siderne stadig er tilgaengelige.
  """

  import os

  SUPABASE_URL = os.environ["SUPABASE_URL"]
  SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]
  TELEGRAM_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
  TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

  HEADERS = {"apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY}

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
      url = SUPABASE_URL + "/rest/v1/" + table + "?" + params
      req = urllib.request.Request(url, headers=HEADERS)
      with urllib.request.urlopen(req, timeout=10) as r:
          return json.loads(r.read())


  def extract_dest_url(affiliate_link):
      parsed = urllib.parse.urlparse(affiliate_link)
      qs = urllib.parse.parse_qs(parsed.query)
      if "url" in qs:
          return urllib.parse.unquote(qs["url"][0])
      return None


  def check_url(url):
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
      except Exception:
          return False, 0, url


  def send_telegram(msg):
      url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage"
      data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode":
  "HTML"}).encode()
      req = urllib.request.Request(url, data=data, headers={"Content-Type":
  "application/json"})
      urllib.request.urlopen(req, timeout=10)


  def fetch_all_links():
      items = []

      plans = supabase_get(
          "scraped_mobile_plans",
          "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
      )
      for p in plans:
          if p.get("link"):
              items.append({"id": p["id"], "label": p["provider_id"] + " - " + p["name"],
  "link": p["link"], "provider_id": p["provider_id"]})

      inet = supabase_get(
          "scraped_internet_plans",
          "status=eq.active&select=id,name,provider_id,link&link=not.is.null"
      )
      for p in inet:
          if p.get("link"):
              items.append({"id": p["id"], "label": "[internet] " + p["provider_id"] + " -
  " + p["name"], "link": p["link"], "provider_id": p["provider_id"]})

      bundles = supabase_get(
          "hardware_bundles",
          "status=eq.active&select=id,product_name,provider_id,link&link=not.is.null"
      )
      for b in bundles:
          if b.get("link"):
              items.append({"id": b["id"], "label": "[gave] " + b["provider_id"] + " - " +
  b["product_name"], "link": b["link"], "provider_id": b["provider_id"]})

      return items


  def main():
      print("Starter link-tjek " + datetime.now().strftime("%Y-%m-%d %H:%M"))
      items = fetch_all_links()
      print("Tjekker " + str(len(items)) + " links...")

      broken = []
      ok_count = 0

      for item in items:
          dest = extract_dest_url(item["link"])
          if not dest:
              dest = PROVIDER_URLS.get(item["provider_id"])
              if not dest:
                  print("  SKIP (ingen URL): " + item["label"])
                  continue

          ok, status, final_url = check_url(dest)
          if ok:
              ok_count += 1
              print("  OK " + str(status) + ": " + item["label"])
          else:
              broken.append({"label": item["label"], "status": status, "url": dest})
              print("  FEJL " + str(status) + ": " + item["label"] + " -> " + dest)

      date_str = datetime.now().strftime("%d. %b %Y")

      if not broken:
          msg = "<b>Link-tjek " + date_str + "</b>\n\nAlle " + str(ok_count) + " links OK."
      else:
          lines = ["<b>Link-tjek " + date_str + "</b>\n"]
          lines.append("<b>" + str(len(broken)) + " links skal tjekkes:</b>\n")
          for b in broken:
              status_str = str(b["status"]) if b["status"] else "timeout"
              lines.append("FEJL: " + b["label"] + " (" + status_str + ")")
          lines.append("\nOK: " + str(ok_count) + " links OK.")
          msg = "\n".join(lines)

      send_telegram(msg)
      print("Telegram-besked sendt.")

      if broken:
          exit(1)


  if __name__ == "__main__":
      main()
