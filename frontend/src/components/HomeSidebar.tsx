import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useRef, useState } from "react";
import { useMapContext } from "@/contexts/MapContext";
import type { Prefecture } from "@/types/Prefecture";
import type { Line } from "@/types/Line";
import type { Station } from "@/types/Station";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { Estate } from "@/types/Estate";
import { CiSearch } from "react-icons/ci";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { CgSpinner } from "react-icons/cg";
import { useDrawerContext } from "@/contexts/DrawerContext";
import { useRouteContext } from "@/contexts/RouteContext";
import { IoInformationCircleOutline } from "react-icons/io5";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import releaseNoteTexts from "@/assets/release_note";
import { Link } from "react-router-dom";

export function HomeSidebar() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [selectedPrefecture, setSelectedPrefecture] =
    useState<Prefecture | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [time, setTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [stationSuggestions, setStationSuggestions] = useState<Station[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputTimeRef = useRef<HTMLInputElement>(null);
  const { setOpenMobile } = useSidebar();
  const { setOpenDrawer } = useDrawerContext();
  const {
    setMapView,
    setEstateList,
    setLineTrack,
    setIsochronePolygons,
    setStationLocation,
    transportationMode,
    setTransportationMode,
    setSelectedEstate,
  } = useMapContext();
  const { setRoute } = useRouteContext();

  const apiUrl = import.meta.env.VITE_HONO_API_URL;
  useEffect(() => {
    const fetchPrefectures = async () => {
      const data = await fetch(`${apiUrl}/prefectures`);
      const prefectures = (await data.json()) as Prefecture[];
      const prefectureNames = prefectures.map((prefecture) => ({
        code: prefecture.code,
        name: prefecture.name,
        latitude: prefecture.latitude,
        longitude: prefecture.longitude,
        zoom: prefecture.zoom,
      }));
      setPrefectures(prefectureNames);
    };
    fetchPrefectures();
  }, []);

  const onChangePrefecture = async (code: string) => {
    const selectedPrefecture = prefectures.find((pref) => pref.code === code);
    if (!selectedPrefecture) return;

    setSelectedPrefecture(selectedPrefecture);
    setSelectedLine(null);
    setSelectedStation(null);
    const data = await fetch(`${apiUrl}/train_lines?p_code=${code}`);
    const lines = (await data.json()) as Line[];
    setLines(lines);
  };

  const onChangeLine = async (code: string) => {
    const line = lines.find((l) => l.code === code) ?? null;
    if (!line) return;

    setSelectedLine(line);
    setSelectedStation(null);

    const data = await fetch(`${apiUrl}/stations?l_code=${code}`);
    const stations = (await data.json()) as Station[];
    setStations(stations);
  };

  const onChangeStation = (code: string) => {
    const station = stations.find((s) => s.code === code) ?? null;
    if (!station) return;
    setSelectedStation(station);
  };

  useEffect(() => {
    setRoute(null);
    setEstateList([]);
    setSelectedEstate(null);
    setIsochronePolygons({ color: undefined, coordinates: [] });
    if (selectedStation) {
      setMapView({
        latitude: selectedStation.latitude,
        longitude: selectedStation.longitude,
        zoom: 14,
      });
    } else if (selectedLine) {
      setMapView({
        latitude: selectedLine.latitude,
        longitude: selectedLine.longitude,
        zoom: selectedLine.zoom,
      });
    } else if (selectedPrefecture) {
      setMapView({
        latitude: selectedPrefecture.latitude,
        longitude: selectedPrefecture.longitude,
        zoom: selectedPrefecture.zoom,
      });
    }
  }, [
    selectedPrefecture,
    selectedLine,
    selectedStation,
    setMapView,
    setEstateList,
    setRoute,
    setSelectedEstate,
    setIsochronePolygons,
  ]);

  useEffect(() => {
    if (!selectedLine) {
      setLineTrack({ color: undefined, track: [] });
      return;
    }
    setLineTrack({
      color: selectedLine?.color,
      track: selectedLine
        ? stations.map((station) => [station.latitude, station.longitude])
        : [],
    });
  }, [selectedLine, stations, setLineTrack]);

  useEffect(() => {
    if (!selectedStation) {
      setStationLocation(null);
      return;
    } else {
      setStationLocation({
        latitude: selectedStation.latitude,
        longitude: selectedStation.longitude,
      });
    }
  }, [selectedStation, setStationLocation]);

  const getStationSuggestions = async (value: string) => {
    // if (value.trim() === "") {
    //   setStationSuggestions([]);
    //   return;
    // }
    // const result = await getStationsByQuery(value);
    // setStationSuggestions(result);
  };

  // 選択した駅候補について、属している県と路線情報も含めてセットする
  const onClickSuggestion = async (station: Station) => {
    // // 選択した駅の属する県をセット
    // const prefecture = prefectures.find(
    //   (p) => p.code === station.prefecture_code,
    // );
    // const lineCode = station.line_code;
    // if (!prefecture || !lineCode) return;
    // setSelectedPrefecture(prefecture);
    // // 並行fetchして await 境界を減らす（途中のstate更新でズームが路線に向かないようにする）
    // const [lines, stationsInLine] = await Promise.all([
    //   getLinesInPrefecture(station.prefecture_code!),
    //   getStationsInLine(station.line_code!),
    // ]);
    // // 全stateを一度にセット → useEffectは selectedStation が存在する状態で発火する
    // setLines(lines);
    // setStations(stationsInLine);
    // setSelectedLine(lines.find((l) => l.code === station.line_code) ?? null);
    // setSelectedStation(station);
    // setInputValue("");
    // inputTimeRef.current?.focus();
  };

  const onClickSearch = async () => {
    // setRoute(null);
    // setEstateList([]);
    // setSelectedEstate(null);
    // setIsochronePolygons({ color: undefined, coordinates: [] });
    // if (!selectedStation) return;
    // setOpenMobile(false);
    // setIsLoading(true);
    // const requestJson = {
    //   locations: [
    //     { lat: selectedStation.latitude!, lon: selectedStation.longitude! },
    //   ],
    //   costing: transportationMode,
    //   costing_options: { bicycle: { cycling_speed: 18 } },
    //   contours: [{ time, color: "87cefa" }],
    // };
    // try {
    //   const data = await searchReachableEstate(requestJson);
    //   setIsochronePolygons({
    //     color: data.polygon.features[0].properties.fillColor ?? undefined,
    //     coordinates: data.polygon.features[0].geometry.coordinates.map(
    //       (coord: [number, number]) => ({
    //         lat: coord[1],
    //         lng: coord[0],
    //       }),
    //     ),
    //   });
    //   if (!data.estates) {
    //     toast.error("該当する物件が見つかりませんでした");
    //     return;
    //   }
    //   setEstateList(data.estates.map((estate: Estate) => ({ ...estate })));
    //   setOpenDrawer(true);
    //   toast.success(`${data.estates.length}件の物件が見つかりました`);
    // } catch {
    //   toast.error(
    //     "物件検索でエラーが発生しました。しばらくしてから、再度お試しください。",
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
  };
  const inputDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center items-center">{"キチタン"}</div>
      </SidebarHeader>
      <SidebarContent className="relative flex items-center">
        <div className="py-15 top-20 service-description w-3/5 ">
          あなたの駅近物件を探しましょう。
        </div>
        <div className="relative w-full max-w-36 z-10">
          <Input
            ref={inputRef}
            placeholder="駅名で検索"
            className="rounded-2xl"
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputDebounce.current) clearTimeout(inputDebounce.current);
              inputDebounce.current = setTimeout(() => {
                getStationSuggestions(e.target.value);
              }, 300);
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={(e) => {
              setInputValue(e.target.value.trim());
              setIsInputFocused(false);
            }}
            value={inputValue}
            tabIndex={-1}
          />
          <CiSearch className="absolute right-2 top-2 h-6 w-6" />
          {isInputFocused && stationSuggestions.length > 0 && (
            <>
              <Card
                className="absolute w-full max-h-48 overflow-y-auto z-1"
                onMouseDown={(e) => e.preventDefault()}
              >
                {stationSuggestions.map((station) => (
                  <CardContent
                    key={station.code}
                    className="hover:bg-gray-100"
                    onClick={() => onClickSuggestion(station)}
                  >
                    <p className="text-xs text-gray-500">
                      {station.train_lines?.name ?? ""}
                    </p>
                    <p className="text-sm">{station.name}</p>
                  </CardContent>
                ))}
              </Card>
            </>
          )}
        </div>
        <div className="h-20"></div>
        <Select
          value={selectedPrefecture?.code}
          onValueChange={(value) => onChangePrefecture(value)}
        >
          <SelectTrigger
            className="w-full max-w-48"
            data-testid="prefecture-select"
          >
            <SelectValue placeholder="都道府県" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>都道府県</SelectLabel>
              {prefectures.map((prefecture, i) => (
                <SelectItem key={i} value={prefecture.code}>
                  {prefecture.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => onChangeLine(value)}
          value={selectedLine?.code.toString() || ""}
          disabled={!selectedPrefecture}
        >
          <SelectTrigger className="w-full max-w-48" data-testid="line-select">
            <SelectValue placeholder="路線" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>路線</SelectLabel>
              {lines.map((line, i) => (
                <SelectItem key={i} value={line.code}>
                  {line.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => onChangeStation(value)}
          value={selectedStation?.code || ""}
          disabled={!selectedLine}
        >
          <SelectTrigger
            className="w-full max-w-48"
            data-testid="station-select"
          >
            <SelectValue placeholder="駅" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>駅</SelectLabel>
              {stations.map((station, i) => (
                <SelectItem key={i} value={station.code}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        から
        <div className="flex items-center space-x-2">
          <Select
            value={transportationMode}
            onValueChange={(value) =>
              setTransportationMode(value as "pedestrian" | "bicycle" | "auto")
            }
          >
            <SelectTrigger className="w-24 max-w-48" data-testid="mode-trigger">
              <SelectValue placeholder="手段" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>手段</SelectLabel>
                <SelectItem value={"pedestrian"}>{"徒歩"}</SelectItem>
                <SelectItem value={"bicycle"}>{"自転車"}</SelectItem>
                <SelectItem value={"auto"}>{"車"}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p>で</p>
          <Input
            ref={inputTimeRef}
            data-testid="time-input"
            id="time-input"
            className="w-16"
            type="number"
            min={0}
            value={time || ""}
            onChange={(e) => {
              const value =
                Number(e.target.value) > 30 ? 30 : Number(e.target.value);
              setTime(value);
            }}
          />
          <p>分</p>
        </div>
        <Button
          onClick={onClickSearch}
          disabled={!selectedStation || !time || isLoading}
          data-testid="register-button"
        >
          {isLoading ? <CgSpinner className="animate-spin" /> : "検索開始"}
        </Button>
      </SidebarContent>
      <div className="text-end ">
        <Dialog>
          <DialogTrigger>
            <IoInformationCircleOutline className="inline-block hover:bg-gray-400 rounded-full" />
          </DialogTrigger>
          <DialogContent className="text-xs text-gray-600">
            {releaseNoteTexts.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            <p className="text-gray-400">
              {`※このサービスは、経路探索APIとして`}
              <Link
                to="https://valhalla.readthedocs.io/en/latest/"
                target="_blank"
                className="text-blue-500 underline"
              >
                Valhalla API
              </Link>
              {`を使用しています。`}
            </p>
          </DialogContent>
        </Dialog>
      </div>
      <SidebarFooter />
    </Sidebar>
  );
}
