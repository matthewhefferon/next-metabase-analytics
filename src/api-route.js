import { Pool } from "pg";

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Handle analytics events
async function analyticsEventHandler(req, res) {
  try {
    // Only handle POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const event = req.body;

    // Validate required fields
    if (!event.type || !event.path || !event.timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Extract location data if present
    const location = event.location || {};

    // Insert event into database
    const query = `
      INSERT INTO next_analytics_events (
        type, path, referrer, timestamp, userAgent, sessionid,
        ip, country, region, state, city, latitude, longitude, timezone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const values = [
      event.type,
      event.path,
      event.referrer || null,
      event.timestamp,
      event.userAgent || null,
      event.sessionId || null,
      location.ip || null,
      location.country || null,
      location.region || null,
      location.state || null,
      location.city || null,
      location.latitude || null,
      location.longitude || null,
      location.timezone || null,
    ];

    await pool.query(query, values);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Analytics event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default analyticsEventHandler;
