(global => {
  'use strict';
  
// Service Worker Script

// Import the SW Toolbox library

console.log('Service Worker Enabled')

importScripts('sw-toolbox.js');

// Precache critical resources

 const FILES_TO_PRECACHE = [
	'/',
	'https://technutty.co.uk/TechNuttyLogo.svg',
	'https://technutty.co.uk/TechNuttyLogo.png',
	'/offline',
	'https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/css/stylesheet.shorthand.min.css',
	'https://technutty.co.uk/wp-includes/js/jquery/jquery.js',
	'https://technutty.co.uk/wp-includes/js/jquery/jquery-migrate.min.js',
	'https://technutty.co.uk/modernizr-custom.js',
	'https://technutty.co.uk/topics/articles/all/news/',
	'https://technutty.co.uk/topics/articles/all/reviews/'
];

global.toolbox.precache(FILES_TO_PRECACHE);

// Turn on debug logging, visible in the Developer Tools' console.
global.toolbox.options.debug = false;
 
// Boilerplate to ensure our service worker takes control of the page 
// as soon as possible.
  global.addEventListener('install',
      event => event.waitUntil(global.skipWaiting()));
  global.addEventListener('activate',
      event => event.waitUntil(global.clients.claim()));


// Home router

// Home

self.toolbox.router.get('/', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

//Admin Ajax

self.toolbox.router.get('/wp-admin/admin-ajax.php', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});

// Home offline

self.toolbox.router.get('/offline', self.toolbox.cacheOnly, {
  cache: {
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// Pages Home

self.toolbox.router.get('/tip-us', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});
self.toolbox.router.get('/contact', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});
self.toolbox.router.get('/about', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});
self.toolbox.router.get('/terms-and-conditions', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});
self.toolbox.router.get('/privacy-policy', self.toolbox.networkFirst, {
  cache: {
    networkTimeoutSeconds: 3,
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// Home png

self.toolbox.router.get('/TechNuttyLogo.png', self.toolbox.cacheFirst, {
  cache: {
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// Home svg

self.toolbox.router.get('/TechNuttyLogo.svg', self.toolbox.cacheFirst, {
  cache: {
    name: 'HomeCache',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// PageSpeed

self.toolbox.router.get('pagespeed_static/*', self.toolbox.cacheFirst, {
  cache: {
    name: 'PageSpeed',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60
  }
});

// Articles router

global.toolbox.router.get('/articles/(.*)', function(request, values, options) { 
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

self.toolbox.router.get('/wp-content/plugins/(.css)', self.toolbox.cacheFirst, {  
    cache: {
      name: 'content-css-js-cache-v1',
      maxEntries: 50
    }
  }
);

// WP Plugins JS Router

self.toolbox.router.get('/wp-content/plugins/(.js)', self.toolbox.cacheFirst, {  
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
    maxEntries: 30,
    maxAgeSeconds: 1 * 24 * 60 * 60
  }
});


//Third party routers

//Font Icons

self.toolbox.router.get('/f07dc75f.js', self.toolbox.cacheFirst, {  
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

self.toolbox.router.get('/*', self.toolbox.networkFirst, {  
  origin: /cdn\.headwayapp\.co/,
  cache: {
    networkTimeoutSeconds: 3,
    name: 'dynamic-vendor-cache-v1',
    maxEntries: 10
  }
});

// Emotify

self.toolbox.router.get('/api/articles/(.*)', self.toolbox.cacheFirst, {  
  origin: /www\.goemotify\.com/,
  cache: {
    name: 'dynamic-emotify-cache-v1',
    maxEntries: 30
  }
});

})(self);