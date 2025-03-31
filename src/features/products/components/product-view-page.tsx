"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { productsService } from "@/lib/api-services";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  updatedAt: string;
};

interface ProductViewPageProps {
  productId: string;
}

export default function ProductViewPage({ productId }: ProductViewPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [error, setError] = useState<string | null>(null);

  // Use refs to track initialization state
  const fetchStartedRef = useRef(false);
  const authCheckCompleted = useRef(false);

  const fetchProduct = useCallback(async () => {
    // Prevent duplicate API calls
    if (!productId || fetchStartedRef.current) return;

    fetchStartedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const product = await productsService.getById(productId);

      if (!product) {
        setError("Product not found");
        return;
      }

      setProduct(product);
      setEditedProduct(product);
    } catch (error: any) {
      console.error("Error fetching product details:", error);
      setError(error.response?.data?.error || "Failed to fetch product");
      toast.error("Failed to fetch product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Authentication check
  useEffect(() => {
    // Only run the auth check once
    if (authCheckCompleted.current) return;
    if (status === "loading") return;

    if (status === "authenticated") {
      if (
        session?.user?.role !== "admin" &&
        session?.user?.role !== "superadmin"
      ) {
        toast.error("You don't have permission to view product details");
        router.push("/dashboard");
        return;
      }
      authCheckCompleted.current = true;
    } else if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, session, router]);

  // Separate effect for data fetching after auth is confirmed
  useEffect(() => {
    if (
      status === "authenticated" &&
      authCheckCompleted.current &&
      !fetchStartedRef.current
    ) {
      fetchProduct();
    }
  }, [status, fetchProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setEditedProduct((prev) => ({ ...prev, category: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (
        isNaN(parseFloat(editedProduct.price as any)) ||
        parseFloat(editedProduct.price as any) < 0
      ) {
        toast.error("Price must be a valid number greater than or equal to 0");
        setSaving(false);
        return;
      }

      if (
        isNaN(parseInt(editedProduct.stock as any)) ||
        parseInt(editedProduct.stock as any) < 0
      ) {
        toast.error("Stock must be a valid number greater than or equal to 0");
        setSaving(false);
        return;
      }

      const productData = {
        ...editedProduct,
        price: parseFloat(editedProduct.price as any),
        stock: parseInt(editedProduct.stock as any),
      };

      const result = await productsService.update(productId, productData);

      setProduct(result.product);
      toast.success("Product updated successfully");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.error || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await productsService.delete(productId);

      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  // Return early during authentication check
  if (status === "loading") {
    return null; // Let Suspense handle the loading state
  }

  if (loading) {
    return null; // Let Suspense handle the loading state
  }

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">
          {error || "Product Not Found"}
        </h2>
        <Button onClick={() => router.push("/dashboard/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Product Details</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Back to Products
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              View and edit basic product details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editedProduct.name || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={editedProduct.description || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={editedProduct.price || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={editedProduct.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Toys">Toys</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Details</CardTitle>
            <CardDescription>Manage product inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input
                id="sku"
                name="sku"
                value={editedProduct.sku || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={editedProduct.stock || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Product Image URL</Label>
              <Input
                id="image"
                name="image"
                value={editedProduct.image || ""}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete Product
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
