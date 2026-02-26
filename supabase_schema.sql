-- ==========================================
-- SUPABASE POSTGRESQL SCHEMA FOR AAYAM
-- Paste this entire file into the Supabase SQL Editor
-- ==========================================

-- 1. USERS TABLE
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- 2. EVENTS TABLE
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('upcoming', 'past')),
  title TEXT NOT NULL,
  shortDescription TEXT NOT NULL,
  description TEXT NOT NULL,
  about TEXT,
  startDate TIMESTAMPTZ NOT NULL,
  endDate TIMESTAMPTZ NOT NULL,
  bannerImage TEXT NOT NULL,
  registrationLink TEXT,
  galleryImages JSONB DEFAULT '[]'::jsonb, -- Array of strings
  conductedBy JSONB DEFAULT '[]'::jsonb,   -- Array of objects {name, email}
  contacts JSONB DEFAULT '[]'::jsonb,      -- Array of strings
  prizes JSONB DEFAULT '[]'::jsonb,        -- Array of strings
  documents JSONB DEFAULT '[]'::jsonb,     -- Array of objects {title, file, isPublic}
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- 3. REVIEWS TABLE
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- 4. REACH_OUTS TABLE
CREATE TABLE public.reach_outs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('Event Feedback', 'Event Idea', 'Collaboration', 'Sponsorship', 'Volunteer', 'General Query')),
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- 5. HOME_GALLERY TABLE
CREATE TABLE public.home_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('what_we_do', 'events')),
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- 6. TEAM_SECTIONS TABLE
CREATE TABLE public.team_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- 7. TEAM_MEMBERS TABLE
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  section UUID NOT NULL REFERENCES public.team_sections(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Row Level Security (RLS) Configuration
-- (Optional: Disable RLS for all tables so the backend can freely interact with them. Or alternatively, use the 'service_role' key in your backend).
-- By default, tables created via the SQL editor have RLS disabled.
-- ==========================================
