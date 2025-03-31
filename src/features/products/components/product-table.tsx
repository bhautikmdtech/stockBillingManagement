"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { searchProducts, type SearchParams } from "@/lib/api-helpers";
import { appConstant } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import React from "react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  sku: string;
  createdAt: string;
};

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrev: boolean;
};

export default function ProductTable() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationProps>({
    page: appConstant.dataTable.page,
    limit: appConstant.dataTable.limit,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrev: false,
  });

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: appConstant.dataTable.page,
    limit: appConstant.dataTable.limit,
    sortBy: appConstant.dataTable.sortBy,
    sortOrder: appConstant.dataTable.sortOrder as "asc" | "desc",
  });
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [stockFilter, setStockFilter] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters: Record<string, any> = {};

      if (categoryFilter) {
        filters.category = categoryFilter;
      }

      if (stockFilter !== undefined) {
        filters.inStock = stockFilter;
      }

      const result = await searchProducts({
        ...searchParams,
        search: searchTerm,
        filters,
      });

      setProducts(result.products);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      page: 1, // Reset to first page on new search
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...searchParams,
      page: newPage,
    });
  };

  const handleSortChange = (column: string) => {
    // If already sorting by this column, toggle order
    const newOrder =
      searchParams.sortBy === column && searchParams.sortOrder === "desc"
        ? "asc"
        : "desc";

    setSearchParams({
      ...searchParams,
      sortBy: column,
      sortOrder: newOrder,
    });
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === "all" ? undefined : value);
  };

  const handleStockFilterChange = (value: string) => {
    setStockFilter(
      value === "all" ? undefined : value === "inStock" ? true : false
    );
  };

  const applyFilters = () => {
    setSearchParams({
      ...searchParams,
      page: 1, // Reset to first page on new filter
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter(undefined);
    setStockFilter(undefined);
    setSearchParams({
      page: appConstant.dataTable.page,
      limit: appConstant.dataTable.limit,
      sortBy: appConstant.dataTable.sortBy,
      sortOrder: appConstant.dataTable.sortOrder as "asc" | "desc",
    });
  };

  const handleViewProduct = (id: string) => {
    router.push(`/dashboard/products/${id}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Search by name, description or SKU"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>

          <div className="space-y-2 md:w-48">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={categoryFilter || "all"}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Toys">Toys</SelectItem>
                <SelectItem value="Jewelry">Jewelry</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:w-48">
            <label className="text-sm font-medium">Stock Status</label>
            <Select
              value={
                stockFilter === undefined
                  ? "all"
                  : stockFilter
                    ? "inStock"
                    : "outOfStock"
              }
              onValueChange={handleStockFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="inStock">In Stock</SelectItem>
                <SelectItem value="outOfStock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSortChange("name")}
              >
                Name
                {searchParams.sortBy === "name" && (
                  <span className="ml-1">
                    {searchParams.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSortChange("price")}
              >
                Price
                {searchParams.sortBy === "price" && (
                  <span className="ml-1">
                    {searchParams.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSortChange("stock")}
              >
                Stock
                {searchParams.sortBy === "stock" && (
                  <span className="ml-1">
                    {searchParams.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSortChange("createdAt")}
              >
                Created
                {searchParams.sortBy === "createdAt" && (
                  <span className="ml-1">
                    {searchParams.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product._id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => handleViewProduct(product._id)}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.category === "Electronics"
                          ? "bg-blue-100 text-blue-800"
                          : product.category === "Clothing"
                            ? "bg-green-100 text-green-800"
                            : product.category === "Furniture"
                              ? "bg-purple-100 text-purple-800"
                              : product.category === "Toys"
                                ? "bg-yellow-100 text-yellow-800"
                                : product.category === "Jewelry"
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product._id);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (pageNum) =>
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - pagination.page) <= 1
                )
                .map((pageNum, i, array) => (
                  <React.Fragment key={`page-${pageNum}`}>
                    {i > 0 && array[i - 1] !== pageNum - 1 && (
                      <span key={`ellipsis-${pageNum}`} className="px-2">
                        ...
                      </span>
                    )}
                    <Button
                      key={pageNum}
                      variant={
                        pagination.page === pageNum ? "default" : "outline"
                      }
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
