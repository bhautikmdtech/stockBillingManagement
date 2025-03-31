import PageContainer from "@/components/layout/page-container";
import ProductViewPage from "@/features/products/components/product-view-page";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard: Product View",
  description: "View and edit product details",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductDetailPage(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4 w-full">
        <Suspense fallback={<div>loading...</div>}>
          <ProductViewPage productId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
