(global => {
  'use strict';

// Service Worker Script
// Import the SW Toolbox library

importScripts('sw-toolbox.js');

// Google Analytics
self.goog = {DEBUG: true};
importScripts('offline-google-analytics-import.js');
goog.offlineGoogleAnalytics.initialize({
});

// Turn on debug logging, visible in the Developer Tools' console.
global.toolbox.options.debug = false;

// Precache critical resources

 const FILES_TO_PRECACHE = ['/', 'https://technutty.co.uk/TechNuttyLogo.svg', 'https://technutty.co.uk/TechNuttyLogo.png', '/offline', 'https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/css/stylesheet.shorthand.min.css?v=3.0.7', 'https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/js/scripts.combined.min.js?v=1.1', 'https://technutty.co.uk/wp-includes/js/jquery/jquery.js', 'https://technutty.co.uk/wp-includes/js/jquery/jquery-migrate.min.js', 'https://technutty.co.uk/modernizr-custom.js', 'https://technutty.co.uk/topics/articles/all/news/', 'https://technutty.co.uk/topics/articles/all/reviews/', 'https://technutty.co.uk/merged-single-plugin.css', 'https://technutty.co.uk/modernizr-custom.js'];

global.toolbox.precache(FILES_TO_PRECACHE);

// @see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response

const CACHE_VERSION = 1;
let CURRENT_CACHES = {
  offline: 'offline-v' + CACHE_VERSION
};
const OFFLINE_URL = '/offline';

function createCacheBustedRequest(url) {
  let request = new Request(url, {cache: 'reload'});
  if ('cache' in request) {
    return request;
  }
  // If {cache: 'reload'} didn't have any effect, append a cache-busting URL parameter instead.
  let bustedUrl = new URL(url, self.location.href);
  bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
  return new Request(bustedUrl);
}

self.addEventListener('install', event => {
  event.waitUntil(
    fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(response) {
      return caches.open(CURRENT_CACHES.offline).then(function(cache) {
        return cache.put(OFFLINE_URL, response);
      });
    })
  );
});

self.addEventListener('activate', event => {
  let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' ||
      (event.request.method === 'GET' &&
       event.request.headers.get('accept').includes('text/html'))) {
    console.log('Handling fetch event for', event.request.url);
    event.respondWith(
      fetch(event.request).catch(error => {
        console.log('Fetch failed; returning offline page instead.', error);
        return caches.match(OFFLINE_URL);
      })
    );
  }
  
});

// Home router
// Home

self.toolbox.router.get('/', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

// Home png

self.toolbox.router.get('/TechNuttyLogo.png', self.toolbox.cacheFirst, {
  cache: {
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// Home svg

self.toolbox.router.get('/TechNuttyLogo.svg', self.toolbox.cacheFirst, {
  cache: {
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// PageSpeed

self.toolbox.router.get('pagespeed_static/(.*)', self.toolbox.cacheFirst, {
  cache: {
    name: 'PageSpeed',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// Main Assets CSS router

self.toolbox.router.get('/wp-content/themes/TechNutty5-5/library/css/(.*)', self.toolbox.cacheFirst, {  
  cache: {
    name: 'staticMainAssetsCache',
    maxEntries: 50
  }
});

// Main Assets JS router

self.toolbox.router.get('/wp-content/themes/TechNutty5-5/library/js/(.*)', self.toolbox.cacheFirst, {  
  cache: {
    name: 'staticMainAssetsCache',
    maxEntries: 50
  }
});

// Main Assets Includes JS router

self.toolbox.router.get('/wp-includes/js/(.*)', self.toolbox.cacheFirst, {  
  cache: {
    name: 'staticMainAssetsCache',
    maxEntries: 50
  }
});

// WP Plugins CSS Router

self.toolbox.router.get('/wp-content/plugins/*(.*)', self.toolbox.cacheFirst, {  
    cache: {
      name: 'content-css-js-cache-v1',
      maxEntries: 50
    }
  }
);

// WP Plugins JS Router

self.toolbox.router.get('/wp-content/plugins/*(.*)', self.toolbox.cacheFirst, {  
    cache: {
      name: 'content-css-js-cache-v1',
      maxEntries: 50
    }
  }
);

// WP Uploads Router

self.toolbox.router.get('/wp-content/uploads/(.*)', self.toolbox.cacheFirst, {  
    cache: {
      name: 'content-cache-v1',
      maxEntries: 50
    }
  }
);

// CDN Router

self.toolbox.router.get('/wp-content/uploads/(.*)', self.toolbox.cacheFirst, {  
  origin: /mufasa\.technutty\.co.uk/,
  cache: {
    name: 'CDNcache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

// Articles router

self.toolbox.router.get('/articles/(.*)', function(request, values, options) {
  return global.toolbox.networkFirst(request, values, options).catch(function(error) {
    if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      return toolbox.cacheOnly(new Request('offline'), values, options);
    }
    throw error;
  });
}, {networkTimeoutSeconds: 3, name: 'ArticlesCache', maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60});

// Topics router

global.toolbox.router.get('/topics/(.*)', function(request, values, options) {
  return global.toolbox.networkFirst(request, values, options).catch(function(error) {
    if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      return toolbox.cacheOnly(new Request('offline'), values, options);
    }
    throw error;
  });
}, {networkTimeoutSeconds: 3, name: 'TopicsCache', maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60});

// Search router

global.toolbox.router.get('/?s=(.*)', function(request, values, options) {
  return global.toolbox.networkOnly(request, values, options).catch(function(error) {
    if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      return toolbox.cacheOnly(new Request('offline'), values, options);
    }
    throw error;
  });
}, {networkTimeoutSeconds: 3, name: 'ArticlesCache', maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60});

// Preview router

global.toolbox.router.get('/?p=(.*)', function(request, values, options) {
  return global.toolbox.networkOnly(request, values, options).catch(function(error) {
    if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      return toolbox.cacheOnly(new Request('offline'), values, options);
    }
    throw error;
  });
}, {networkTimeoutSeconds: 3, name: 'ArticlesCache', maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60});

// WP-Admin router

global.toolbox.router.get('/wp-admin/(.*)', function(request, values, options) {
  return global.toolbox.networkOnly(request, values, options).catch(function(error) {
    if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      return toolbox.cacheOnly(new Request('offline'), values, options);
    }
    throw error;
  });
}, {networkTimeoutSeconds: 3, name: 'ArticlesCache', maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60});

// WP-Login router

global.toolbox.router.get('/wp-login.php', function(request, values, options) {
  return global.toolbox.networkOnly(request, values, options).catch(function(error) {
    if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      return toolbox.cacheOnly(new Request('offline'), values, options);
    }
    throw error;
  });
}, {networkTimeoutSeconds: 3, name: 'ArticlesCache', maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60});

//Admin Ajax

self.toolbox.router.get('/wp-admin/admin-ajax.php', self.toolbox.networkOnly, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

// Pages Home

self.toolbox.router.get('/tip-us', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

self.toolbox.router.get('/contact', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

self.toolbox.router.get('/about', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

self.toolbox.router.get('/terms-and-conditions', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

self.toolbox.router.get('/privacy-policy', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'staticMainAssetsCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

//Third party routers

// Google Fonts

self.toolbox.router.get('/css', self.toolbox.fastest, {  
  origin: /fonts\.googleapis\.com/,
  cache: {
    name: 'dynamic-vendor-cache-v1',
    maxEntries: 10
  }
});

//Font Icons

self.toolbox.router.get('/(.*)', self.toolbox.cacheFirst, {  
  origin: /use\.fonticons\.com/,
  cache: {
    name: 'dynamic-vendor-cache-v1',
    maxEntries: 10
  }
});

self.toolbox.router.get('/kits/*', self.toolbox.cacheFirst, {  
  origin: /fonticons-free-fonticons\.netdna-ssl\.com/,
  cache: {
    name: 'dynamic-vendor-cache-v1',
    maxEntries: 10
  }
});

// Headway

// self.toolbox.router.get('/*', self.toolbox.networkFirst, {  
//  origin: /cdn\.headwayapp\.co/,
//  cache: {
//    networkTimeoutSeconds: 3,
//    name: 'dynamic-vendor-cache-v1',
//    maxEntries: 10
//  }
// });

// self.toolbox.router.get('/*', self.toolbox.networkFirst, {  
//  origin: /headwayapp\.co/,
//  cache: {
//    networkTimeoutSeconds: 3,
//    name: 'dynamic-vendor-cache-v1',
//    maxEntries: 10
//  }
// });

})(self);

