import { appConstant } from "./constants";
import { productsService, usersService } from "./api-services";

/**
 * Axios Benefits over Fetch:
 * 1. Automatic JSON data transformation
 * 2. Better error handling with descriptive error objects
 * 3. Request and response interceptors
 * 4. Built-in XSRF protection
 * 5. Progress tracking for uploads/downloads
 * 6. Automatic handling of HTTP status codes
 * 7. Easier request cancellation
 * 8. Broader browser compatibility
 */

export type SearchParams = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
};

/**
 * Search products with pagination, sorting, and filtering
 * @deprecated Use productsService.search() instead
 */
export const searchProducts = async (params: SearchParams = {}) => {
  return productsService.search(params);
};

/**
 * Search users with pagination, sorting, and filtering
 * (Only accessible by superadmin)
 * @deprecated Use usersService.search() instead
 */
export const searchUsers = async (params: SearchParams = {}) => {
  return usersService.search(params);
}; 