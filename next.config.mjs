/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  webpack: (config) => {
    // Use in-memory cache instead of the on-disk PackFileCacheStrategy.
    // This prevents the corrupted `vendor-chunks` MODULE_NOT_FOUND errors
    // that occur when two `next dev` instances race on the same .next folder.
    config.cache = {
      type: "memory",
    };
    return config;
  },
};

export default nextConfig;
