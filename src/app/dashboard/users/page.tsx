import { Metadata } from "next";
import UsersListingPage from "@/features/users/components/users-listing";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";

export const metadata: Metadata = {
  title: "Dashboard: Users",
  description: "User management with pagination, sorting, and filtering"
};

export default function UsersPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Users Management"
            description="Manage users with advanced filtering and sorting."
          />
          <Link
            href="/dashboard/users/newuser"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />
        
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <UsersListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
