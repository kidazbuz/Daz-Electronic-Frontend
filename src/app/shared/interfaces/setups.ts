export interface ProductCategory {
  id?: number;
  name: string;
  description: string;
  created_at: string;
  status: boolean;
  is_digital: boolean;
}

export interface CategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductCategory[];
}

export interface Entity {
  id: string;
  name: string;
}

export interface RegionEntity extends Entity {}
export interface DistrictEntity extends Entity {
    region_id: string;
}
export interface WardEntity extends Entity {
    district_id: string;
}

export interface StreetEntity extends Entity {
    street_id: string;
}

export interface PostcodeEntity extends Entity {
    post_code_id: string;
}

export interface AddressDataResponse {
  districts: DistrictEntity[];
  wards: WardEntity[];
  streets: StreetEntity[];
  post_codes: PostcodeEntity[];
}

export interface IAddress {
    id: number;
    region: string;
    district: string;
    ward: string;
    street: string;
}

export interface ConnectivityItem {
    id?: number;
    product: number;
    connectivity: number;
    connectivity_name: string;
    connectivity_count: number;
}


export interface ConnectivityPayload {
    id?: number;
    product: number;
    connectivity: number;
    connectivity_count: number;
}

export interface ConnectivityItem {
    id?: number;
    product: number;
    connectivity: number;
    connectivity_name: string;
    connectivity_count: number;
}

export interface ElectricalSpecs {
    id?: number;
    product: number;
    voltage: string;
    max_wattage: string;
    frequency: string;
}

export interface BaseSetupItem { id?: number; name: string; }
export interface Brand extends BaseSetupItem { description: string; status: boolean; is_digital: boolean; }
export interface ProductCategory extends BaseSetupItem { description: string; status: boolean; is_digital: boolean; }
export interface ScreenSize extends BaseSetupItem {}
export interface SupportedResolution extends BaseSetupItem {}
export interface PanelType extends BaseSetupItem {}
export interface Connectivity extends BaseSetupItem {}
export interface SupportedInternetService extends BaseSetupItem {}
