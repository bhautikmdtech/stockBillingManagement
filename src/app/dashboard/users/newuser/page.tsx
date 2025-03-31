import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import NewUserPage from "@/features/users/components/user-view-new";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Add New User",
  description: "Create a new user in the system",
};

export default async function UsersPageNew() {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <NewUserPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
