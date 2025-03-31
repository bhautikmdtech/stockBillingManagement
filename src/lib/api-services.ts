import apiClient from "./api-client";

/**
 * Common API services built on top of our centralized axios instance
 * These services provide a higher-level abstraction for API operations
 */

// Product interfaces
interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  sku: string;
}

interface ProductSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  };
}

// User interfaces
interface UserData {
  name: string;
  email: string;
  password?: string;
  role?: "admin" | "user" | "superadmin";
  city?: string;
  state?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  profilePicture?: string;
}

interface UserSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    role?: string;
    registerType?: string;
    city?: string;
    state?: string;
    accVerified?: boolean;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Products Service
export const productsService = {
  // Get all products
  getAll: async () => {
    const response = await apiClient.get("/api/products");
    return response.data.products;
  },

  // Get a single product by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.product;
  },

  // Create a new product
  create: async (productData: ProductData) => {
    const response = await apiClient.post("/api/products", productData);
    return response.data;
  },

  // Update a product
  update: async (id: string, productData: Partial<ProductData>) => {
    const response = await apiClient.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // Delete a product
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  // Search products with filtering, sorting, and pagination
  search: async (params: ProductSearchParams) => {
    const response = await apiClient.post("/api/products/search", params);
    return response.data;
  },
};

// Users Service
export const usersService = {
  // Get all users (admin only)
  getAll: async () => {
    const response = await apiClient.get("/api/users");
    return response.data.users;
  },
  
  // Get a single user by ID (admin only)
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data.user;
  },
  
  // Create a new user (admin only)
  create: async (userData: UserData) => {
    const response = await apiClient.post("/api/users", userData);
    return response.data;
  },
  
  // Update a user (admin only)
  update: async (id: string, userData: Partial<UserData>) => {
    const response = await apiClient.put(`/api/users/${id}`, userData);
    return response.data;
  },
  
  // Delete a user (admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
  
  // Search users with filtering, sorting, and pagination (admin only)
  search: async (params: UserSearchParams) => {
    const response = await apiClient.post("/api/users/search", params);
    return response.data;
  }
};

// Profile Service (current user)
export const profileService = {
  // Get current user's profile
  get: async () => {
    const response = await apiClient.get("/api/profile");
    return response.data.user;
  },
  
  // Update current user's profile
  update: async (userData: Partial<UserData>) => {
    const response = await apiClient.put("/api/profile", userData);
    return response.data;
  }
};

// Auth Service
export const authService = {
  // Register a new user
  register: async (userData: UserRegistrationData) => {
    const response = await apiClient.post("/api/auth/signup", userData);
    return response.data;
  },

  // Login internally (used by NextAuth)
  loginInternal: async (credentials: LoginCredentials) => {
    const response = await apiClient.post(
      "/api/auth/login-internal",
      credentials
    );
    return response.data;
  },
};

export default {
  products: productsService,
  users: usersService,
  auth: authService,
};
