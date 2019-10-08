/* eslint required-jsdoc: "off", max-len: "off", require-jsdoc: "off" */
importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

// Initialize offline analytics
workbox.googleAnalytics.initialize();

// Place holder for precached assets
workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "fcedff5a300689b1c16619b281c6796c"
  },
  {
    "url": "css/index.css",
    "revision": "09ec0906d5f5baa2f95019759ab208df"
  },
  {
    "url": "js/zenscroll.min.js",
    "revision": "b6075f76c2f71bae72e7a544f61a0919"
  },
  {
    "url": "pages/404.html",
    "revision": "40acdc63b1e48c67fd1e32be262d6cc4"
  },
  {
    "url": "pages/offline.html",
    "revision": "f761dd08b66768c2d9a20131b080f457"
  }
]);

// Cache strategies definitions
// HTML caching strategy
const contentHandler = workbox.strategies.cacheFirst({
  cacheName: 'content-cache',
});

// CSS caching strategy
// Caching opaque responses is not the best way to do it,
// even with staleWhileRevalidate as the strategy. I trust
// the networks I'm using for this not to return a bad
// response, that said I should still implement some sort
// of error checking or create separate caches for local
// and third party content
const cssHandler = workbox.strategies.cacheFirst({
  cacheName: 'css-cache',
  plugins: [
    new workbox.cacheableResponse.Plugin({
      statuses: [0, 200],
    }),
    new workbox.expiration.Plugin({
      maxAgeSeconds: 60 * 60 * 24 * 14,
      // maxEntries: 30,
    }),
  ],
});

// JS caching strategy
const jsHandler = workbox.strategies.staleWhileRevalidate({
  cacheName: 'scripts-cache',
  plugins: [
    new workbox.cacheableResponse.Plugin({
      statuses: [0, 200],
    }),
    new workbox.expiration.Plugin({
      maxAgeSeconds: 60 * 60 * 24 * 14,
      // maxEntries: 30,
      // Automatically cleanup if quota is exceeded.
      purgeOnQuotaError: true,
    }),
  ],
});

// Since I'm working with this site, I'm working hard
// at making images performant. Hasn't worked quite
// as I expected so I'm keeping them around for 4 weeks
// and then getting rid of them.
const imageHandler = workbox.strategies.cacheFirst({
  cacheName: 'image-cache',
  plugins: [
    new workbox.expiration.Plugin({
      // Cache for a maximum of 30 days
      maxAgeSeconds: 60 * 60 * 24 * 30,
    }),
  ],
});

// Fonts will be the largest assets we cache with the
// service worker so we want to keep a few around
// and keep them for a while so we don't have to
// download them as often.
const fontHandler = workbox.strategies.cacheFirst({
  cacheName: 'fonts-cache',
  plugins: [
    new workbox.expiration.Plugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
      maxEntries: 5,
    }),
  ],
});

const extFontHandler = workbox.strategies.staleWhileRevalidate({
  cacheName: 'external-fonts',
  plugins: [
    new workbox.expiration.Plugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
      // maxEntries: 20,
    }),
    new workbox.cacheableResponse.Plugin({
      statuses: [0, 200],
      // Automatically cleanup if quota is exceeded.
      purgeOnQuotaError: true,
    }),
  ],
});

// Not really sure if I want this, may fill the
// cache with data that we don't really need/want
// I may change my mind if the content is DASH or HLS
// Switched it to networkOnly() while I decide
const videoHandler = workbox.strategies.networkOnly({});
// const videoHandler = workbox.strategies.cacheFirst({
//   cacheName: 'local-video',
//   plugins: [
//     new workbox.expiration.Plugin({
//       maxAgeSeconds: 180 * 24 * 60 * 60,
//     }),
//   ],
// });

// For external video I don't want to cache them and serve
// them from the network
const extVideoHandler = workbox.strategies.networkOnly({});

// HTML content other than index.html
workbox.routing.registerRoute(/.*\.html/, (args) => {
  return contentHandler.handle(args);
});

//  CSS other than index.css
workbox.routing.registerRoute(/.*\.css/, (args) => {
  return cssHandler.handle(args);
});

// JS other than index.js and any JSON file
workbox.routing.registerRoute(/.*\.js/, (args) => {
  return jsHandler.handle(args);
});

// Images.
// Note: that the then and catch promise blocks are commented out
// Until I figure out why it's returning the placeholder when
// the image is in the cache
workbox.routing.registerRoute(/.*\.(?:png|jpg|jpeg|svg|gif)/, (args) => {
  return imageHandler.handle(args);
});

// Third party fonts from typekit
workbox.routing.registerRoute(/https:\/\/use\.typekit\.net/, (args) => {
  return extFontHandler.handle(args);
});

// Third party fonts from google fonts
workbox.routing.registerRoute(/https:\/\/fonts\.(googleapis|gstatic)\.com/, (args) => {
  return extFontHandler.handle(args);
});

// Fonts
workbox.routing.registerRoute(/.*\.(?:woff|woff2|ttf|otf)/, (args) => {
  // console.log('Font Route Args: ', args);
  return fontHandler.handle(args);
});

// Local video
workbox.routing.registerRoute(/.*\.(?:webm|ogg|mp4|mkv)/, (args) => {
  return videoHandler.handle(args);
});

// External video
workbox.routing.registerRoute(/^(https:\/\/)(player\.vimeo.com|www\.youtube\.com)\/([\w\/]+)([\?].*)?$/, (args) => {
  return extVideoHandler(args);
});

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
workbox.routing.setCatchHandler(({event}) => {
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // http://bit.ly/2CW117e
  switch (event.request.destination) {
    case 'document':
      return caches.match('pages/offline.html');
      break;

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
