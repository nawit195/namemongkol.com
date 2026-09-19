import { createFileRoute } from "@tanstack/react-router";
import { DraftPreviewPage } from "@/components/admin/DraftPreviewPage";

export const Route = createFileRoute("/admin-preview/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Draft preview: ${params.slug} | Matrix Intertrade Admin` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BlogDraftPreviewRoute,
});

function BlogDraftPreviewRoute() {
  const { slug } = Route.useParams();
  return <DraftPreviewPage kind="articles" slug={slug} />;
}
