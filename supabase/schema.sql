-- =====================================================================
-- Omar Alshaer site — database schema for Supabase
-- Run ONCE in Supabase → SQL Editor → New query → paste all → Run.
-- Then make Omar the owner with the last line of this file.
-- =====================================================================

-- ---------- Owner list ------------------------------------------------
-- Only emails in this table get owner powers (publish to Work, delete).
create table if not exists public.owners (
  email text primary key
);
alter table public.owners enable row level security;  -- no policies: hidden from the public API

create or replace function public.is_owner()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.owners
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_owner() to anon, authenticated;

-- ---------- Posts -----------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  author_name text not null check (char_length(author_name) between 1 and 40),
  caption     text not null default '' check (char_length(caption) <= 500),
  image_url   text not null,
  image_path  text,
  featured    boolean not null default false,  -- true = Omar's "Work" gallery
  likes       integer not null default 0
);
create index if not exists posts_featured_created_idx on public.posts (featured, created_at desc);

-- ---------- Comments --------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 40),
  body        text not null check (char_length(body) between 1 and 500),
  by_owner    boolean not null default false
);
create index if not exists comments_post_created_idx on public.comments (post_id, created_at);

-- ---------- Row Level Security ----------------------------------------
alter table public.posts    enable row level security;
alter table public.comments enable row level security;

create policy "Anyone can read posts"
  on public.posts for select using (true);

create policy "Anyone can read comments"
  on public.comments for select using (true);

create policy "Visitors share community posts; the owner can post anything"
  on public.posts for insert to anon, authenticated
  with check ((featured = false and likes = 0) or public.is_owner());

create policy "Owner deletes posts"
  on public.posts for delete to authenticated
  using (public.is_owner());

create policy "Anyone can comment; only the owner gets the Owner badge"
  on public.comments for insert to anon, authenticated
  with check (by_owner = false or public.is_owner());

create policy "Owner deletes comments"
  on public.comments for delete to authenticated
  using (public.is_owner());

-- Likes go through this function so visitors can't change anything else on a post.
create or replace function public.like_post(pid uuid)
returns integer
language sql security definer
set search_path = public
as $$
  update public.posts set likes = likes + 1 where id = pid returning likes;
$$;
grant execute on function public.like_post(uuid) to anon, authenticated;

-- ---------- Photo storage ---------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Visitors upload to community/, the owner anywhere"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'photos'
    and ((storage.foldername(name))[1] = 'community' or public.is_owner())
  );

create policy "Owner deletes photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_owner());

-- ---------- Make Omar the owner ---------------------------------------
-- 1. Supabase → Authentication → Users → "Add user" → create Omar's email + password.
-- 2. Put that same email below, remove the leading "-- " and run just this line:
-- insert into public.owners (email) values ('omar@example.com');
