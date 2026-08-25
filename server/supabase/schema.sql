-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Definitions for the application
-- We will store additional user info in a public.profiles table tied to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client', -- 'client' or 'team_member' or 'admin'
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  owner_id UUID REFERENCES auth.users(id),
  domain TEXT,
  logo TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  brand_colors TEXT NOT NULL DEFAULT '[]',
  services TEXT NOT NULL DEFAULT '[]',
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  target_audience TEXT,
  brand_tone TEXT,
  goals TEXT NOT NULL DEFAULT '[]',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Business Policies
-- Clients can read/write their own businesses. Admins/team members can read all.
CREATE POLICY "Team members can view all businesses" ON public.businesses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
);
CREATE POLICY "Owners can view own businesses" ON public.businesses FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Team members can insert businesses" ON public.businesses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
);
CREATE POLICY "Owners can insert own businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team members can update all businesses" ON public.businesses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
);
CREATE POLICY "Owners can update own businesses" ON public.businesses FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team members can delete businesses" ON public.businesses FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
);
CREATE POLICY "Owners can delete own businesses" ON public.businesses FOR DELETE USING (auth.uid() = owner_id);


-- Generic helper for RLS policies for business-owned tables
-- We will apply this check for all other tables
-- For a given table with `business_id`, a user can access it if:
-- 1. They are a team member/admin
-- 2. They own the business

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access contacts" ON public.contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.contacts.business_id AND owner_id = auth.uid())
);

-- Projects / Service Requests (NEW TABLE)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'scoping', -- 'scoping', 'in-progress', 'completed'
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.projects.business_id AND owner_id = auth.uid())
);

-- Leads (NEW TABLE based on requirement)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'converted'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access leads" ON public.leads FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.leads.business_id AND owner_id = auth.uid())
);

-- Analytics Snapshots (NEW TABLE based on requirement)
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- e.g. 'instagram', 'website'
  metric_type TEXT NOT NULL, -- e.g. 'followers', 'pageviews', 'engagement'
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access analytics_snapshots" ON public.analytics_snapshots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.analytics_snapshots.business_id AND owner_id = auth.uid())
);


-- Content Calendar
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  slot INTEGER,
  platform TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'user',
  content_hash TEXT,
  media_asset_id UUID,
  publish_status TEXT NOT NULL DEFAULT 'pending',
  published_at TIMESTAMPTZ,
  publish_error TEXT,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access content_calendar" ON public.content_calendar FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.content_calendar.business_id AND owner_id = auth.uid())
);


-- Social Connections
CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  account_id TEXT,
  account_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'connected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, platform)
);

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access social_connections" ON public.social_connections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.social_connections.business_id AND owner_id = auth.uid())
);


-- Assets
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'post-image',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access assets" ON public.assets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.assets.business_id AND owner_id = auth.uid())
);


-- Deals
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id),
  title TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stage TEXT NOT NULL DEFAULT 'lead',
  probability INTEGER NOT NULL DEFAULT 10,
  assigned_to UUID REFERENCES auth.users(id),
  expected_close_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access deals" ON public.deals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member')) OR
  EXISTS (SELECT 1 FROM public.businesses WHERE id = public.deals.business_id AND owner_id = auth.uid())
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_modtime BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_social_connections_modtime BEFORE UPDATE ON public.social_connections FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_deals_modtime BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
