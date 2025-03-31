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
import { usersService } from "@/lib/api-services";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "superadmin";
  registerType: "email" | "google" | "github";
  city?: string;
  state?: string;
  phoneNumber?: string;
  profilePicture?: string;
  accVerified?: boolean;
  createdAt: string;
  updatedAt: string;
};

interface UserViewPageProps {
  userId: string;
}

export default function UserViewPage({ userId }: UserViewPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);

  // Use refs to track initialization state
  const fetchStartedRef = useRef(false);
  const authCheckCompleted = useRef(false);

  const fetchUser = useCallback(async () => {
    // Prevent duplicate API calls
    if (!userId || fetchStartedRef.current) return;

    fetchStartedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const user = await usersService.getById(userId);

      if (!user) {
        setError("User not found");
        return;
      }

      setUser(user);
      setEditedUser(user);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      setError(error.response?.data?.error || "Failed to fetch user");
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Authentication check
  useEffect(() => {
    // Only run the auth check once
    if (authCheckCompleted.current) return;
    if (status === "loading") return;

    if (status === "authenticated") {
      // Only superadmin can access user details
      if (session?.user?.role !== "superadmin") {
        toast.error("You don't have permission to view user details");
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
      fetchUser();
    }
  }, [status, fetchUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setEditedUser((prev) => ({
      ...prev,
      role: value as "admin" | "user" | "superadmin",
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const result = await usersService.update(userId, editedUser);

      setUser(result.user);
      toast.success("User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.error || "Failed to update user");
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

  if (error || !user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">{error || "User Not Found"}</h2>
        <Button onClick={() => router.push("/dashboard/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/users")}
        >
          Back to Users
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and edit user profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center pb-4">
              {editedUser.profilePicture ? (
                <div className="relative h-32 w-32 rounded-full overflow-hidden">
                  <img
                    src={editedUser.profilePicture}
                    alt={editedUser.name || "User"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-avatar.png";
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 w-32 rounded-full bg-muted">
                  <span className="text-3xl font-semibold text-muted-foreground">
                    {editedUser.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editedUser.name || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editedUser.email || ""}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={editedUser.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Manage additional user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={editedUser.phoneNumber || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={editedUser.city || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={editedUser.state || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registerType">Registration Type</Label>
              <Input
                id="registerType"
                name="registerType"
                value={editedUser.registerType || ""}
                disabled
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
