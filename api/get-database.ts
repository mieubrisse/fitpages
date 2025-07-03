import { head } from "@vercel/blob";
import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const blobInfo = await head("database.fitnotes");

    if (!blobInfo) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Database not found" }));
      return;
    }

    // Fetch the blob content from the URL
    const response = await fetch(blobInfo.url);

    if (!response.ok) {
      res.statusCode = response.status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Failed to fetch database content" }));
      return;
    }

    const arrayBuffer = await response.arrayBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", arrayBuffer.byteLength.toString());
    res.end(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("Error fetching database:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message }));
  }
}
