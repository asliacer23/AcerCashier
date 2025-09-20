export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  barcode?: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount?: number; // percentage discount for this item
}

export interface Receipt {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  cashier?: string;
}

export interface Store {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface POSState {
  cart: CartItem[];
  products: Product[];
  receipts: Receipt[];
  store: Store;
  darkMode: boolean;
}

export type ProductCategory = 
  | 'Writing Materials' 
  | 'Paper Products' 
  | 'School Bags' 
  | 'Art Supplies' 
  | 'Office Supplies' 
  | 'Electronics' 
  | 'Books & References';