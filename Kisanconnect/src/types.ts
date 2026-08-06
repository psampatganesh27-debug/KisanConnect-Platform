export type Language = 'en' | 'hi' | 'te';

export interface User {
  id: number;
  phone: string;
  name: string;
  village: string;
  district: string;
}

export type Category = 
  | 'all'
  | 'tractor'
  | 'harvester'
  | 'seeder'
  | 'sprayer'
  | 'labor'
  | 'drone'
  | 'irrigation';

export interface EquipmentListing {
  id: number;
  user_id: number;
  owner_name: string;
  owner_phone: string;
  category: Category;
  title: string;
  description: string;
  rate_per_unit: number;
  unit_type: 'hour' | 'acre' | 'day';
  village: string;
  district: string;
  is_available: number;
  created_at: string;
}

export interface LaborRequest {
  id: number;
  user_id: number;
  requester_name: string;
  requester_phone: string;
  category: Category;
  title: string;
  description: string;
  offered_rate: number;
  unit_type: 'hour' | 'acre' | 'day';
  work_date: string;
  village: string;
  district: string;
  status: 'open' | 'matched' | 'completed';
  created_at: string;
}

export interface Booking {
  id: number;
  listing_id?: number;
  request_id?: number;
  requester_phone: string;
  provider_phone: string;
  service_title: string;
  amount: number;
  status: string;
  booking_date: string;
  created_at: string;
}
