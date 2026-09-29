/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'fimgs.net',
      'www.cleopatraperfumes.com',
      'cdn.shopify.com', // Arome.mx (Shopify CDN)
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
