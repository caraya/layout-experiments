/* eslint require-jsdoc: "off",  max-len: "off" */
import {
  registerRoute,
  setCatchHandler,
} from 'workbox-routing';
import {
  CacheFirst,
  StaleWhileRevalidate,
  NetworkOnly,
} from 'workbox-strategies';
import {
  CacheableResponsePlugin,
} from 'workbox-cacheable-response';
import {
  ExpirationPlugin,
} from 'workbox-expiration';

import * as googleAnalytics from 'workbox-google-analytics';

// Testing this. It should work but...
// importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Initialize offline analytics
googleAnalytics.initialize();

// Place holder for precached assets
workbox.precaching.precacheAndRoute([{"revision":"090ac5cd016afb22fd4985a13c2b1bfd","url":"index.html"},{"revision":"09ec0906d5f5baa2f95019759ab208df","url":"css/index.css"},{"revision":"b6075f76c2f71bae72e7a544f61a0919","url":"js/zenscroll.min.js"},{"revision":"40acdc63b1e48c67fd1e32be262d6cc4","url":"pages/404.html"},{"revision":"f761dd08b66768c2d9a20131b080f457","url":"pages/offline.html"}]);

// HTML content other than index.html
registerRoute(
  new RegExp('/.*\.html/'),
  new CacheFirst({
    cacheName: 'content-cache',
  })
);

// CSS other than index.css
// CSS caching strategy
// Caching opaque responses is not the best way to do it,
// even with staleWhileRevalidate as the strategy. I trust
// the networks I'm using for this not to return a bad
// response, that said I should still implement some sort
// of error checking or create separate caches for local
// and third party content
registerRoute(
  new RegExp('/.*\.css/'),
  new CacheFirst({
    cacheName: 'css-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 14,
        // maxEntries: 30,
      }),
    ],
  })
);

// JS other than index.js and any JSON file
registerRoute(
  new RegExp('/.*\.js/'),
  new StaleWhileRevalidate({
    cacheName: 'scripts-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 14,
        // maxEntries: 30,
        // Automatically cleanup if quota is exceeded.
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Images.
// Note: that the then and catch promise blocks are commented out
// Until I figure out why it's returning the placeholder when
// the image is in the cache
registerRoute(
  new RegExp('image.png'),
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        // Cache for a maximum of 120 days
        maxAgeSeconds: 60 * 60 * 24 * 120,
      }),
    ],
  })
);

// Local fonts
// Fonts will be the largest assets we cache with the
// service worker so we want to keep a few around
// and keep them for a while so we don't have to
// download them as often.
registerRoute(
  new RegExp('.*\.(?:woff2|woff|ttf|otf)'),
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Third party fonts from Typekit or Google Fonts
// Placed in a separate cache because these may be opaque responses
registerRoute(
  new RegExp('(https:\/\/)(use\.typekit\.net|fonts\.(googleapis|gstatic)\.com)'),
  new StaleWhileRevalidate({
    cacheName: 'external-fonts',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        // maxEntries: 20,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
        // Automatically cleanup if quota is exceeded.
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// We don't want to chache video. They can be very large
// or require range request handling
// Local video
registerRoute(
  new RegExp('/.*\.(?:webm|mp4|av1)/'),
  new NetworkOnly(),
);

// External video
registerRoute(
  new RegExp('/^(https:\/\/)(player\.vimeo.com|www\.youtube\.com\/embed)\/([\w\/]+)([\?].*)?$/'),
  new NetworkOnly()
);

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(({event}) => {
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // http://bit.ly/2CW117e
  switch (event.request.destination) {
    case 'document':
      return caches.match('pages/offline.html');

    case 'image':
      return new Response(
        `<svg role="img"
      aria-labelledby="offline-title"
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg">
      <title id="offline-title">Offline</title>
      <g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/>
      <text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif"
      font-size="72" font-weight="bold">
      <tspan x="93" y="172">offline</tspan></text></g></svg>`,
        {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-store',
          },
      });
      break;

    default:
      // If we don't have a fallback, just return an error response.
      return Response.error();
  }
});

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    skipWaiting();
  }
});
