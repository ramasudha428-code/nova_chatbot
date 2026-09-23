import { supabase } from "./supabase";
import type { Message } from "./supabase";

const chatFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface ChatResponse {
  response: string;
  conversationId: string;
  title?: string;
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null,
  history: { role: string; content: string }[]
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey) {
    headers["Authorization"] = `Bearer ${anonKey}`;
  }

  const res = await fetch(chatFunctionUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      conversationId: conversationId || undefined,
      history,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed (${res.status})`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    response: data.response,
    conversationId: data.conversationId,
    title: data.title,
  };
}

export async function fetchConversations() {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, role, content })
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteConversation(conversationId: string) {
  const { error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) throw error;
}

export async function updateConversationTimestamp(conversationId: string) {
  const { error } = await supabase
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) throw error;
}
