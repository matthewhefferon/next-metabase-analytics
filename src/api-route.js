import { Pool } from "pg";

// Create database connection pool with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Limit concurrent connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Handle analytics events
async function analyticsEventHandler(req, res) {
  let client;

  try {
    // Only handle POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const event = req.body;

    // Log in development only
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Analytics] ${event.type} event from ${event.path}`);
    }

    // Validate required fields
    if (!event.type || !event.path || !event.timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Extract location data if present
    const location = event.location || {};

    // Get a client from the pool
    client = await pool.connect();

    // Insert event into database
    const query = `
      INSERT INTO next_analytics_events (
        type, path, url, title, referrer, timestamp, sessionid,
        anonymous_id, country, region, state, city, latitude, longitude, timezone,
        device_type, browser, os, page_load_time,
        session_start, session_end, session_duration,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        gclid, fbclid, ref
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
    `;

    const values = [
      event.type,
      event.path,
      event.url || null,
      event.title || null,
      event.referrer || null,
      event.timestamp,
      event.sessionId || null,
      event.anonymous_id || null,
      location.country || null,
      location.region || null,
      location.state || null,
      location.city || null,
      location.latitude || null,
      location.longitude || null,
      location.timezone || null,
      event.device_type || null,
      event.browser || null,
      event.os || null,
      event.page_load_time || null,
      event.session_start || null,
      event.session_end || null,
      event.session_duration || null,
      event.utm_source || null,
      event.utm_medium || null,
      event.utm_campaign || null,
      event.utm_term || null,
      event.utm_content || null,
      event.gclid || null,
      event.fbclid || null,
      event.ref || null,
    ];

    await client.query(query, values);

    return res.status(200).json({ success: true });
  } catch (error) {
    // Always log errors (both development and production)
    console.error("Analytics event error:", error);

    // Check if it's a connection error
    if (error.code === "XX000" || error.message.includes("db_termination")) {
      console.error(
        "[Analytics] Database connection terminated, attempting to reconnect..."
      );
      return res
        .status(503)
        .json({ error: "Database temporarily unavailable" });
    }

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Always release the client back to the pool
    if (client) {
      client.release();
    }
  }
}

export default analyticsEventHandler;
