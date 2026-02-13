-- Blog posts table for Supabase-backed content.
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  read_time text,
  category text,
  author text default 'GolfSimMap Team',
  featured boolean not null default false,
  cover_image text,
  faq jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_is_published
  on public.blog_posts (is_published);

create index if not exists idx_blog_posts_published_at
  on public.blog_posts (published_at desc);

create index if not exists idx_blog_posts_slug
  on public.blog_posts (slug);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read
on public.blog_posts
for select
to anon, authenticated
using (is_published = true);

