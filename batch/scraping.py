from curl_cffi.requests import Session
from bs4 import BeautifulSoup
import requests
import os
from supabase import create_client,Client
from const import GEOCODE_KANTO
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
from urllib.parse import quote
import time
import re
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

def insertEstates(geocode):
    print(f"処理開始:{geocode}")
    
    supabase.table("estates").delete().eq("geo_code", geocode).execute()
    print(f"削除完了:{geocode}")
    # 以下の処理を、GEOCODEの数だけ繰り返し処理する

    # まずは、物件の総件数を取得する
    soup = getSoup(f"{BASE_URL}?geo={geocode}&info_open=7")

    countNode= soup.find(class_="ListSearchTool__count")
    for child in countNode.find_all():
        child.decompose()

    # 全物件の件数を取得
    estateCount = int(countNode.getText().strip().replace(",", ""))
    totalPage = min(estateCount//30 + 1, 30)
    print(f"Total pages: {totalPage}")
    dataArray = []
    for page in range(1, totalPage + 1):
        print(f"Processing page {page}...")
        estateArray=[]
        retry_count = 0

        while len(estateArray) < 1:
            print("取得します")
            prev_url = f"{BASE_URL}?geo={geocode}&page={page - 1}" if page > 1 else BASE_URL
            soup = getSoup(f"{BASE_URL}?geo={geocode}&page={page}&info_open=7", referer=prev_url)
            estateArray = soup.find_all(class_="ListBukken__item")

            if len(estateArray) < 1:
                break

        resultArray = []
        for estate in estateArray:
            estateSoup = BeautifulSoup(str(estate), "html.parser") 
            name=estateSoup.find(class_="ListCassette__ttl__link").getText()
            address = estateSoup.find(class_="svg--pin--simple").find_next_sibling().getText()
            address = re.sub(r'\d+', lambda m: str(int(m.group())), address)
            if any(data["address"] == address for data in dataArray):
                print(f"同名の住所が存在します:{address}")
                continue
            rentPriceNode = estateSoup.find(class_="ListCassetteRoom__dtl__price")
            rentPriceNode.find().decompose()
            rentPrice = int(float(rentPriceNode.getText().strip().split("万")[0])*10000)
            feeInfoNode = estateSoup.find(class_="ListCassetteRoom__dtl__price__txtS")
            feeInfo = feeInfoNode.getText().strip() if feeInfoNode else None
            for attempt in range(3):
                try:
                    xmlResponse = requests.get(f"https://map.yahooapis.jp/geocode/V1/geoCoder?appid={os.environ['YAHOO_API_CLIENT_ID']}&query={quote(address, encoding='utf-8')}", timeout=10)
                    break
                except requests.exceptions.ConnectionError as e:
                    print(f"接続エラー({attempt+1}回目): {e}")
                    if attempt < 2:
                        time.sleep(5)
            else:
                print(f"ジオコーディング失敗のためスキップ: {address}")
                continue
            root = ET.fromstring(xmlResponse.content)
            ns = {"ydf": "http://olp.yahooapis.jp/ydf/1.0"}
            coordinates = root.find(".//ydf:Feature/ydf:Geometry/ydf:Coordinates", ns)
            if coordinates is not None:
                coordinates_text = coordinates.text
                lng, lat = map(float, coordinates_text.split(","))
                print(f"Address: {address}, Latitude: {lat}, Longitude: {lng}")
                data = {"name": name, "address": address, "rent_price": rentPrice, "fee_info": feeInfo, "geo_code": geocode, "latitude": lat, "longitude": lng}
                dataArray.append(data)
    if(len(dataArray) > 0):
        supabase.table("estates").insert(dataArray).execute()
        supabase.functions.invoke(
            "set-geom",
            invoke_options={"body": {"name": "Functions"}}
        )



for geocode in GEOCODE_KANTO:
    insertEstates(geocode)

print("batch completed")