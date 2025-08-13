import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "kevinstandagephotography.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "whc.unesco.org",
      },
      {
        protocol: "https",
        hostname: "insightsindia.blogspot.com",
      },
      {
        protocol: "https",
        hostname: "www.latlong.net",
      },
      {
        protocol: "https",
        hostname: "bhuvan-app1.nrsc.gov.in",
      },
      {
        protocol: "https",
        hostname: "hanumakonda.telangana.gov.in",
      },
      {
        protocol: "https",
        hostname: "s7ap1.scene7.com",
      },
      {
        protocol: "https",
        hostname: "asi.nic.in",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "weekendyaari.in",
      },
      {
        protocol: "https",
        hostname: "warangaltourism.in",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
