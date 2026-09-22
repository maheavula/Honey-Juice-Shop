export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type OrderStatus = 'processing' | 'dispatched' | 'delivered' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: Address;
  createdAt: string;
}

export interface Juice {
  id: string;
  name: string;
  description: string;
  category: string;
  fruits: string[];
  price: number; // In integer paise (e.g. 24900 -> ₹249.00)
  stock: number;
  imageUrl: string;
  volumeMl: number;
  isOrganic: boolean;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  juiceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  juice: Juice;
  quantity: number;
}

export interface OrderItem {
  juiceId: string;
  name: string;
  price: number; // in integer paise
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number; // in integer paise
  deliveryAddress: Address;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  ready: boolean;
  storage: {
    accessible: boolean;
    userCount: number;
    juiceCount: number;
    orderCount: number;
    activeSessions: number;
  };
  uptime: string;
  timestamp: string;
}

export interface SystemInfo {
  store: string;
  version: string;
  currency: string;
  currencySymbol: string;
  supportedCategories: string[];
  operatingMode: string;
  nodeEnv: string;
}
