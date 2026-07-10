/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle under .next/standalone/
  // Required for the Docker multi-stage build to work correctly.
  output: "standalone",
};

module.exports = nextConfig;
