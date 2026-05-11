export type BookingRequestStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface BookingRequest {
  id: number;
  businessId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  employeeName: string | null;
  service: string;
  requestedDate: string;
  status: BookingRequestStatus;
  expiresAt: string;
  createdAt: string;
}

export interface BookingRequestCreate {
  client_name: string;
  client_email: string;
  client_phone: string;
  employee_name?: string | null;
  service: string;
  requested_date: string;
  location_id?: number | null;
}

export interface AvailabilitySlot {
  time: string;
  employee_name: string;
}

export interface BookingService {
  id: number;
  name: string;
  price: number;
  type: string;
  image_url: string | null;
}

export interface BookingServicesResponse {
  business_name: string;
  services: BookingService[];
  employees: { name: string; available: boolean }[];
  location?: {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    maps_link: string | null;
  } | null;
}

export interface AvailabilityResponse {
  date: string;
  slots: AvailabilitySlot[];
}

export interface BookingLocation {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  maps_link: string | null;
}

export interface BookingLocationsResponse {
  business_name: string;
  locations: BookingLocation[];
}
