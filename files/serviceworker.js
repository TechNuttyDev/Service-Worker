var version = 'v1.0.10'; //Version number for invalididating cache

var theme_path = ''; //URL path for your assets

var offlineFundamentals = [
	'/',
	'/offline',
	'https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/css/stylesheet.shorthand.min.css'
  //Add fundamental file paths here
];

//Install offlineFundamentals during serviceworker installation
var updateStaticCache = function() {
	return caches.open(version + 'fundamentals').then(function(cache) {
		return Promise.all(offlineFundamentals.map(function(value) {
			var request = new Request(value);
			var url = new URL(request.url);
			if (url.origin != location.origin) {
				request = new Request(value, {mode: 'no-cors'});
			}
			return fetch(request).then(function(response) {
				var cachedCopy = response.clone();
				return cache.put(request, cachedCopy);

			});
		}))
	})
};

//Clear cache if version number is different
var clearOldCaches = function() {
console.log('Clearing old caches');
	return caches.keys().then(function(keys) {
			return Promise.all(
								keys
									.filter(function (key) {
											return key.indexOf(version) != 0;
									})
									.map(function (key) {
											return caches.delete(key);
									})
						);
		})
}

/*
	limits the cache to set amount of maxItems
*/
var limitCache = function(cache, maxItems) {
	cache.keys().then(function(items) {
		if (items.length > maxItems) {
			cache.delete(items[0]);
		}
	})
}


/*
	trims the cache if maxItems is exceeded
*/
var trimCache = function (cacheName, maxItems) {
console.log('Trimming caches');
		caches.open(cacheName)
				.then(function (cache) {
						cache.keys()
								.then(function (keys) {
										if (keys.length > maxItems) {
												cache.delete(keys[0])
														.then(trimCache(cacheName, maxItems));
										}
								});
				});
};

//Install event
this.addEventListener('install', function oninstallHandler(event) {
	event.waitUntil(updateStaticCache()
				.then(function() {
					return self.skipWaiting();
				})
			);
})

this.addEventListener("message", function onmessageHandler(event) {
	var data = event.data;

	//If too many files are downloaded
	if (data.command == "trimCache") {
		trimCache(version + "pages", 25);
		trimCache(version + "images", 30);
		trimCache(version + "assets", 30);
	}
});

//Networking script
this.addEventListener('fetch', function onfetchHandler(event) {

	//Fetch from network and cache
	var fetchFromNetwork = function(response) {
		var cacheCopy = response.clone();
		if (event.request.headers.get('Accept').indexOf('text/html') != -1) {
			caches.open(version + 'pages').then(function(cache) {
				cache.put(event.request, cacheCopy).then(function() {
					limitCache(cache, 25);
				})
			});
		} else if (event.request.headers.get('Accept').indexOf('image') != -1) {
			caches.open(version + 'images').then(function(cache) {
				cache.put(event.request, cacheCopy).then(function() {
					limitCache(cache, 30);
				});
			});
		} else {
			caches.open(version + 'assets').then(function add(cache) {
				cache.put(event.request, cacheCopy);
			});
		}

		return response;
	}

	//Fetch from network failed
	var fallback = function() {
		if (event.request.headers.get('Accept').indexOf('text/html') != -1) {
			return caches.match(event.request).then(function (response) {
			console.log('Fetch from network failed, responded with:', response);
				return response || caches.match('/offline');
			})
		}
	}

	//Disallow preview and admin pages
	if (event.request.url.match(/wp-admin/) || event.request.url.match(/preview=true/)) {
		return;
	}

	//Disallow non-get
	if (event.request.method != 'GET') {
		return;
	}

	//Error HTML
	if (event.request.headers.get('Accept').indexOf('text/html') != -1) {
					event.respondWith(fetch(event.request).then(fetchFromNetwork, fallback));
		return;
			}

	//Error non-HTML
	event.respondWith(
		caches.match(event.request).then(function(cached) {
			return cached || fetch(event.request).then(fetchFromNetwork, fallback);
		})
	)
});

//After the install event
this.addEventListener('activate', function onactivateHandler(event) {
	event.waitUntil(clearOldCaches()
				.then(function() {
				console.log('Claiming old Service Worker');
					return self.clients.claim();
				})
			);
});
