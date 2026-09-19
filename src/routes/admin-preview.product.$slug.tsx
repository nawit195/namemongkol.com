import { createFileRoute } from "@tanstack/react-router";
import { DraftPreviewPage } from "@/components/admin/DraftPreviewPage";

export const Route = createFileRoute("/admin-preview/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Draft preview: ${params.slug} | Matrix Intertrade Admin` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProductDraftPreviewRoute,
});

function ProductDraftPreviewRoute() {
  const { slug } = Route.useParams();
  return <DraftPreviewPage kind="products" slug={slug} />;
}
