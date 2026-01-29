import { IProductSpecification } from './product';


export interface CartItem {
  id: number;
  product: IProductSpecification;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}


export interface CartItems {
  id: number;
  product_variant: string;
  full_name: string;
  model: string;
  quantity: number;
  unit_price: string;
  subtotal: number;
  image: string | null;
}


export interface ShoppingCart {
  id: number;
  items: CartItems[];
  grand_total: number;
  savings: number;
  updated_at: string;
}
