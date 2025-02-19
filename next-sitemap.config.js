const { withSitemap } = require('next-sitemap');

module.exports = withSitemap({
  siteUrl: 'https://histovest.com',
  generateRobotsTxt: true,
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/static/sitemap.xml' },
      { source: '/sitemap-0.xml', destination: '/static/sitemap-0.xml' },
      { source: '/robots.txt', destination: '/static/robots.txt' },
    ];
  },
});
