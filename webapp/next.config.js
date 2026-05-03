/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Route /blog to the WordPress instance
        source: '/blog',
        destination: `${process.env.WORDPRESS_URL || 'https://example-wp-domain.com'}`,
      },
      {
        // Route all child paths of /blog to the WordPress instance
        source: '/blog/:path*',
        destination: `${process.env.WORDPRESS_URL || 'https://example-wp-domain.com'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
