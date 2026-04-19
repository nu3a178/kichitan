### 概要

駅と移動手段、所要時間を入力することで、その駅から到達可能な物件を地図上にリストアップできるアプリケーションです。

Web上の公開はまだ想定していません。
<img width="1728" height="889" alt="Image" src="https://github.com/user-attachments/assets/fcc38c1f-9410-4397-b0fc-e7f177783a2a" />

### setup

1. dockerデーモンを立ち上げた状態で、ルートディレクトリで以下を実行する。
```
npx supabase start
```
2. .envファイルを作成し、以下のように内容を記述する。
> VITE_SUPABASE_URL=http://127.0.0.1:54321
>
> VITE_SUPABASE_ANON_KEY=<supabaseのAuthentication Keys-Publishable>

3. /batch/csvの以下ディレクトリにcsvファイルを配置する。

> lines - 路線
>
> prefectures - 都道府県
>
> stations - 駅

csvファイルは、駅データ.jp(https://ekidata.jp/api) から取得してください。
    


4. 以下コマンドを実行し、supabaseのテーブルにcsvデータを投入する。
```
npm run batch
```

5. /osrm-valhalla/custom-filesディレクトリに、osmデータファイルを配置する。

    osmデータは以下からダウンロード可能です。

    https://download.geofabrik.de/asia/japan/kanto.html

6. /osrm-valhalla ディレクトリで以下を実行する。
```
docker compose up
```

7. 以下を実行してアプリケーションを起動する。
```
npm run dev
```

実行環境として、最低でも8GBのメモリがないと動作は厳しいと思います。

