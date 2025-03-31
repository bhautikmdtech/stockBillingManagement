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
import { Separator } from "@/components/ui/separator";
import PageContainer from "@/components/layout/page-container";
import { profileService } from "@/lib/api-services";
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

export default function ProfileViewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>(
    "/images/default-avatar.svg"
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Use refs to track initialization state
  const fetchStartedRef = useRef(false);
  const authCheckCompleted = useRef(false);

  const fetchProfile = useCallback(async () => {
    // Prevent duplicate API calls
    if (fetchStartedRef.current) return;

    fetchStartedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const user = await profileService.get();

      if (!user) {
        setError("Profile not found");
        return;
      }

      setUser(user);
      setEditedUser(user);
      if (user.profilePicture) {
        setProfileUrl(user.profilePicture);
      }
    } catch (error: any) {
      console.error("Error fetching profile details:", error);
      setError(error.response?.data?.error || "Failed to fetch profile");
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication check
  useEffect(() => {
    // Only run the auth check once
    if (authCheckCompleted.current) return;
    if (status === "loading") return;

    if (status === "authenticated") {
      authCheckCompleted.current = true;
    } else if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Separate effect for data fetching after auth is confirmed
  useEffect(() => {
    if (
      status === "authenticated" &&
      authCheckCompleted.current &&
      !fetchStartedRef.current
    ) {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5000000) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Only JPG, PNG and WebP files are accepted");
      return;
    }

    setProfileFile(file);
    const imageUrl = URL.createObjectURL(file);
    setProfileUrl(imageUrl);
    setEditedUser((prev) => ({ ...prev, profilePicture: imageUrl }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare the data to be updated
      const updateData: Partial<User> = {
        name: editedUser.name,
        phoneNumber: editedUser.phoneNumber,
        city: editedUser.city,
        state: editedUser.state,
      };

      // Handle profile picture changes
      if (profileFile) {
        // In a real app, you would upload the file to a server here
        // For this example, we'll just use the local URL
        updateData.profilePicture = profileUrl;
      } else if (editedUser.profilePicture) {
        updateData.profilePicture = editedUser.profilePicture;
      }

      const result = await profileService.update(updateData);

      // Update the local state with the server response
      setUser(result.user);
      setEditedUser(result.user);
      if (result.user.profilePicture) {
        setProfileUrl(result.user.profilePicture);
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <h2 className="text-xl font-semibold mb-2">Loading profile...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your details
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">
          {error || "Profile Not Found"}
        </h2>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and edit your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center pb-4 space-y-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden">
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt={editedUser.name || "User"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/default-avatar.svg";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 w-32 rounded-full bg-muted">
                    <span className="text-3xl font-semibold text-muted-foreground">
                      {editedUser.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture" className="text-center mb-1">
                  Profile Picture
                </Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
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
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={editedUser.role || ""}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Manage your contact details</CardDescription>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Account Created
              </h3>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Last Updated
              </h3>
              <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Account Status
              </h3>
              <p>{user.accVerified ? "Verified" : "Not Verified"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                User ID
              </h3>
              <p className="truncate">{user._id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
