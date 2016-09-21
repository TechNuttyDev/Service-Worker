(global=>{
    'use strict';
    
    // SW Toolbox
    
    importScripts('sw-toolbox.js');
    
    // Google Analytics
    
    self.goog = {
        DEBUG: true
    };
    importScripts('offline-google-analytics-import.js');
    goog.offlineGoogleAnalytics.initialize({});
    
    //Debug
    
    global.toolbox.options.debug = false;
    
    // Precache
    
    const FILES_TO_PRECACHE = ['/', '/wp-admin/admin-ajax.php', '/offline', '/wp-content/uploads/2016/06/25152352/215328-200.png', '/OFFLINEIMG.png', '/TechNuttyLogo.svg', '/TechNuttyLogo.png', '/wp-content/themes/TechNutty5-5/library/css/stylesheet.shorthand.min.css?v=3.0.7', '/wp-content/themes/TechNutty5-5/library/js/scripts.combined.min.js?v=1.1', '/wp-includes/js/jquery/jquery.js', '/wp-includes/js/jquery/jquery-migrate.min.js', '/modernizr-custom.js', '/topics/articles/all/news/', '/topics/articles/all/reviews/', '/merged-single-plugin.css'];
    global.toolbox.precache(FILES_TO_PRECACHE);
    
    // Install and activate events
    
    self.addEventListener('install', function(event) {
         console.log("\n%cYour requests... give them to me, now. \n","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #333");
         event.waitUntil(self.skipWaiting());
    });
    this.addEventListener('activate', function(event) {
    var cacheWhitelist = ['v1.9.6'];
    event.waitUntil(
      caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log("\n%cDeleting inferior cache. \n","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #333");
          return caches.delete(key);
        }
      }));
      })
    );
    });
    
     //Offline cover URL
    
    const OFFLINE_URL = '/offline';
    self.addEventListener('fetch', event=>{
        if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            console.log('Serving page:', event.request.url);
            event.respondWith(fetch(event.request).catch(()=>caches.match(OFFLINE_URL)));
        }
    }
    );
    
    // Offline fallback
    
    const addFallback = (cacheFunc, offlineAsset) => {
    return (request, values, options) => {
    return cacheFunc(request, values, options)
    .catch(err => {
      console.log('Serving offline asset:', event.request.url);
      return fetch(offlineAsset);
    });
    };
    };
    
    // Main Assets
    
    self.toolbox.router.get('/TechNuttyLogo.png', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCache',
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60
        }
    });
    self.toolbox.router.get('/TechNuttyLogo.svg', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCache',
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60
        }
    });
    self.toolbox.router.get('pagespeed_static/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: 'PageSpeed',
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60
        }
    });
    
    // Static Assets
    
    self.toolbox.router.get('/wp-content/themes/TechNutty5-5/library/css/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCache',
            maxEntries: 50
        }
    });
    self.toolbox.router.get('/wp-content/themes/TechNutty5-5/library/js/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCache',
            maxEntries: 50
        }
    });
    self.toolbox.router.get('/wp-includes/js/(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCache',
            maxEntries: 50
        }
    });
    self.toolbox.router.get('/wp-content/plugins/*(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCachePlugins',
            maxEntries: 50
        }
    });
    self.toolbox.router.get('/wp-content/plugins/*(.*)', self.toolbox.cacheFirst, {
        cache: {
            name: 'staticMainAssetsCachePlugins',
            maxEntries: 50
        }
    });
    
    // Pages cache
    
    self.toolbox.router.get('/', addFallback(self.toolbox.networkFirst, '/offline'), {
        cache: {
            networkTimeoutSeconds: 3,
            name: 'pagesCache',
            maxEntries: 50,
            maxAgeSeconds: 1 * 24 * 60 * 60
        }
    });
    
    // Image Caches
    
    self.toolbox.router.get('/wp-content/uploads/(.*)', addFallback(self.toolbox.cacheFirst, '/OFFLINEIMG.png'), {
        cache: {
        networkTimeoutSeconds: 3,
        name: 'imageCache',
        maxEntries: 50,
        maxAgeSeconds: 1 * 24 * 60 * 60
        }
    });
    self.toolbox.router.get('/wp-content/uploads/(.*)', addFallback(self.toolbox.cacheFirst, '/OFFLINEIMG.png'), {
        origin: /mufasa\.technutty\.co.uk/,
        cache: {
        networkTimeoutSeconds: 3,
        name: 'cdnCache',
        maxEntries: 50,
        maxAgeSeconds: 1 * 24 * 60 * 60
        }
    });
    
    // Third party caches
    
    self.toolbox.router.get('/css', self.toolbox.cacheFirst, {
        origin: /fonts\.googleapis\.com/,
        cache: {
            name: 'staticMainAssetsCacheThirdParty',
            maxEntries: 10,
            maxAgeSeconds: 1 * 24 * 60 * 60
        }
    });
    self.toolbox.router.get('/(.*)', self.toolbox.cacheFirst, {
        origin: /use\.fonticons\.com/,
        cache: {
            name: 'staticMainAssetsCacheThirdParty',
            maxEntries: 10,
            maxAgeSeconds: 1 * 24 * 60 * 60
        }
    });
    self.toolbox.router.get('/kits/*', self.toolbox.cacheFirst, {
        origin: /fonticons-free-fonticons\.netdna-ssl\.com/,
        cache: {
            name: 'staticMainAssetsCacheThirdParty',
            maxEntries: 10,
            maxAgeSeconds: 1 * 24 * 60 * 60
        }
    });
}
)(self);
