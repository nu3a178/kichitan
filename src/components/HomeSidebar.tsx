import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { GiOrange } from "react-icons/gi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  getLinesInPrefecture,
  getPrefectures,
  getStationsByQuery,
  getStationsInLine,
  searchReachableEstate,
} from "@/utils/supabase-api";
import { useEffect, useRef, useState } from "react";
import { useMapContext } from "@/contexts/MapContext";
import type { Prefecture } from "@/types/Prefecture";
import type { Line } from "@/types/Line";
import type { Station } from "@/types/Station";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { MarkerType } from "@/types/Markers";
import { CiSearch } from "react-icons/ci";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";

export function HomeSidebar() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [selectedPrefecture, setSelectedPrefecture] =
    useState<Prefecture | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [transportationMode, setTransportationMode] = useState<
    "pedestrian" | "bicycle" | "auto"
  >("pedestrian");
  const [time, setTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [stationSuggestions, setStationSuggestions] = useState<Station[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setOpenMobile } = useSidebar();
  const {
    setMapView,
    setMarkers,
    setLineTrack,
    setIsochronePolygons,
    setStationLocation,
  } = useMapContext();

  useEffect(() => {
    const fetchPrefectures = async () => {
      const data = await getPrefectures();
      const prefectureNames = data.map((prefecture) => ({
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

  const onChangePrefecture = async (code: number) => {
    const selectedPrefecture = prefectures.find((pref) => pref.code === code);
    if (!selectedPrefecture) return;

    setSelectedPrefecture(selectedPrefecture);
    setSelectedLine(null);
    setSelectedStation(null);
    const lines = await getLinesInPrefecture(code);
    setLines(lines);
  };

  const onChangeLine = async (code: number) => {
    const line = lines.find((l) => l.code === code) ?? null;
    if (!line) return;

    setSelectedLine(line);
    setSelectedStation(null);

    const stations = await getStationsInLine(code);
    setStations(stations);
  };

  const onChangeStation = (code: number) => {
    const station = stations.find((s) => s.code === code) ?? null;
    if (!station) return;
    setSelectedStation(station);
  };

  useEffect(() => {
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
    } else {
      setMapView({
        latitude: 35.5748,
        longitude: 137.9922,
        zoom: 5,
      });
    }
  }, [selectedPrefecture, selectedLine, selectedStation, setMapView]);

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
    if (value.trim() === "") {
      setStationSuggestions([]);
      return;
    }
    const result = await getStationsByQuery(value);
    setStationSuggestions(result);
  };

  // 選択した駅候補について、属している県と路線情報も含めてセットする
  const onClickSuggestion = async (station: Station) => {
    // 選択した駅の属する県をセット
    const prefecture = prefectures.find(
      (p) => p.code === station.prefecture_code,
    );
    const lineCode = station.line_code;
    if (!prefecture || !lineCode) return;

    setSelectedPrefecture(prefecture);
    // 並行fetchして await 境界を減らす（途中のstate更新でズームが路線に向かないようにする）
    const [lines, stationsInLine] = await Promise.all([
      getLinesInPrefecture(station.prefecture_code!),
      getStationsInLine(station.line_code!),
    ]);

    // 全stateを一度にセット → useEffectは selectedStation が存在する状態で発火する
    setLines(lines);
    setStations(stationsInLine);
    setSelectedLine(lines.find((l) => l.code === station.line_code) ?? null);
    setSelectedStation(station);
    setInputValue("");
    inputRef.current?.blur();
  };

  const onClickSearch = async () => {
    setOpenMobile(false);
    setIsLoading(true);
    const requestJson = {
      locations: [
        { lat: selectedStation?.latitude, lon: selectedStation?.longitude },
      ],
      costing: transportationMode,
      costing_options:
        transportationMode === "bicycle"
          ? { bicycle: { cycling_speed: 18 } }
          : undefined,
      contours: [{ time, color: "87cefa" }],
    };
    const result = await searchReachableEstate(requestJson);
    setIsLoading(false);
    const data = await result.data;
    setIsochronePolygons({
      color: data.polygon.features[0].properties.fillColor ?? undefined,
      coordinates: data.polygon.features[0].geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        }),
      ),
    });
    if (!data.estates) {
      toast("該当する物件が見つかりませんでした", {});
    }
    setMarkers(data.estates.map((estate: MarkerType) => ({ ...estate })));
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center items-center">
          {"Range.St"} <GiOrange />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex justify-center items-center">
        <div className="relative w-full max-w-36 z-10">
          <Input
            ref={inputRef}
            placeholder="駅名で検索"
            className="rounded-2xl"
            onChange={(e) => {
              getStationSuggestions(e.target.value);
              setInputValue(e.target.value);
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
                  <>
                    <CardContent
                      key={station.code}
                      className="hover:bg-gray-100"
                      onClick={() => onClickSuggestion(station)}
                    >
                      <p className="text-xs text-gray-500">
                        {station.train_lines.name}
                      </p>
                      <p className="text-sm">{station.name}</p>
                    </CardContent>
                  </>
                ))}
              </Card>
            </>
          )}
        </div>
        <div className="h-20"></div>
        <Select
          value={selectedPrefecture?.code.toString() || ""}
          onValueChange={(value) => onChangePrefecture(Number(value))}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="都道府県" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>都道府県</SelectLabel>
              {prefectures.map((prefecture, i) => (
                <SelectItem key={i} value={prefecture.code.toString()}>
                  {prefecture.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => onChangeLine(Number(value))}
          value={selectedLine?.code.toString() || ""}
          disabled={!selectedPrefecture}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="路線" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>路線</SelectLabel>
              {lines.map((line, i) => (
                <SelectItem key={i} value={line.code.toString()}>
                  {line.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => onChangeStation(Number(value))}
          value={selectedStation?.code.toString() || ""}
          disabled={!selectedLine}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="駅" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>駅</SelectLabel>
              {stations.map((station, i) => (
                <SelectItem key={i} value={station.code.toString()}>
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
            <SelectTrigger className="w-24 max-w-48">
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
            className="w-16"
            type="number"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
          />
          <p>分</p>
        </div>
        <Button
          onClick={onClickSearch}
          disabled={!selectedStation || !time || isLoading}
        >
          検索開始
        </Button>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
