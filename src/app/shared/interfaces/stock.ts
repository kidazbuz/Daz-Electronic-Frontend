export type PoStatus = 'DRAFT' | 'SENT' | 'RECEIVED_PARTIAL' | 'RECEIVED_FULL' | 'CANCELLED';


export interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}


export interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier: number;
    supplier_name: string;
    po_date: string;
    expected_delivery_date: string;
    po_status: PoStatus;
    po_status_display: string;
    created_by: string;
    created_by_name: string;
    order_total: string;
    items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: number;
    product: string;
    product_name: string;
    quantity_ordered: number;
    unit_cost: string;
    line_total: string;
    quantity_received_sum: string;
    receptions: StockReception[];
}


export interface StockReception {
    id: number;
    purchase_order_item: number;
    product_name: string;
    quantity_received: number;
    decayed_products: number;
    received_by: string;
    received_by_name: string;
    reception_date: string;
}


export interface CreatePurchaseOrderPayload {
  supplier: number;
  expected_delivery_date: string;
  po_status: PoStatus;
  items: CreateOrderItemPayload[];
}

export interface CreateOrderItemPayload {
  product: string;
  quantity_ordered: number;
  unit_cost: string;
}



export interface AvailableItemOption {
  id: number;
  display: string;
  po_number: string;
}


export interface OrderGroup {
    group: string;
    data: PurchaseOrder[];
}


export interface StockData {
    id?: number;
    product: number;
    product_name?: string;
    sku?: string;
    model?: string;
    quantity_in_stock: number;
    safety_stock_level: number;
    location: number;
    location_details?: any;
    is_low_stock?: boolean;
}
