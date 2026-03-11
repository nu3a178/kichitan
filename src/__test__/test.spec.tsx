import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import App from "@/App";
import { MemoryRouter } from "react-router-dom";
import {
  getLinesInPrefecture,
  getPrefectures,
  getStationsInLine,
  getTwoPointsRoute,
  searchReachableEstate,
} from "@/utils/supabase-api";

expect.extend(matchers);
const mockSetView = vi.hoisted(() => vi.fn());
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  ZoomControl: () => null,
  Marker: ({ position }: { position: [number, number] }) => (
    <div data-testid="marker" data-lat={position[0]} data-lng={position[1]} />
  ),
  Polyline: ({ positions }: { positions: [number, number][] }) => (
    <div data-testid="polyline" data-length={positions.length} />
  ),
  Polygon: ({ positions }: { positions: unknown[] }) => (
    <div data-testid="polygon" data-length={positions.length} />
  ),
  useMap: () => ({
    setView: mockSetView,
    invalidateSize: vi.fn(),
    fitBounds: vi.fn(),
  }),
}));

vi.mock("@/utils/supabase-api", async () => {
  const { PREFECTURES, LINES, STATIONS, ESTATES_AND_POLYGONS } =
    await import("./const");
  return {
    getPrefectures: vi.fn().mockResolvedValue(PREFECTURES),
    getLinesInPrefecture: vi.fn().mockResolvedValue(LINES),
    getStationsInLine: vi.fn().mockResolvedValue(STATIONS),
    searchReachableEstate: vi.fn().mockResolvedValue(ESTATES_AND_POLYGONS),
    getTwoPointsRoute: vi
      .fn()
      .mockResolvedValue({ polyline: [[35, 135]], time: 0 }),
  };
});
beforeEach(() => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
});
afterEach(() => {
  cleanup();
  mockSetView.mockClear();
});

test("タイトルが正しく表示されること", () => {
  const element = screen.getByText("Range.St");
  expect(element).toBeInTheDocument();
});

test("初期表示で都道府県が正しく取得され、セレクトボックスに表示されること", async () => {
  expect(getPrefectures).toHaveBeenCalled();

  const tokyoBefore = screen.queryByText("東京都");
  const kanagawaBefore = screen.queryByText("神奈川県");
  expect(tokyoBefore).not.toBeInTheDocument();
  expect(kanagawaBefore).not.toBeInTheDocument();

  const trigger = screen.getByTestId("prefecture-select");
  await trigger.click();
  const tokyo = screen.queryByText("東京都");
  const kanagawa = screen.queryByText("神奈川県");
  expect(tokyo).toBeInTheDocument();
  expect(kanagawa).toBeInTheDocument();
});

const selectTokyo = async () => {
  await screen.getByTestId("prefecture-select").click();
  await screen.queryByText("東京都")?.click();
};

const selectJRYamanote = async () => {
  await selectTokyo();
  await screen.getByTestId("line-select").click();
  await screen.queryByText("JR山手線")?.click();
};

const selectShibuya = async () => {
  await selectJRYamanote();
  await screen.getByTestId("station-select").click();
  await screen.queryByText("渋谷")?.click();
};

const inputAll = async () => {
  await selectShibuya();
  await screen.queryByTestId("mode-trigger")?.click();
  await screen.queryByText("自転車")?.click();
  const timeInput = screen.queryByTestId("time-input");
  await act(async () => {
    fireEvent.change(timeInput!, { target: { value: "10" } });
  });
};

const executeSearch = async () => {
  await inputAll();
  const registerButton = screen.queryByTestId("register-button");
  await act(async () => {
    fireEvent.click(registerButton!);
  });
};

test("都道府県を選択すると、路線が取得され、セレクトボックスに表示されること", async () => {
  await selectTokyo();
  expect(getLinesInPrefecture).toHaveBeenCalledWith(13);
  await screen.getByTestId("line-select").click();
  expect(screen.queryByText("JR東海道本線(東京～熱海)")).toBeInTheDocument();
  expect(screen.queryByText("JR山手線")).toBeInTheDocument();
});

test("都道府県を選択すると、地図が移動すること", async () => {
  await selectTokyo();
  expect(mockSetView).toHaveBeenCalledWith([35.6895, 139.6917], 10, {
    animate: true,
  });
});

test("路線を選択すると、駅が取得され、セレクトボックスに表示されること", async () => {
  await selectJRYamanote();
  expect(getStationsInLine).toHaveBeenCalledWith(11302);

  await screen.getByTestId("station-select").click();
  expect(screen.queryByText("大崎")).toBeInTheDocument();
  expect(screen.queryByText("五反田")).toBeInTheDocument();
  expect(screen.queryByText("目黒")).toBeInTheDocument();
  expect(screen.queryByText("恵比寿")).toBeInTheDocument();
  expect(screen.queryByText("渋谷")).toBeInTheDocument();
});

test("路線を選択すると、地図が移動すること", async () => {
  await selectJRYamanote();
  expect(mockSetView).toHaveBeenCalledWith(
    [35.69302730763, 139.73522275686],
    12,
    {
      animate: true,
    },
  );
});

test("路線を選択すると、路線のポリラインが表示されること", async () => {
  await selectJRYamanote();
  expect(screen.queryAllByTestId("polyline")).toHaveLength(2);
});

test("駅を選択すると、駅のピンが刺されること", async () => {
  await selectShibuya();
  expect(screen.queryByTestId("marker")).toBeInTheDocument();
});

test("駅を選択したときに、地図が移動すること", async () => {
  await selectShibuya();
  expect(mockSetView).toHaveBeenCalledWith([35.658871, 139.701238], 14, {
    animate: true,
  });
});

test("必要な入力が行われたときに、検索ボタンが活性化すること", async () => {
  const registerButton = screen.queryByTestId("register-button");
  expect(registerButton).toBeDisabled();
  await inputAll();
  expect(registerButton).not.toBeDisabled();
});

test("検索ボタンの押下で、検索APIが実行されること", async () => {
  await executeSearch();
  expect(searchReachableEstate).toHaveBeenCalledWith({
    contours: [{ color: "87cefa", time: 10 }],
    costing: "bicycle",
    costing_options: { bicycle: { cycling_speed: 18 } },
    locations: [{ lat: 35.658871, lon: 139.701238 }],
  });
});

test("検索ボタンの押下で、ポリゴンが表示されること", async () => {
  await executeSearch();
  expect(screen.queryByTestId("polygon")).toBeInTheDocument();
});

test("検索ボタンの押下で、ドロワーが表示されること", async () => {
  await executeSearch();
  expect(screen.queryByTestId("drawer")).toBeInTheDocument();
});

test("ドロワーの中に、検索結果のカードが表示されること", async () => {
  await executeSearch();
  const estates = screen.queryAllByTestId(/estate-/);
  expect(estates.length).toBe(26);
});

test("検索結果のカードをクリックしたとき、地図が移動すること", async () => {
  await executeSearch();
  const estates = screen.queryAllByTestId(/estate-/);
  await act(async () => {
    fireEvent.click(estates[0]);
  });
  expect(mockSetView).toHaveBeenCalledWith([35.658871, 139.701238], 14, {
    animate: true,
  });
});

test("検索結果のカードをクリックしたときに、その物件までのルートが表示されていること", async () => {
  await executeSearch();
  const estates = screen.queryAllByTestId(/estate-/);
  await act(async () => {
    fireEvent.click(estates[0]);
  });
  expect(getTwoPointsRoute).toHaveBeenCalledWith({
    locations: [
      { lat: 35.660601, lon: 139.699759 },
      { lat: 35.658871, lon: 139.701238 },
    ],
    costing: "bicycle",
    costing_options: { bicycle: { cycling_speed: 18 } },
  });
  expect(screen.queryAllByTestId("polyline")).toHaveLength(3);
});
