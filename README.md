# Next Metabase Analytics

Simple web analytics for your Next.js app with Metabase.

## Why use this?

If you're building with Next.js and want simple, self-hosted analytics you can explore in Metabase — without using Google Analytics or complex tools — this package is for you.

- ✅ **No external dependencies** - Uses your existing Postgres database
- ✅ **Privacy-first** - Your data stays on your servers
- ✅ **Metabase integration** - Visual dashboards without writing SQL
- ✅ **Real-time insights** - See visitor behavior as it happens
- ✅ **Fully open source** - No vendor lock-in or hidden costs

## Quick Start

### 1. Install the package

```bash
npm install next-metabase-analytics
```

### 2. Run the setup

```bash
npx next-metabase-analytics-setup
```

This will automatically:

- Copy the tracking snippet to `public/next-analytics-snippet.js`
- Create the API route at `pages/api/next-analytics-event.js` (Pages Router) or `src/app/api/next-analytics-event/route.ts` (App Router)
- Add the script tag to your layout file

### 3. Set up your database

Add your `DATABASE_URL` to `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

**Database options:**

- **Supabase**: [supabase.com](https://supabase.com)
- **Neon**: [neon.tech](https://neon.tech)
- **Self-hosted**: Any PostgreSQL server

### 4. Create the database table

Run this SQL in your database:

```sql
CREATE TABLE next_analytics_events (
  -- Core event identification
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'page_view', 'click', 'form_submit'
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Page context
  path VARCHAR(500) NOT NULL, -- Clean route path (/about, /contact)
  url TEXT, -- Full URL with query parameters
  title VARCHAR(500), -- Page title
  referrer VARCHAR(500), -- Where visitor came from

  -- User identification
  sessionid VARCHAR(100), -- Session identifier
  anonymous_id VARCHAR(100), -- Cross-session user tracking

  -- Location data
  ip VARCHAR(45),
  country VARCHAR(100),
  region VARCHAR(100), -- International regions
  state VARCHAR(100), -- US states
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50),

  -- Device and browser info
  device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
  browser VARCHAR(50), -- 'Chrome', 'Safari', 'Firefox'
  os VARCHAR(50), -- 'Windows', 'macOS', 'iOS'
  screen_resolution VARCHAR(20), -- '1920x1080'

  -- Performance metrics
  page_load_time INTEGER, -- Load time in milliseconds

  -- Marketing attribution (UTM parameters)
  utm_source VARCHAR(200), -- Traffic source (google, facebook)
  utm_medium VARCHAR(200), -- Marketing medium (cpc, email)
  utm_campaign VARCHAR(200), -- Campaign name
  utm_term VARCHAR(200), -- Search terms
  utm_content VARCHAR(200), -- Ad content variant

  -- Ad platform tracking
  gclid VARCHAR(200), -- Google Ads click ID
  fbclid VARCHAR(200), -- Facebook Ads click ID
  ref VARCHAR(200), -- Custom referrer parameter

  -- Click tracking fields
  element VARCHAR(50), -- Element type ('button', 'a')
  element_text VARCHAR(200), -- Button/link text ('Sign Up', 'Learn More')
  element_id VARCHAR(100), -- Element ID attribute ('signup-btn', 'hero-cta')
  element_class VARCHAR(200), -- Element class names ('btn-primary', 'cta-button')
  href VARCHAR(500), -- Link destination URL

  -- Form tracking fields
  form_id VARCHAR(100), -- Form ID attribute
  form_action VARCHAR(500), -- Form submission URL
  form_method VARCHAR(10) -- Form method ('GET', 'POST')
);

CREATE INDEX idx_next_analytics_events_timestamp ON next_analytics_events(timestamp);
CREATE INDEX idx_next_analytics_events_type ON next_analytics_events(type);
CREATE INDEX idx_next_analytics_events_session ON next_analytics_events(sessionid);
CREATE INDEX idx_next_analytics_events_anonymous ON next_analytics_events(anonymous_id);
CREATE INDEX idx_next_analytics_events_utm_campaign ON next_analytics_events(utm_campaign);
CREATE INDEX idx_next_analytics_events_utm_source ON next_analytics_events(utm_source);
CREATE INDEX idx_next_analytics_events_element ON next_analytics_events(element);
CREATE INDEX idx_next_analytics_events_form_id ON next_analytics_events(form_id);
```

**To delete all data:** `TRUNCATE TABLE next_analytics_events RESTART IDENTITY;`

**To drop the table:** `DROP TABLE next_analytics_events CASCADE;`

---

## What gets tracked

### Event Types

- **Page views** - Every page load and client-side navigation
- **Click tracking** - Button and link clicks with details (text, ID, class, href)
- **Form submissions** - Form submissions with metadata (ID, action, method)

### User & Session Data

- **Session ID** - Unique identifier for tracking user journeys
- **Anonymous ID** - Cross-session user tracking (persists across browser sessions)

### Device & Browser Info

- **Device type** - Mobile, desktop, or tablet
- **Browser** - Chrome, Safari, Firefox, Edge, Opera
- **Operating system** - Windows, macOS, Linux, Android, iOS
- **Screen resolution** - User's screen dimensions

### Page Context

- **Clean path** - Route path (/about, /contact)
- **Full URL** - Complete URL including query parameters
- **Page title** - Document title
- **Referrer** - Where visitors came from (shows "direct" for direct visits)

### Marketing Attribution

- **UTM parameters** - utm_source, utm_medium, utm_campaign, utm_term, utm_content
- **Ad platform tracking** - Google Ads (gclid), Facebook Ads (fbclid)
- **Custom referrer** - Custom ref parameter for internal tracking

### Location Data

- **IP address** - Visitor's IP address
- **Country** - Visitor's country
- **Region** - International regions
- **State** - US states and other state-level divisions
- **City** - Visitor's city
- **Coordinates** - Latitude and longitude
- **Timezone** - Visitor's timezone

### Performance

- **Page load time** - How long pages take to load (in milliseconds)
- **Timestamp** - When each event occurred

## Explore in Metabase

You can use Metabase's visual query builder to explore your data - no SQL required!

[![Self-host Metabase](https://img.shields.io/badge/Self--host-Metabase-blue?logo=metabase)](https://www.metabase.com/docs/latest/operations-guide/installing.html)
[![Try Metabase Cloud](https://img.shields.io/badge/Try%20Cloud-Metabase-brightgreen?logo=metabase)](https://www.metabase.com/start)

```

```
