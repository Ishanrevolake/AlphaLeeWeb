create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  wordpress_id bigint unique,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  status text not null default 'published',
  category text,
  cover_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts
  add column if not exists wordpress_id bigint,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists status text default 'published',
  add column if not exists category text,
  add column if not exists cover_image_url text,
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists blog_posts_wordpress_id_key
  on public.blog_posts (wordpress_id)
  where wordpress_id is not null;

create unique index if not exists blog_posts_slug_key
  on public.blog_posts (slug);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;

create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_posts_updated_at();
