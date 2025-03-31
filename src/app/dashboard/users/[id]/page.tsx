import PageContainer from "@/components/layout/page-container";
import UserViewPage from "@/features/users/components/user-view-page";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard: User View",
  description: "View and edit user details",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function UserDetailPage(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer>
      <div className="flex-1 space-y-4 w-full">
        <Suspense fallback={<div>loading...</div>}>
          <UserViewPage userId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
