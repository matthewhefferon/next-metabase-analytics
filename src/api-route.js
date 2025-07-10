import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export default async function compassEventHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;

    if (!event.type) {
      return res.status(400).json({ error: "Event type is required" });
    }

    const {
      type,
      path,
      referrer,
      timestamp,
      userAgent,
      sessionId,
      location,
      ...payload
    } = event;

    const eventData = {
      type,
      path,
      referrer,
      timestamp: timestamp || new Date().toISOString(),
      userAgent,
      sessionid: sessionId, // Map to lowercase column name
      ip: location?.ip,
      country: location?.country,
      region: location?.region,
      state: location?.region || location?.state || null,
      city: location?.city,
      latitude: location?.latitude,
      longitude: location?.longitude,
      timezone: location?.timezone,
    };

    // Insert event using native pg
    const query = `
      INSERT INTO compass_events (
        type, path, referrer, timestamp, userAgent, sessionid, 
        ip, country, region, state, city, latitude, longitude, timezone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const values = [
      eventData.type,
      eventData.path,
      eventData.referrer,
      eventData.timestamp,
      eventData.userAgent,
      eventData.sessionid,
      eventData.ip,
      eventData.country,
      eventData.region,
      eventData.state,
      eventData.city,
      eventData.latitude,
      eventData.longitude,
      eventData.timezone,
    ];

    await pool.query(query, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
