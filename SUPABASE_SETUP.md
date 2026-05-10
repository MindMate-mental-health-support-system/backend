### Supabase setup

This project uses Supabase for authentication, user profiles, and chat history.

#### 1. Required environment variables (backend)

Create a `.env` file in the `BACKEND` folder with at least:

- `SUPABASE_URL` – your Supabase project URL  
- `SUPABASE_KEY` – service role or anon key (used for database + auth)
- `SUPABASE_SERVICE_ROLE_KEY` (optional but recommended) – service role key for server-side JWT validation
- `TED_API_URL` (optional) – text emotion detection API URL
- `SED_API_URL` (optional) – speech/voice emotion detection API URL
- `AI_PROVIDER` (optional) – e.g. `gemini` (default), `ollama`, or `openai`
- `GEMINI_API_KEY` (required if using Gemini) – your Google AI Studio API Key
- `AI_MODEL` (optional) – e.g. `gemini-2.5-flash`, `mistral`

#### 2. Profiles table

Create a `profiles` table to store basic user info:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  gender text,
  age int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Optionally add a trigger to keep `updated_at` fresh.

#### 3. Chat history table

Chat messages are stored as JSON arrays (user + bot) per row:

```sql
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid, -- links to chat_sessions.id when sessions are used
  message_data jsonb not null,
  created_at timestamptz default now()
);

create index if not exists chat_history_user_id_idx on public.chat_history(user_id);
create index if not exists chat_history_session_id_idx on public.chat_history(session_id);
```

#### 4. Chat sessions table

Each chat session (conversation) is stored separately:

```sql
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  last_message_preview text,
  last_message_at timestamptz,
  mood text,
  archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists chat_sessions_user_id_idx on public.chat_sessions(user_id);
create index if not exists chat_sessions_active_idx on public.chat_sessions(user_id, archived);
```

#### 5. Row level security (RLS)

Enable RLS and restrict access so users can only see their own data:

```sql
alter table public.profiles enable row level security;
alter table public.chat_history enable row level security;
alter table public.chat_sessions enable row level security;

create policy "Users can manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read their own chat history"
  on public.chat_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat history"
  on public.chat_history
  for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own chat sessions"
  on public.chat_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat sessions"
  on public.chat_sessions
  for insert
  with check (auth.uid() = user_id);
```

Adjust policies as needed for your security model.

