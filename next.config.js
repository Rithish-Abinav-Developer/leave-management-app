const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["document-file-uploads-bucket.s3.ap-south-1.amazonaws.com"],
  },
};

module.exports = withPWA(nextConfig);
