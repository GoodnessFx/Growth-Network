export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  owner_id TEXT NOT NULL REFERENCES users(id),
  domain TEXT,
  logo TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contact_id TEXT REFERENCES contacts(id),
  title TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  stage TEXT NOT NULL DEFAULT 'lead',
  probability INTEGER NOT NULL DEFAULT 10,
  assigned_to TEXT,
  expected_close_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contact_id TEXT REFERENCES contacts(id),
  contact_phone TEXT NOT NULL,
  direction TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  template_name TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  whatsapp_message_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  platform TEXT NOT NULL,
  post_id TEXT,
  content TEXT NOT NULL,
  media_urls TEXT NOT NULL DEFAULT '[]',
  scheduled_for TEXT,
  published_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  metrics TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS social_connections (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  platform TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  account_id TEXT,
  account_name TEXT,
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, platform)
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  budget REAL NOT NULL DEFAULT 0,
  spent REAL NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  platform_id TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tracking_events (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_url TEXT NOT NULL,
  referrer TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  ip TEXT,
  user_agent TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config TEXT NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS export_shipments (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  order_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  buyer TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  product_description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'units',
  total_value REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  incoterm TEXT NOT NULL DEFAULT 'FOB',
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_delivery TEXT,
  actual_delivery TEXT,
  documents TEXT NOT NULL DEFAULT '[]',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS response_times (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  channel TEXT NOT NULL,
  received_at TEXT NOT NULL,
  responded_at TEXT,
  response_time_seconds INTEGER,
  breached INTEGER NOT NULL DEFAULT 0,
  target_seconds INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contact_id TEXT REFERENCES contacts(id),
  scheduled_for TEXT NOT NULL,
  executed_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  type TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  metrics TEXT NOT NULL DEFAULT '{}',
  before_image TEXT,
  after_image TEXT,
  source TEXT NOT NULL DEFAULT 'self-reported',
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_business ON contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_business ON whatsapp_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_social_business ON social_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_connections_business ON social_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_business ON ad_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_tracking_business ON tracking_events(business_id);
CREATE INDEX IF NOT EXISTS idx_tracking_timestamp ON tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_business ON audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_business ON export_shipments(business_id);
CREATE INDEX IF NOT EXISTS idx_response_times_business ON response_times(business_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled ON follow_ups(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reports_business ON reports(business_id);
`
