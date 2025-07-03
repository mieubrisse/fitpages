import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/setupTests.js",
    },
    server: {
      host: "0.0.0.0",
    },
    // Make environment variables available to the API routes
    define: {
      "process.env.BLOB_READ_WRITE_TOKEN": JSON.stringify(env.BLOB_READ_WRITE_TOKEN),
    },
  };
});
