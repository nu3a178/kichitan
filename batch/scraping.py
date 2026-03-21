from curl_cffi.requests import Session
from bs4 import BeautifulSoup
import json
import os
from supabase import create_client,Client
from const import GEOCODE_KANTO
from dotenv import load_dotenv
import subprocess
import time
import random
load_dotenv()

supabase_url = os.environ["VITE_SUPABASE_URL"]
supabase_key = os.environ["VITE_SUPABASE_ANON_KEY"]

supabase: Client = create_client(supabase_url, supabase_key)

BASE_URL = "https://realestate.yahoo.co.jp/rent/search/"

# impersonate="chrome124" でChromeのTLSフィンガープリントを模倣する
session = Session(impersonate="chrome124")

def getSoup(url, referer=BASE_URL):
    response = session.get(url, headers={"Referer": referer})
    return BeautifulSoup(response.text, "html.parser")

supabase.table("estates").delete().eq("geo_code", GEOCODE_KANTO[0]).execute()
print("削除完了")
# 以下の処理を、GEOCODEの数だけ繰り返し処理する

# まずは、物件の総件数を取得する
soup = getSoup(f"{BASE_URL}?geo={GEOCODE_KANTO[0]}")

countNode= soup.find(class_="ListSearchTool__count")
for child in countNode.find_all():
    child.decompose()

# 全物件の件数を取得
estateCount = int(countNode.getText().strip().replace(",", ""))
totalPage = estateCount//30 + 1
print(f"Total pages: {totalPage}")
dataArray = []
for page in range(1, totalPage + 1):
    print(f"Processing page {page}...")
    estateArray=[]
    retry_count = 0

    while len(estateArray) < 1:
        print("取得します")
        prev_url = f"{BASE_URL}?geo={GEOCODE_KANTO[0]}&page={page - 1}" if page > 1 else BASE_URL
        soup = getSoup(f"{BASE_URL}?geo={GEOCODE_KANTO[0]}&page={page}", referer=prev_url)
        estateArray = soup.find_all(class_="ListBukken__item")

        if len(estateArray) < 1:
            retry_count += 1
            if retry_count >= 3:
                print(f"page {page}: 3回試行しても取得できなかったためスキップします")
                break
            wait = 30 * retry_count
            print(f"取得できませんでした。{wait}秒後に再取得します… (試行{retry_count}回目)")
            time.sleep(wait)

    time.sleep(random.uniform(3.0, 7.0))
    resultArray = []
    for estate in estateArray:
        estateSoup = BeautifulSoup(str(estate), "html.parser") 
        name=estateSoup.find(class_="ListCassette__ttl__link").getText()
        address = estateSoup.find(class_="svg--pin--simple").find_next_sibling().getText()
        rentPriceNode = estateSoup.find(class_="ListCassetteRoom__dtl__price")
        rentPriceNode.find().decompose()
        rentPrice = int(float(rentPriceNode.getText().strip().split("万")[0])*10000)
        feeInfoNode = estateSoup.find(class_="ListCassetteRoom__dtl__price__txtS")
        feeInfo = feeInfoNode.getText().strip() if feeInfoNode else None
        data = {"name": name, "address": address, "rent_price": rentPrice, "fee_info": feeInfo,"geo_code": GEOCODE_KANTO[0]}
        dataArray.append(data)
dataString =json.dumps(dataArray)
result= subprocess.run(["node", "geocode.js", json.dumps(list(map(lambda x: x["address"], dataArray)))], capture_output=True, text=True)

points = json.loads(result.stdout)

for data,point in zip(dataArray, points):
    data["latitude"] = point["lat"]
    data["longitude"] = point["lng"]

supabase.table("estates").insert(dataArray).execute()
supabase.functions.invoke(
    "set-geom",
    invoke_options={"body": {"name": "Functions"}}
)

print("batch completed")