export type Estate = {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
  rent_price: number;
  fee_info?: string;
  img?: string;
  url?: string;
  floor_plan?: string;
  area: number;
  years_old?: number;
  floor_num?: string;
};
export type EstateList = Estate[];
