import { Metadata } from "next";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import ProfileViewPage from "@/features/profile/components/profile-view-page";

export const metadata: Metadata = {
  title: "Dashboard: Users",
  description: "User management with pagination, sorting, and filtering",
};

export default function UsersPage() {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <Suspense fallback={<div>loading...</div>}>
          <ProfileViewPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
