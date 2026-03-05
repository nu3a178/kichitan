import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
  getStationsInLine,
  searchReachableEstate,
} from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useMapContext } from "@/contexts/MapContext";
import type { Prefecture } from "@/types/Prefecture";
import type { Line } from "@/types/Line";
import type { Station } from "@/types/Station";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
  const { setMapView, setMarkers, setLineTrack, setIsochronePolygons } =
    useMapContext();

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
      console.log(selectedPrefecture);
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
      setMarkers([]);
      return;
    } else {
      setMarkers([
        {
          latitude: selectedStation.latitude,
          longitude: selectedStation.longitude,
        },
      ]);
    }
  }, [selectedStation, setMarkers]);
  const onClickSearch = async () => {
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

    const data = await result.data;
    console.log(data);
    setIsochronePolygons({
      color: data.polygon.features[0].properties.fillColor ?? undefined,
      coordinates: data.polygon.features[0].geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        }),
      ),
    });
    setMarkers(
      data.estates.map((estate: { latitude: number; longitude: number }) => ({
        latitude: estate.latitude,
        longitude: estate.longitude,
      })),
    );
    setIsLoading(false);
  };
  return (
    <Sidebar className="">
      <SidebarHeader>
        <div className="flex justify-center items-center">
          {"Range.St"} <GiOrange />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex justify-center items-center">
        <Select onValueChange={(value) => onChangePrefecture(Number(value))}>
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
            min="0"
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
