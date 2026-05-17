export const PREFECTURES = [
  {
    code: 13,
    name: "東京都",
    latitude: 35.6895,
    longitude: 139.6917,
    zoom: 10,
  },
  {
    code: 14,
    name: "神奈川県",
    latitude: 35.4478,
    longitude: 139.6425,
    zoom: 10,
  },
];

export const LINES = [
  {
    code: 11301,
    name: "JR東海道本線(東京～熱海)",
    zoom: 10,
    color: "",
    latitude: 35.395079623415,
    longitude: 139.43024413263,
  },
  {
    code: 11302,
    name: "JR山手線",
    zoom: 12,
    color: "",
    latitude: 35.69302730763,
    longitude: 139.73522275686,
  },
];

export const STATIONS = [
  { code: 1130201, name: "大崎", latitude: 35.619772, longitude: 139.728439 },
  { code: 1130202, name: "五反田", latitude: 35.625974, longitude: 139.723822 },
  { code: 1130203, name: "目黒", latitude: 35.633923, longitude: 139.715775 },
  { code: 1130204, name: "恵比寿", latitude: 35.646685, longitude: 139.71007 },
  { code: 1130205, name: "渋谷", latitude: 35.658871, longitude: 139.701238 },
];

export const ESTATES_AND_POLYGONS = {
  estates: [
    {
      id: 56029,
      name: "ガーデンマンション",
      address: "東京都目黒区碑文谷二丁目10番地",
      latitude: 35.660601,
      longitude: 139.699759,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.699759, 35.660601],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 96000,
    },
    {
      id: 56150,
      name: "ヒルズアパート",
      address: "東京都目黒区学芸大学三丁目24番地",
      latitude: 35.659141,
      longitude: 139.700675,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700675, 35.659141],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 128000,
    },
    {
      id: 56152,
      name: "シティレジデンス",
      address: "東京都目黒区碑文谷五丁目15番地",
      latitude: 35.660152,
      longitude: 139.700237,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700237, 35.660152],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 140000,
    },
    {
      id: 56206,
      name: "ブルーマンション",
      address: "東京都目黒区学芸大学二丁目14番地",
      latitude: 35.659472,
      longitude: 139.703228,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.703228, 35.659472],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 133000,
    },
    {
      id: 56363,
      name: "フォレストコーポ",
      address: "東京都目黒区学芸大学一丁目18番地",
      latitude: 35.6591,
      longitude: 139.697496,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.697496, 35.6591],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 91000,
    },
    {
      id: 56398,
      name: "シティマンション",
      address: "東京都目黒区学芸大学四丁目29番地",
      latitude: 35.658579,
      longitude: 139.700162,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700162, 35.658579],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 185000,
    },
    {
      id: 56414,
      name: "サニーレジデンス",
      address: "東京都目黒区碑文谷二丁目22番地",
      latitude: 35.657495,
      longitude: 139.702556,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.702556, 35.657495],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 83000,
    },
    {
      id: 56492,
      name: "ガーデンコーポ",
      address: "東京都目黒区学芸大学五丁目5番地",
      latitude: 35.657569,
      longitude: 139.700803,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700803, 35.657569],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 57000,
    },
    {
      id: 56588,
      name: "オークアパート",
      address: "東京都目黒区中目黒一丁目23番地",
      latitude: 35.658832,
      longitude: 139.704456,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.704456, 35.658832],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 192000,
    },
    {
      id: 56646,
      name: "オークプレイス",
      address: "東京都目黒区中目黒一丁目8番地",
      latitude: 35.658158,
      longitude: 139.698647,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.698647, 35.658158],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 184000,
    },
    {
      id: 56649,
      name: "ホワイトハウス",
      address: "東京都目黒区中目黒三丁目10番地",
      latitude: 35.660624,
      longitude: 139.699593,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.699593, 35.660624],
      },
      created_at: "2026-03-07T08:08:53.769923+00:00",
      rent_price: 171000,
    },
    {
      id: 58112,
      name: "ベルクハウス",
      address: "東京都渋谷区松濤三丁目25番地",
      latitude: 35.659676,
      longitude: 139.702158,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.702158, 35.659676],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 183000,
    },
    {
      id: 58177,
      name: "ロイヤルレジデンス",
      address: "東京都渋谷区原宿二丁目28番地",
      latitude: 35.659115,
      longitude: 139.700707,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700707, 35.659115],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 147000,
    },
    {
      id: 58232,
      name: "ガーデンハウス",
      address: "東京都渋谷区恵比寿二丁目13番地",
      latitude: 35.661257,
      longitude: 139.699436,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.699436, 35.661257],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 88000,
    },
    {
      id: 58306,
      name: "グリーンハウス",
      address: "東京都渋谷区渋谷一丁目23番地",
      latitude: 35.658369,
      longitude: 139.701763,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.701763, 35.658369],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 200000,
    },
    {
      id: 58347,
      name: "コスモアパート",
      address: "東京都渋谷区恵比寿三丁目5番地",
      latitude: 35.660721,
      longitude: 139.697592,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.697592, 35.660721],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 118000,
    },
    {
      id: 58409,
      name: "シティパレス",
      address: "東京都渋谷区恵比寿五丁目6番地",
      latitude: 35.657702,
      longitude: 139.698939,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.698939, 35.657702],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 173000,
    },
    {
      id: 58431,
      name: "フォレストアパート",
      address: "東京都渋谷区渋谷二丁目8番地",
      latitude: 35.660589,
      longitude: 139.700813,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700813, 35.660589],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 79000,
    },
    {
      id: 58491,
      name: "フォレストプレイス",
      address: "東京都渋谷区渋谷三丁目8番地",
      latitude: 35.656885,
      longitude: 139.702264,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.702264, 35.656885],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 115000,
    },
    {
      id: 58527,
      name: "ロイヤルパレス",
      address: "東京都渋谷区恵比寿三丁目11番地",
      latitude: 35.657971,
      longitude: 139.699122,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.699122, 35.657971],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 145000,
    },
    {
      id: 58531,
      name: "パークタワー",
      address: "東京都渋谷区松濤一丁目19番地",
      latitude: 35.657516,
      longitude: 139.698702,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.698702, 35.657516],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 137000,
    },
    {
      id: 58535,
      name: "グリーンプレイス",
      address: "東京都渋谷区松濤三丁目22番地",
      latitude: 35.658483,
      longitude: 139.700291,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700291, 35.658483],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 78000,
    },
    {
      id: 58539,
      name: "ベルクアパート",
      address: "東京都渋谷区代々木三丁目3番地",
      latitude: 35.658373,
      longitude: 139.699947,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.699947, 35.658373],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 90000,
    },
    {
      id: 58552,
      name: "パークアパート",
      address: "東京都渋谷区恵比寿四丁目7番地",
      latitude: 35.661058,
      longitude: 139.699333,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.699333, 35.661058],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 62000,
    },
    {
      id: 58567,
      name: "サニーコーポ",
      address: "東京都渋谷区松濤一丁目20番地",
      latitude: 35.658668,
      longitude: 139.698888,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.698888, 35.658668],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 132000,
    },
    {
      id: 58646,
      name: "サニーハイツ",
      address: "東京都渋谷区原宿五丁目3番地",
      latitude: 35.656469,
      longitude: 139.700926,
      geom: {
        type: "Point",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:4326",
          },
        },
        coordinates: [139.700926, 35.656469],
      },
      created_at: "2026-03-07T08:08:53.85999+00:00",
      rent_price: 142000,
    },
  ],
  polygon: {
    features: [
      {
        properties: {
          "fill-opacity": 0.33,
          fillColor: "#87cefa",
          opacity: 0.33,
          fill: "#87cefa",
          fillOpacity: 0.33,
          color: "#87cefa",
          contour: 5,
          metric: "time",
        },
        geometry: {
          coordinates: [
            [139.702238, 35.661932],
            [139.701238, 35.662336],
            [139.699995, 35.662113],
            [139.69767, 35.660871],
            [139.697238, 35.660073],
            [139.697127, 35.65876],
            [139.697854, 35.657487],
            [139.700238, 35.656156],
            [139.701238, 35.656178],
            [139.70374, 35.657368],
            [139.704991, 35.659871],
            [139.702238, 35.661932],
          ],
          type: "LineString",
        },
        type: "Feature",
      },
    ],
    type: "FeatureCollection",
  },
};
