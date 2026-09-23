/*
# Create chatbot conversations and messages tables (single-tenant, no auth)

1. New Tables
- `chat_conversations`
  - `id` (uuid, primary key)
  - `title` (text, not null) — auto-generated from the first user message
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- `chat_messages`
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to chat_conversations, cascade delete)
  - `role` (text, not null) — 'user' or 'assistant'
  - `content` (text, not null) — the message text
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no sign-in.
- USING (true) / WITH CHECK (true) is intentional: all data is shared/public.

3. Indexes
- Index on chat_messages.conversation_id for fast message lookups.
- Index on chat_conversations.updated_at for sorting conversation list.
*/

CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at DESC);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_conversations" ON chat_conversations;
CREATE POLICY "anon_select_conversations" ON chat_conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON chat_conversations;
CREATE POLICY "anon_insert_conversations" ON chat_conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON chat_conversations;
CREATE POLICY "anon_update_conversations" ON chat_conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON chat_conversations;
CREATE POLICY "anon_delete_conversations" ON chat_conversations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON chat_messages;
CREATE POLICY "anon_select_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON chat_messages;
CREATE POLICY "anon_insert_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON chat_messages;
CREATE POLICY "anon_update_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON chat_messages;
CREATE POLICY "anon_delete_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);
