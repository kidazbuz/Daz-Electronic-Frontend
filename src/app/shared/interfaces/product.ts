import { UserReview } from './user';


export interface IImage {
    id: number;
    image: string;
    product: number;
}

export interface IVideo {
    id: number;
    video: string;
    product: number;
}

export interface IConnectivityDetail {
    id: number;
    connectivity: number;
    connectivity_name: string;
    connectivity_count: number;
}


export interface IElectricalSpecs {
    id: number;
    voltage: string;
    max_wattage: string;
    frequency: string;
    product: number;
}

export interface IProductSpecification {
  id: number;
  parent_product_id: number;
  parent_product_name: string;
  parent_category_name: string;
  product_base_name: string;
  discount_percentage: number;
  description: string;
  model: string;
  condition: string;
  sku: string;
  actual_price: string;
  discounted_price: string;
  color: string;
  smart_features: boolean;
  screen_size_name: string;
  resolution_name: string;
  panel_type_name: string;
  brand_name: string;
  electrical_specs: IElectricalSpecs;
  images: IImage[];
  videos: IVideo[];
  connectivity_details: IConnectivityDetail[];
  supported_internet_services_names: string;
  quantity_in_stock: number;
  user_reviews: UserReview[];
}

export interface IFirmwareProduct {
  id: string;
  name: string;
  version: string;
  description: string;
  board_number: string;
  panel_model: string;
  brand_name: string;
  resolution_name: string;
  software_type_display: string;
  size_mb: string;
  category_name: 'software';
  price: string;
  user_reviews: UserReview[];
  images: IImage[];
  videos: IVideo[];
}

export interface ISearchableProduct {
  id: string;
  name: string;
  category_name: string;
  description: string;
  specifications: IProductSpecification[];
  firmwares: IFirmwareProduct[];
}


export interface ISearchResponse {
  results: ISearchableProduct[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}


export interface IPaginatedSpecificationList {
    count: number;
    next: string | null;
    previous: string | null;
    results: IProductSpecification[];
}

export interface Product {
    id?: number;
    name: string;
    description: string;
    brand: number;
    category: number;
    is_active: boolean;
    created_at?: string; // read_only_fields
    updated_at?: string; // read_only_fields

    // Management API fetches specs/digital_details on retrieve, not list
    // product_specs?: ProductSpecification[];
    // digital_details?: DigitalProduct;

    // brand_detail?: Brand;
    // category_detail?: ProductCategory;
}

export interface IProductRecommendation {
  id: number;
  parent_product_name: string;
  brand_name: string;
  model: string;
  actual_price: string;
  discounted_price: string;
  thumbnail: string | null;
  screen_size_name: string;
  resolution_name: string;
}

export interface ISoftProductRecommendation {
  id: string;
  brand_name: string;
  board_number: string;
  panel_model: string | null;
  software_type_display: string;
  price: string | number;
  thumbnail: string | null;
  size_mb: string | number;
  category_name?: string;
}

export interface ProductMedia {
    id: number;
    productName: string;
    productDescription: string;
    productDiscountedPrice: string;
    productActualPrice: string;
    model_number: string;
    images: IImage[];
    videos: IVideo[];
}

export interface UploadFile {
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    preview?: string;
    errorMessage?: string;
}
