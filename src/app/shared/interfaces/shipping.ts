export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  base_cost: string;
  free_shipping_threshold: string;
  min_delivery_time: number;
  max_delivery_time: number;
  service_type: 'S' | 'E' | 'P' | 'L';
  // You might add an Angular-only property here later, like:
  // calculated_cost?: number;
}

export interface TrackingHistory {
  status: string;
  status_display: string;
  description: string;
  location: string;
  timestamp: string;
}

export interface TrackingDetail {
  tracking_number: string;
  status: string;
  dispatched_at: string;
  origin_city: string;
  destination_city: string;
  current_stage: number;
  latest_update: string;
  total_weight_kg: number;
  number_of_items: number;
  tracking_history: TrackingHistory[];
}
