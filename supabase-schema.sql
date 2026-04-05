-- Supabase Schema for Alpha Lee Fitness Funnel
-- Paste this into your Supabase SQL Editor to create tables

-- Create Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER,
    weight TEXT,
    height TEXT,
    goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending'::text,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Add RLS (Row Level Security) policies if accessing from frontend without service role
-- Since we are doing DB operations in server-side API routes, we don't strictly need RLS here, 
-- but it's good practice.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role
CREATE POLICY "Enable ALL for service-role" ON public.users USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service-role" ON public.subscriptions USING (true) WITH CHECK (true);
