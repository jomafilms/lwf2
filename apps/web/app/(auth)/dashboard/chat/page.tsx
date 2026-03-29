import { getCurrentUser } from "@/lib/auth";
import { ChatPageClient } from "./ChatPageClient";
import { redirect } from "next/navigation";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  const conversationId = params.conversation || undefined;

  return <ChatPageClient conversationId={conversationId} />;
}