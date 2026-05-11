export interface LocationData {
  id: number;
  business_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  maps_link: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LocationCreate {
  name: string;
  address?: string | null;
  phone?: string | null;
  maps_link?: string | null;
}

export interface LocationUpdate {
  name?: string;
  address?: string | null;
  phone?: string | null;
  maps_link?: string | null;
  is_active?: boolean;
}
