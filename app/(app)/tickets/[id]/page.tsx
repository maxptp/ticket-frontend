import TicketDetailPageClient from "@/components/pages/TicketPage/TicketDetailPageClient";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailPageClient id={id} />;
}
