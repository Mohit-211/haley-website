import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { adminGetReviews } from "@/lib/queries";
import { Reviews } from "./reviews";

export const metadata: Metadata = { title: "Reviews — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ReviewsPage />
    </Suspense>
  );
}

async function ReviewsPage() {
  return <Reviews reviews={await adminGetReviews()} />;
}
