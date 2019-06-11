/* eslint require-jsdoc: "off", max-len: "off" */

// TODO: Create cache for external fonts
// TODO: Create cache for external CSS.
// TODO: Create cache for external JS
// TODO: Figure out how to make sure that opaque requests are
// good or we fail gracefully

const OFFLINESVG = `<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<title id="offline-title">Offline</title>
<g fill="none" fill-rule="evenodd">
<path fill="#D8D8D8" d="M0 0h400v300H0z"/>
<text fill="#9B9B9B" font-family="Times New Roman,Times,serif"
 font-size="72" font-weight="bold">
<tspan x="93" y="172">offline</tspan></text></g></svg>`;

// Individual constants for each of the caches.
// We store them separately so we can change the
// names to make cleanup easier
const PRECACHE = 'precache-v1';
const CONTENT = 'content-cache-v1';
const CSS = 'css-cache-v1';
const JS = 'scripts-cache-v1';
const IMAGES = 'image-cache-v1';
const FONTS = 'fonts-cache-v1';
const EXTERNAL_JS = 'external-js-v1';
const EXTERNAL_CSS = 'external-css-v1';
const EXTERNAL_FONTS = 'external-fonts-v1';

// Array of cache names. These are the caches
// that we expect to exists in the client.
// If they don't we're fine, we fetch from network
// if they do, we're fine, we fetch from cache
// If they exist with a different version then we
// delete the old one
const expectedCaches = [
  PRECACHE,
  CONTENT,
  CSS,
  JS,
  IMAGES,
  FONTS,
  EXTERNAL_JS,
  EXTERNAL_CSS,
  EXTERNAL_FONTS,
];

// Array of URLs that we want to cache on install.
const urlsToPrecache = [
  '/index.html',
  '/css/index.css',
  '/js/zenscroll.js',
  '/pages/404.html',
  '/pages/offline.html',
];

// Install events will precache indicated assets.
// It will not fire again until we updated the
// service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('install event fired');
  event.waitUntil(caches.open(PRECACHE)
  .then((precache) => {
    return precache.addAll(urlsToPrecache);
  })); // ends wait until
}); // ends install event

// Activate will perform cleanup on the caches.
// If there is a cache that doesn't exist in the
// Array that we pass to the event then it's deleted
// This is the reason why we went through such a
// convoluted way to define the caches. We can change
// the names individually and then they'll get deleted
// the next time the user visits the site.
self.addEventListener('activate', (event) => {
  clients.claim();
  // Wait until the process is complete
  event.waitUntil(
  // match the cache names
  caches.keys().then((keys) => {
    Promise
    .all(keys.map((key) => {
      // if the cache is not one in the list
      if (!expectedCaches.includes(key)) {
        // delete it
        return caches.delete(key);
      }
    }))
    .then(() => {
      console.log('Everything cleaned up');
    });
  }));
});

// Starting work in the fetch event handler.
// This event handler will handle all the requests and
// interventions for the site.
self.addEventListener('fetch', (event) => {
  // console.log(event.request);
  const request = event.request;

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // FONT HANDLER
  // It wasn't working because the font request was loaded
  // from a stylesheet and not the web page. I cheated by
  // adding a condition that matches the stylesheet making
  // the request for the font.
  if (request.url.match(/\.(woff|woff2)$/) ||
    (request.referrer.includes('typography'))) {
    event.waitUntil(
      // Open the fonts cache
      caches.open(FONTS)
        .then((cache) => {
          // return the FONTS to the user
          return cache.match(request);
        })
        .then((response) => {
          // Open the cache
          caches.open(FONTS)
          .then((cache) => {
            // Fetch the resource from the network
            return fetch(request)
            .then((response) => {
              // Put a copy of the response in the cache
              // Otherwise it'll throw because response is
              // a stream that can only be consumed once
              return cache.put(request, response.clone())
              .then(() => {
                // Return the response
                return response;
              }); // Closes return response
            }); // Closes fetch then)
          }); // closes caches.open then
        })
    );
  } // Closes IF

  if (request.url.match(/\.(js)$/) && (!request.url.includes('zenscroll'))) {
    event.waitUntil(
      caches.open(JS)
      .then((cache) => {
        return cache.match(request);
      })
      .then((response) => {
        caches.open(JS)
        .then((cache) => {
          fetch(request)
          .then((response) => {
            // Put a copy of the response in the cache
            // Otherwise it'll throw because response
            // is a stream so it can be used only once
            return cache.put(request, response.clone())
              .then(() => {
                // Return the response
                return response;
              });
          });
        });
      })
    );
    return;
  }

  // Handle CSS
  // We might have the same issue of resources being cached in
  // two places. Working on figuring out a solution
  if (request.url.match(/\.(css)$/) &&
    !request.url.includes('woff2')) {
    event.waitUntil(
      // Open the content cache
      caches.open(CSS)
        .then((cache) => {
          // return the CSS to the user
          return cache.match(request);
        })
        .then((response) => {
          // Open the cache
          return caches.open(CSS).then((cache) => {
            // Fetch the resource from the network
            fetch(request).then((response) => {
              // Put a copy of the response in the cache
              // Otherwise it'll throw because response
              // is a stream so it can be used only once
              return cache.put(request, response.clone()).then(() => {
                // Return the response
                return response;
              });
            });
          });
        })
    );
    return;
  }

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/) &&
    (!request.url.match('/\.(html|css)$/'))) {
    event.waitUntil(
      caches.open(IMAGES)
      .then((cache) => {
        // return the IMAGES to the user
        return caches.match(request);
      })
      .then((response) => {
        // Open the cache
        return caches.open(IMAGES)
        .then((cache) => {
          // Fetch the resource from the network
          fetch(request)
          .then((response) => {
            // Put a copy of the response in the cache
            // Otherwise it'll throw because response
            // is a stream so it can be used only once
            return cache.put(request, response.clone())
            .then(() => {
              // Return the response
              return response;
            });
          })
          .catch((error) => {
            return new Response(OFFLINESVG, {
              headers: {
                'Content-Type': 'image/svg+xml',
              },
            });
          });
        });
      })
    );
    return; // If we get to here, bail out
  }

  // Handle HTML pages
  // TODO: find out what happens if you have the same resource
  // in multiple caches
  if (event.request.headers.get('Accept').includes('text/html')) {
    // Open the content cache
    console.log(request);
    caches.open(CONTENT)
    .then((cache) => {
      // return the content to the user
      console.log(`Getting ${request.url} from cache`);
      return caches.match(request);
    })
    .then((response) => {
      // Open the cache
      caches.open(CONTENT)
      .then((cache) => {
        // Fetch the resource from the network
        console.log(`${request} not cached, fetching from network`);
        fetch(request)
        .then((response) => {
          // Put a copy of the response in the cache
          // Otherwise it'll throw because response is
          // a stream that can only be consumed once
          cache.put(request, response.clone())
          .then(() => {
            // Return the response
            return response;
          });
        });
      });
    });
  }
});
