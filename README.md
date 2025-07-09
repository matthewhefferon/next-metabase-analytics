# 🧭 Metabase Compass

You grabbed a starter template, shipped your first version, and now you're wondering:

> “Is anybody even looking at this?”

That’s where Metabase Compass comes in.

This package gives you simple, no-nonsense web analytics you can explore in Metabase.
Page views, referrers, and location — all tracked to your own database.
No 3rd-party dashboards, no weird JS bundles, just raw data you can query and visualize however you want.

---

## Quick Start

### 1. Install the package

```bash
npm install metabase-compass
```

### 2. Copy the snippet

Copy `node_modules/metabase-compass/public/compass-snippet.js` to your app’s `public/` folder.

### 3. Add the script tag

Add this to your `<head>`:

```html
<script src="/compass-snippet.js"></script>
```

### 4. Add the API route

Create `pages/api/compass-event.js`:

```js
import { compassEventHandler } from "metabase-compass";
export default compassEventHandler;
```

### 5. Configure your database

Add your database connection string to `.env.local` (create the file if it doesn't exist):

```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

**Examples for different providers:**

- **Supabase**: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`
- **Neon**: `postgresql://[user]:[password]@[endpoint]/[database]`
- **PlanetScale**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **AWS RDS**: `postgresql://[user]:[password]@[endpoint]:5432/[database]`

### 6. Create the database table

Run this SQL in your database:

```sql
CREATE TABLE compass_events (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  userAgent TEXT,
  ip TEXT,
  country TEXT,
  region TEXT,
  state TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compass_events_type ON compass_events(type);
CREATE INDEX idx_compass_events_timestamp ON compass_events(timestamp);
CREATE INDEX idx_compass_events_path ON compass_events(path);
CREATE INDEX idx_compass_events_country ON compass_events(country);
CREATE INDEX idx_compass_events_state ON compass_events(state);
CREATE INDEX idx_compass_events_city ON compass_events(city);
```

---

## What gets tracked automatically?

- ✅ Page views
- ✅ Path, referrer, user agent, timestamp
- ✅ Location (country, state, city, lat/lon)

No code changes required. No config. Just add the script and go.

---

## Explore in Metabase

Install Metabase and connect it to your database:

- **Self-host:** https://www.metabase.com/docs/latest/operations-guide/installing.html
- **Try Cloud:** https://www.metabase.com/start

---

## Example Metabase Queries

```sql
-- Daily page views
SELECT
  DATE(timestamp) as date,
  COUNT(*) as page_views
FROM compass_events
WHERE type = 'page_view'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Users by country
SELECT
  country,
  COUNT(*) as views
FROM compass_events
WHERE country IS NOT NULL
GROUP BY country
ORDER BY views DESC;

-- Users by state
SELECT
  state,
  country,
  COUNT(*) as views
FROM compass_events
WHERE state IS NOT NULL
GROUP BY state, country
ORDER BY views DESC;

-- Users by city
SELECT
  city,
  state,
  country,
  COUNT(*) as views
FROM compass_events
WHERE city IS NOT NULL
GROUP BY city, state, country
ORDER BY views DESC;
```

---

MIT Licensed
