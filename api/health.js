// Reports the running function's Node version, so a deploy's runtime can be read back with curl.
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
}
