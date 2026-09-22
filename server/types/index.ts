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
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: Address;
  createdAt: string;
}

export interface SanitizedUser {
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
  price: number; // in integer paise (e.g., 24900 for ₹249.00)
  stock: number;
  imageUrl: string;
  volumeMl: number;
  isOrganic: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  juiceId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
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

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Metadata {
  store: string;
  version: string;
  currency: string;
}

export interface RuntimeData {
  users: User[];
  juices: Juice[];
  reviews: Review[];
  orders: Order[];
  sessions: Session[];
  metadata: Metadata;
}
