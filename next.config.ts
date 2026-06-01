import type { NextConfig } from "next";

const minioRemotePatterns = [
  {
    protocol: 'http' as const,
    hostname: 'localhost',
    port: '9000',
    pathname: '/**',
  },
  {
    protocol: 'http' as const,
    hostname: 'hrms-minio',
    port: '9000',
    pathname: '/**',
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: minioRemotePatterns,

    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
