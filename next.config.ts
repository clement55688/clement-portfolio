import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Temporary (307) until the new routes have been live for a while.
    return [
      { source: "/playground", destination: "/play", permanent: false },
      { source: "/fit", destination: "/tools", permanent: false },
      { source: "/dj-intake", destination: "/tools/dj-intake", permanent: false },
      // Short link to share; resolves to the same GitHub release asset as the Download buttons.
      { source: "/download/dj-intake", destination: "https://github.com/clement55688/dj-intake-app/releases/latest/download/DJ-Intake-macOS-installer.zip", permanent: false },
    ];
  },
};

export default nextConfig;
