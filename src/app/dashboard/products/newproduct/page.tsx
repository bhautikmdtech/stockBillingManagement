import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import NewProductPage from "@/features/products/components/product-view-new";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Add New Product",
  description: "Create a new product in the system",
};

export default async function ProductsPageNew() {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <NewProductPage />
        </Suspense>
      </div>
    </PageContainer>
  );
} 