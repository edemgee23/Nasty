export type OrderStatus = 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  role: 'customer' | 'rider';
  isOnline?: boolean;
  ghanaCardFront?: string;
  ghanaCardBack?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'fuel' | 'service';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  stationId: string;
  stationName: string;
  riderId?: string;
  riderLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Station {
  id: string;
  name: string;
  address: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl: string;
  categories: string[];
  isFeatured?: boolean;
}

export interface Service {
  id: string;
  stationId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'Fuel' | 'Additives' | 'Emergency';
}

export interface CartItem extends OrderItem {
  stationId: string;
}
