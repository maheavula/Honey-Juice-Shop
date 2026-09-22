import {
  Juice,
  Order,
  Review,
  SystemHealth,
  SystemInfo,
  User,
  Address,
  OrderStatus,
  UserStatus
} from '../types';

const BASE_URL = '/api';

async function fetcher<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; [key: string]: any }> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      credentials: 'include' // Transmit HTTP-only cookies
    });

    const json = await res.json().catch(() => ({ success: false, error: 'Malformed server response' }));

    if (!res.ok) {
      return {
        success: false,
        error: json.error || `HTTP error ${res.status}: ${res.statusText}`
      };
    }

    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network communication failure'
    };
  }
}

// API 1: Authentication
export const authApi = {
  signup: (data: { name: string; email: string; password: string; phone?: string; address?: Address }) =>
    fetcher<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { email: string; password: string }) =>
    fetcher<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  logout: () =>
    fetcher<void>('/auth/logout', {
      method: 'POST'
    }),

  getMe: () => fetcher<{ user: User }>('/auth/me')
};

// API 2: Customer Profile
export const customerApi = {
  getProfile: () => fetcher<{ profile: User }>('/customer/profile'),

  updateProfile: (data: { name?: string; phone?: string; address?: Address }) =>
    fetcher<{ profile: User }>('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// API 3: Juice Catalog & Reviews
export const juicesApi = {
  getJuices: (params?: { category?: string; search?: string; sortBy?: string; isOrganic?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.isOrganic !== undefined) query.append('isOrganic', String(params.isOrganic));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetcher<{ juices: Juice[]; count: number }>(`/juices${queryString}`);
  },

  getJuiceById: (id: string) => fetcher<{ juice: Juice }>(`/juices/${id}`),

  submitReview: (juiceId: string, data: { rating: number; comment: string }) =>
    fetcher<{ review: Review }>(`/juices/${juiceId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// API 4: Orders & Cart Reconciliation
export const ordersApi = {
  checkout: (data: {
    items: { juiceId: string; quantity: number }[];
    deliveryAddress: Address;
    paymentMethod: string;
  }) =>
    fetcher<{ order: Order }>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMyOrders: () => fetcher<{ orders: Order[]; count: number }>('/orders/my-orders'),

  getOrderById: (id: string) => fetcher<{ order: Order }>(`/orders/${id}`)
};

// API 5: Admin Operations
export const adminApi = {
  getDashboard: () =>
    fetcher<{
      stats: {
        totalRevenuePaise: number;
        totalOrders: number;
        completedOrdersCount: number;
        activeCustomers: number;
        suspendedCustomers: number;
        totalProducts: number;
        outOfStockCount: number;
        lowStockCount: number;
      };
      lowStockItems: Juice[];
      recentOrders: Order[];
    }>('/admin/dashboard'),

  getJuices: () => fetcher<{ juices: Juice[]; count: number }>('/admin/juices'),

  createJuice: (data: {
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    fruits: string[];
    imageUrl: string;
    volumeMl?: number;
    isOrganic?: boolean;
  }) =>
    fetcher<{ juice: Juice }>('/admin/juices', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateJuice: (
    id: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      price?: number;
      stock?: number;
      fruits?: string[];
      imageUrl?: string;
      volumeMl?: number;
      isOrganic?: boolean;
    }
  ) =>
    fetcher<{ juice: Juice }>(`/admin/juices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getOrders: () => fetcher<{ orders: Order[]; count: number }>('/admin/orders'),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    fetcher<{ order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getCustomers: () => fetcher<{ customers: User[]; count: number }>('/admin/customers'),

  updateCustomerStatus: (id: string, status: UserStatus) =>
    fetcher<{ customer: User }>(`/admin/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

// API 6: System Operations
export const systemApi = {
  getHealth: () => fetcher<SystemHealth>('/system/health'),
  getInfo: () => fetcher<SystemInfo>('/system/info')
};
