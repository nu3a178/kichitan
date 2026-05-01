from curl_cffi.requests import Session
from bs4 import BeautifulSoup
import os
import requests
from const import GEOCODE_LISTS
from dotenv import load_dotenv
import re
import json
from datetime import date
load_dotenv()

BASE_URL = f"{os.environ['YAHOO_ESTATE_DOMAIN']}/rent/search/"
DOMAIN = os.environ["DB_DEV"] if os.environ["ENV"] == "development" else os.environ["DB_PROD"]
# impersonate="chrome124" でChromeのTLSフィンガープリントを模倣する
session = Session(impersonate="chrome124")


def getSoup(url, referer=BASE_URL):
    response = session.get(url, headers={"Referer": referer})
    return BeautifulSoup(response.text, "html.parser")

soup = getSoup(BASE_URL)
countNode= soup.find(class_="ListSearchTool__count")
for child in countNode.find_all():
        child.decompose()
totalJapanEstateCount = int(countNode.getText().strip().replace(",", ""))        

def insertEstates(geocode):
    # dev環境の場合、千代田区の物件1件のみを取得する
    if(os.environ["ENV"]=="development" and geocode!="13101"):
        return
    datetime = date.today().strftime("%Y-%m-%d")
    is_existing_estates = requests.get(f"{DOMAIN}/estates?geo_code={geocode}&date={datetime}")
    if(len(is_existing_estates.json()) > 0):
        print(f"本日はすでに取得済です:{geocode}")
        return
    print(f"処理開始:{geocode}")
    
    # 以下の処理を、GEOCODEの数だけ繰り返し処理する

    # まずは、物件の総件数を取得する
    soup = getSoup(f"{BASE_URL}?geo={geocode}&info_open=7")

    countNode= soup.find(class_="ListSearchTool__count")
    for child in countNode.find_all():
        child.decompose()

    # 全物件の件数を取得
    estateCount = int(countNode.getText().strip().replace(",", ""))
    if(estateCount == totalJapanEstateCount):
        print(f"このジオコードは無効です。スキップします:{geocode}")
        return
    totalPage = 1 if os.environ["ENV"] == "development" else min(estateCount//30 + 1, 30)
    print(f"Total pages: {totalPage}")
    dataArray = []

    for page in range(totalPage):
        print(f"Processing page {page}...")
        estateArray=[]

        print("取得します")
        prev_url = f"{BASE_URL}?geo={geocode}&page={page - 1}" if page > 1 else BASE_URL
        soup = getSoup(f"{BASE_URL}?geo={geocode}&page={page}&info_open=7", referer=prev_url)
        estateArray = soup.find_all(class_="ListBukken__item")
        if len(estateArray) < 1:
            break
        
        for index in range(1) if os.environ["ENV"] == "development" else range(len(estateArray)):
            estate = estateArray[index]
            estateSoup = BeautifulSoup(str(estate), "html.parser") 
            name=estateSoup.find(class_="ListCassette__ttl__link").getText()
            address = estateSoup.find(class_="svg--pin--simple").find_next_sibling().getText()
            address = re.sub(r'\d+', lambda m: str(int(m.group())), address)
            img = estateSoup.find(class_="ListCassette__thumb__img").get("src")
            url=estateSoup.find(class_="ListCassetteRoom__textLink").get("href")
            rentPriceNode = estateSoup.find(class_="ListCassetteRoom__dtl__price")
            rentPriceNode.find().decompose()
            rentPrice = int(float(rentPriceNode.getText().strip().split("万")[0])*10000)
            feeInfoNode = estateSoup.find(class_="ListCassetteRoom__dtl__price__txtS")
            feeInfo = feeInfoNode.getText().strip() if feeInfoNode else None
            detailSoup = getSoup(f"{os.environ['YAHOO_ESTATE_DOMAIN']}{url}")
            script_tag = detailSoup.find('script', string=re.compile(r'__SERVER_SIDE_CONTEXT__'))
            if script_tag is None:
                print(f"座標取得失敗のためスキップ: {address}")
                continue
            coords_match = re.search(r'"CoordinatesWgs"\s*:\s*"([^"]+)"', script_tag.string)
            if coords_match is None:
                print(f"座標取得失敗のためスキップ: {address}")
                continue
            lat, lng = map(float, coords_match.group(1).split(","))
            if any(data["latitude"] == lat and data["longitude"] == lng for data in dataArray):
                print(f"同名の座標が存在します:{address}")
                continue
            script = script_tag.string
            floor_plan_match = re.search(r'"RoomLayoutBreakdown"\s*:\s*"([^"]+)"', script)
            area_match = re.search(r'"MonopolyArea"\s*:\s*(\d+)', script)
            years_old_match = re.search(r'"YearsOld"\s*:\s*(\d+)', script)
            floor_num_match = re.search(r'"FloorNum"\s*:\s*"([^"]+)"', script)
            floor_plan = json.loads(f'"{floor_plan_match.group(1)}"') if floor_plan_match else None
            area = int(area_match.group(1)) / 100 if area_match else None
            years_old = int(years_old_match.group(1)) if years_old_match else None
            floor_num = floor_num_match.group(1) if floor_num_match else None
            print(f"Address: {address}, Latitude: {lat}, Longitude: {lng}")
            data = {"name": name, "address": address, "rent_price": rentPrice, "fee_info": feeInfo, "geo_code": geocode, "latitude": lat, "longitude": lng, "img": img, "url": url, "floor_plan": floor_plan, "area": area, "years_old": years_old, "floor_num": floor_num}
            dataArray.append(data)
                
    print(f"更新開始:{geocode}")

    requests.delete(f"{DOMAIN}/estates?geo_code={geocode}")
    requests.post(f"{DOMAIN}/estates", json=dataArray)
    requests.post(f"{DOMAIN}/set_geom?geo_code={geocode}")

geocodes = GEOCODE_LISTS[int(os.environ.get("CLOUD_RUN_TASK_INDEX", 0))]
if os.environ.get("CLOUD_RUN_TASK_SUB_INDEX", ""):
    sub_index = int(os.environ["CLOUD_RUN_TASK_SUB_INDEX"])
    total_sub_index = int(os.environ["CLOUD_RUN_TOTAL_SUB_INDEX"])
    geocodes = geocodes[sub_index::total_sub_index]  # Adjust the slicing based on the number of sub-tasks
for geocode in geocodes:
    try:
        insertEstates(geocode)
    except Exception as e:
        print(f"Error processing geocode {geocode}: {e}")

print("batch completed")