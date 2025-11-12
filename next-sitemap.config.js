/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://businext.greenfourtech.com',
  generateRobotsTxt: true, // Genera robots.txt automáticamente
  changefreq: 'daily', // Frecuencia de actualización sugerida para los buscadores
  priority: 0.7, // Prioridad por defecto de las páginas
  sitemapSize: 5000, // Máximo de URLs por sitemap
  exclude: ['/auth/*', '/api/*', '/actions/*'], // Rutas que no quieres indexar
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://businext.greenfourtech.com/sitemap.xml', // Usa tu dominio real
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth', '/api', '/actions'],
      },
    ],
  },
}