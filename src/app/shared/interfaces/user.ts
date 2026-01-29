export interface TokenResponse {
    refresh: string;
    access: string;
    user_data: string;
}

export interface RefreshResponse {
    access: string;
    refresh?: string;
}


export interface LocationResponse {
  name: string;
  post_code: string | null;
  parent_region?: string;
  parent_district?: string;
}

export interface WorkLocation {
  assigned_location: number;
  location_name: string;
  location_code: string;
  location_address: string;
  region_name: string;
}

export interface ProfilePicture {
  image: string;
}

export interface NextOfKin {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  physical_address: string;
}

export interface UserAddress {
  id: number;
  address: {
    id: number;
    region: string;
    district: string;
    ward: string;
    street?: string;
    post_code?: number;
    house_number: string;
    plot_number?: string;
  };
  is_default: boolean;
}

export interface User {
  id: string;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  second_phone_number: string;
  birth_date: string;
  nationality: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  is_verified: boolean;
  is_default_password: boolean;
  is_profile_complete: boolean;
  groups: string[];
  work_location: WorkLocation;
  profile_picture: ProfilePicture;
  addresses: UserAddress[];
  next_of_kin: NextOfKin[];
}

export interface ApiResponse {
  detail: string;
}

export interface UserDataPayload {
    user: User;

}

export interface UserReview {
  id: number;
  user: string;
  profile_picture: string;
  rating: number;
  comment: string;
  created_at: string;
}
