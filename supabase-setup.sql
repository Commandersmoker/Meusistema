-- =============================================================
-- MARCELINO BORDADOS v18 — BANCO ONLINE
-- Execute TODO este arquivo no SQL Editor do Supabase.
-- =============================================================

create table if not exists public.user_databases (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.user_databases enable row level security;

-- Cada conta só pode acessar o próprio banco.
drop policy if exists "user_databases_select_own" on public.user_databases;
create policy "user_databases_select_own"
on public.user_databases
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_databases_insert_own" on public.user_databases;
create policy "user_databases_insert_own"
on public.user_databases
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_databases_update_own" on public.user_databases;
create policy "user_databases_update_own"
on public.user_databases
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_databases_delete_own" on public.user_databases;
create policy "user_databases_delete_own"
on public.user_databases
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_databases to authenticated;

-- Índice já existe implicitamente pela chave primária user_id.
-- Não exponha service_role no GitHub Pages.
