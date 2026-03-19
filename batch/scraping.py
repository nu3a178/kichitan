import requests
from bs4 import BeautifulSoup
import json
import os
from supabase import create_client,Client
from const import GEOCODE_KANTO
from dotenv import load_dotenv
import subprocess
load_dotenv()

supabase_url = os.environ["VITE_SUPABASE_URL"]
supabase_key = os.environ["VITE_SUPABASE_ANON_KEY"]

supabase: Client = create_client(supabase_url, supabase_key)

supabase.table("estates").delete().eq("geo_code", GEOCODE_KANTO[0]).execute()
print("削除完了")
# 以下の処理を、GEOCODEの数だけ繰り返し処理する

# まずは、物件の総件数を取得する
response = requests.get(f"https://realestate.yahoo.co.jp/rent/search/?geo={GEOCODE_KANTO[0]}")

soup = BeautifulSoup(response.text, "html.parser")
countNode= soup.find(class_="ListSearchTool__count")
for child in countNode.find_all():
    child.decompose()
    
    
# 全物件の件数を取得
estateCount = int(countNode.getText().strip().replace(",", ""))
# totalPage = estateCount//30 +
totalPage=2
print(f"Total pages: {totalPage}")
dataArray = []
for page in range(1, totalPage + 1):
    print(f"Processing page {page}...")
    pageHtml = requests.get(f"https://realestate.yahoo.co.jp/rent/search/?geo={GEOCODE_KANTO[0]}&page={page}")
    soup = BeautifulSoup(pageHtml.text, "html.parser")
    estateArray = soup.find_all(class_="ListBukken__item")
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
print("ジオコーディング中…")
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