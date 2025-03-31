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
import { searchUsers, type SearchParams } from "@/lib/api-helpers";
import { appConstant } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import React from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  registerType: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
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

export default function UsersTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
    sortOrder: appConstant.dataTable.sortOrder as 'asc' | 'desc',
  });
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [registerTypeFilter, setRegisterTypeFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build filters
      const filters: Record<string, any> = {};
      
      if (roleFilter) {
        filters.role = roleFilter;
      }
      
      if (registerTypeFilter) {
        filters.registerType = registerTypeFilter;
      }
      
      const result = await searchUsers({
        ...searchParams,
        search: searchTerm,
        filters,
      });
      
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      page: 1,  // Reset to first page on new search
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
    const newOrder = searchParams.sortBy === column && searchParams.sortOrder === 'desc' 
      ? 'asc' 
      : 'desc';
    
    setSearchParams({
      ...searchParams,
      sortBy: column,
      sortOrder: newOrder,
    });
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === "all" ? undefined : value);
  };

  const handleRegisterTypeFilterChange = (value: string) => {
    setRegisterTypeFilter(value === "all" ? undefined : value);
  };

  const applyFilters = () => {
    setSearchParams({
      ...searchParams,
      page: 1,  // Reset to first page on new filter
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter(undefined);
    setRegisterTypeFilter(undefined);
    setSearchParams({
      page: appConstant.dataTable.page,
      limit: appConstant.dataTable.limit,
      sortBy: appConstant.dataTable.sortBy,
      sortOrder: appConstant.dataTable.sortOrder as 'asc' | 'desc',
    });
  };

  const handleViewUser = (id: string) => {
    router.push(`/dashboard/users/${id}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Search by name, email or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
          
          <div className="space-y-2 md:w-48">
            <label className="text-sm font-medium">Role</label>
            <Select 
              value={roleFilter || "all"}
              onValueChange={handleRoleFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:w-48">
            <label className="text-sm font-medium">Registration Type</label>
            <Select 
              value={registerTypeFilter || "all"}
              onValueChange={handleRegisterTypeFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
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
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSortChange("email")}
              >
                Email
                {searchParams.sortBy === "email" && (
                  <span className="ml-1">
                    {searchParams.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registration Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
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
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => handleViewUser(user._id)}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "superadmin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.registerType === "email"
                          ? "bg-gray-100 text-gray-800"
                          : user.registerType === "google"
                            ? "bg-red-100 text-red-800"
                            : "bg-black text-white"
                      }`}
                    >
                      {user.registerType}
                    </span>
                  </TableCell>
                  <TableCell>{user.phoneNumber || "—"}</TableCell>
                  <TableCell>
                    {user.city && user.state
                      ? `${user.city}, ${user.state}`
                      : user.city || user.state || "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewUser(user._id);
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
      {!loading && users.length > 0 && (
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
                      variant={pagination.page === pageNum ? "default" : "outline"}
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