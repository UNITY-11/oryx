import { SessionDetailClient } from "@/features/booking/session-detail-client";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionDetailClient id={id} />;
}
