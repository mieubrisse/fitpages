import { put } from "@vercel/blob";
import type { IncomingMessage, ServerResponse } from "http";
import { Buffer } from "buffer";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Dynamically import busboy for ESM compatibility
  const Busboy = (await import("busboy")).default;
  const bb = Busboy({ headers: req.headers });

  let fileBuffer = Buffer.alloc(0);

  await new Promise<void>((resolve, reject) => {
    bb.on("file", (_fieldname: string, file: NodeJS.ReadableStream) => {
      file.on("data", (data: Buffer) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });
    bb.on("finish", resolve);
    bb.on("error", reject);
    (req as any).pipe(bb);
  });

  try {
    await put("FitNotes_Backup.fitnotes", fileBuffer, { access: "public", allowOverwrite: true });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: true }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message }));
  }
}
