import { head } from "@vercel/blob";
import { Buffer } from "buffer";

const DATABASE_BLOB_KEY = "database.fitnotes";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const blobInfo = await head(DATABASE_BLOB_KEY);

    if (!blobInfo) {
      res.status(404).json({ error: "Database not found" });
      return;
    }

    const response = await fetch(blobInfo.url);

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch database content" });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", arrayBuffer.byteLength.toString());
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Error fetching database:", err);
    res.status(500).json({ error: err.message });
  }
}
