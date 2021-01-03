/* eslint require-jsdoc: "off",  max-len: "off", new-cap: "off" */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js');

const {registerRoute} = workbox.routing;
const {StaleWhileRevalidate, CacheFirst} = workbox.strategies;
const {CacheableResponsePlugin} = workbox.cacheableResponse;
const {ExpirationPlugin} = workbox.expirationPlugin;

// Precache insertion point
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Load google analytics plugin
workbox.googleAnalytics.initialize();

registerRoute(({url}) => url.endsWith(['html', 'htm', 'php']),
  new CacheFirst({
    cacheName: 'Content',
    plugins: [
      ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 30,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(({url}) => url.endsWith('css'),
  new StaleWhileRevalidate({
    cacheName: 'CSS Styles',
    plugins: [
      ExpirationPlugin({
        magAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 30,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(({url}) => url.endsWith(['js', 'mjs']),
  new CacheFirst({
    cacheName: 'scripts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 30,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(({url}) => {
  url.origin === 'https://fonts.googleapis.com/' ||
  url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
  cacheName: 'Google Fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
          maxAgeSeconds: 180 * 24 * 60 * 60,
          maxEntries: 50,
          purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(({url}) => url.endsWith(['woff', 'woff2', 'ttf', 'otf']),
  new CacheFirst({
    cacheName: 'Local Fonts',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 180 * 24 * 60 * 60,
        maxEntries: 50,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(({url}) => url.endsWith(['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'avif', 'heic', 'heif']),
  new CacheFirst({
    cacheName: 'Local Images',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 180 * 24 * 60 * 60,
        maxEntries: 50,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

setCatchHandler(({event}) => {
  switch (event.request.destination) {
    case 'document':
      return matchPrecache('pages/offline.html');
    break;

    case 'image':
      return new Response(`<svg role="img"
        aria-labelledby="offline-title"
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg">
        <title id="offline-title">Offline</title>
        <g fill="none" fill-rule="evenodd">
        <path fill="#D8D8D8" d="M0 0h400v300H0z"></path>
        <text fill="#9B9B9B"
            font-family="Helvetica Neue,Arial,Helvetica,sans-serif"
            font-size="72" font-weight="bold">
        <tspan x="93" y="172">offline</tspan></text></g>
      </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store',
      },
    });
    break;

    default:
      return Response.error();
  }
});
