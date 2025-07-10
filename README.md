# 🧭 Metabase Compass

Simple web analytics for your Next.js app with Metabase.

## Quick Start

### 1. Install the package

```bash
npm install metabase-compass
```

The setup script will automatically:
- Copy the tracking snippet to `public/compass-snippet.js`
- Create the API route at `src/app/api/compass-event/route.ts`

### 2. Add the script tag

Add this to your `<head>` in `src/app/layout.tsx`:

```tsx
<script src="/compass-snippet.js"></script>
```

### 3. Set up your database

Add your `DATABASE_URL` to `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

### 4. Create the database table

Run this SQL in your database:

```sql
CREATE TABLE compass_events (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  path VARCHAR(500) NOT NULL,
  referrer VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  userAgent TEXT,
  sessionid VARCHAR(100),
  ip VARCHAR(45),
  country VARCHAR(100),
  region VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compass_events_timestamp ON compass_events(timestamp);
CREATE INDEX idx_compass_events_type ON compass_events(type);
CREATE INDEX idx_compass_events_session ON compass_events(sessionid);
```

---

## What gets tracked

- **Page views** - Every page load
- **Referrer** - Where visitors came from (shows "direct" for direct visits)
- **Location** - IP, country, region, city, coordinates, timezone
- **Session ID** - Unique identifier for tracking user journeys (persists across page loads)
- **User agent** - Browser and device info
- **Timestamp** - When the event occurred

---

## Explore in Metabase

You can use Metabase's visual query builder to explore your data - no SQL required!

[![Self-host Metabase](https://img.shields.io/badge/Self--host-Metabase-blue?logo=metabase)](https://www.metabase.com/docs/latest/operations-guide/installing.html)
[![Try Metabase Cloud](https://img.shields.io/badge/Try%20Cloud-Metabase-brightgreen?logo=metabase)](https://www.metabase.com/start)
