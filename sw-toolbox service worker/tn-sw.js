/**
 * TechNutty Service Worker
 *
 * @version 1.5.1
 */

/*!
 * Basic values
 */
var TechNuttyServiceWorker = {
    "version": "6.0.5.0",
    "debug": false,
    "required_files": [
        "https://technutty.co.uk/TechNuttyLogo.svg",
        "https://technutty.co.uk/TechNuttyLogo.png",
        "https://technutty.co.uk/OFFLINEIMG.png",
        "https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/css/stylesheet.shorthand.min.css",
        "https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/js/cb-ext.js",
        "https://technutty.co.uk/wp-content/themes/TechNutty5-5/library/js/scripts.combined.min.js",
        "https://technutty.co.uk/wp-includes/js/jquery/jquery-migrate.min.js",
        "https://technutty.co.uk/wp-includes/js/jquery/jquery.js",
        "https://technutty.co.uk/wp-includes/js/jquery/jquery.masonry.min.js",
        "https://technutty.co.uk/wp-includes/js/jquery/jquery.query.js",
        "https://technutty.co.uk/wp-includes/js/imagesloaded.min.js",
        "https://technutty.co.uk/wp-includes/js/masonry.min.js",
        "https://technutty.co.uk/modernizr-custom.js"
    ],
    "required_pages": [
        "/",
        "/offline",
        "/terms-and-conditions",
        "/cookies-information-page",
        "/privacy-policy"
    ],
    "host_whitelist": [
        "localhost",
        "technutty.co.uk",
        "mufasa.technutty.co.uk",
        "simba.technutty.co.uk",
        "zazu.technutty.co.uk",
        "technutty.xyz"
    ],
    "paths_blocked": [
        "/wp-login.php",
        "/wp-admin"
    ],
    "params_blocked": [
        "preview",
        "shareadraft",
        "s="
    ],
    "fallback_images": [
        [
            "/OFFLINEIMG.png"
        ]
    ],
    "fallback_pages": [
        [
            "/offline"
        ]
    ],
    "undefined_fallback_page": "/offline",
    "default_fallback_image": "/OFFLINEIMG.png",
    "cdn_base": "https://mufasa.technutty.co.uk"
};

if ( TechNuttyServiceWorker === {} ) {
	TechNuttyServiceWorker = {
		version                : 0,
		debug                  : false,
		required_files         : [],
		required_pages         : [],
		host_whitelist         : [],
		paths_blocked          : [],
		params_blocked         : [],
		fallback_images        : [],
		fallback_pages         : [],
		undefined_fallback_page: null,
		default_fallback_image : null,
	};
}
if ( TechNuttyServiceWorker.undefined_fallback_page ) {
	TechNuttyServiceWorker.fallback_pages.push(
		[ undefined, TechNuttyServiceWorker.undefined_fallback_page ]
	);
}
if ( TechNuttyServiceWorker.default_fallback_image ) {
	TechNuttyServiceWorker.fallback_images.push(
		[ location.hostname, TechNuttyServiceWorker.default_fallback_image ]
	);
}

delete TechNuttyServiceWorker.undefined_fallback_page;
delete TechNuttyServiceWorker.default_fallback_image;

/**
 * Test dependencies
 */
try {
	[
		'var {$$test} = {$$test: null}',
		'[$$test] = [null]',
		'$$test = Object.assign({}, {})',
		'$$test = (...args) => args',
		'$$test = new Map()',
		'$$test = new Set()',
		'delete $$test'
	].forEach( eval );
} catch ( err ) {
	console.warn( err );
	throw 'Service worker unmet feature dependencies';
}

/*!
 * Settings
 */
const VERSION = TechNuttyServiceWorker.version;

let DEBUG = TechNuttyServiceWorker.debug;

const REQUIRED_FILES = TechNuttyServiceWorker.required_files;

const REQUIRED_PAGES = TechNuttyServiceWorker.required_pages;

const REQUIRED_DEPENDENCIES = [].concat( REQUIRED_FILES, REQUIRED_PAGES );

const hostsAllowed = new Set( TechNuttyServiceWorker.host_whitelist );

const pathsBlocked = new Set( TechNuttyServiceWorker.paths_blocked );

const paramsBlocked = new Set( TechNuttyServiceWorker.params_blocked );

const fallbackPages = new Map( TechNuttyServiceWorker.fallback_pages );

const fallbackImages = new Map( TechNuttyServiceWorker.fallback_images );

const SCOPE_ORIGIN = trimSlash( registration.scope );

/*!
 * Cache types and settings
 */
const CACHE_TYPES = {
	content: 'content',
	image  : 'image',
	other  : 'other',
	static : 'static'
};

const cacheSizeLimits = new Map( [
	[ CACHE_TYPES.image, 100 ],
	[ CACHE_TYPES.content, 20 ],
	[ CACHE_TYPES.other, 20 ]
] );

const matchOptions = new Map( [
	[ CACHE_TYPES.static, { ignoreSearch: true } ]
] );

const fetchOptions = new Map( [
	[ CACHE_TYPES.static, { credentials: 'same-origin', cache: 'reload' } ]
] );

const headerTests = new Map( [
	[
		CACHE_TYPES.static, header => /^(text|application)\/(css|javascript)/
	],
	[
		CACHE_TYPES.image, header => /^image\/(jpg|png|gif|jpeg|webp)/
	],
	[
		CACHE_TYPES.content, header =>/^text\/(html|xml|xhtml)/
	]
] );

const cacheCriteria = new Map( [
	[
		CACHE_TYPES.static, req => [ isAssetRequest( req ) || isPrecacheRequest( req ) ]
	],
	[
		CACHE_TYPES.content, req => [
		isLocalRequest( req ),
		isPageRequest( req ),
		req.mode === 'navigate'
	]
	],
	[
		CACHE_TYPES.image, req => [
		isUploadRequest( req ),
		isImageRequest( req )
	]
	],
	[
		CACHE_TYPES.other, req => [
		isLocalRequest( req ),
		isUploadRequest( req )
	]
	]
] );

const procedures = new Map( [
	[ CACHE_TYPES.content, retrievePage ],
	[ CACHE_TYPES.static, retrieveAsset ],
	[ CACHE_TYPES.image, retrieveAsset ],
	[ CACHE_TYPES.other, retrieveAsset ],
	[ undefined, req => fetch( req ) ]
] );

/**
 * Remove extras from URLs
 */
function trimSearch( str ) {
	return str.replace( /\?(.+)?$/, '' );
}

function trimSlash( str ) {
	return str.replace( /(.)\/$/, '$1' );
}

function toCacheName( str ) {
	const delim = '-';
	return [ VERSION, str ].join( delim );
}

/*!
 * Checks
 */

function isNil( val ) {
	return val == null;
}

function isTrue( val ) {
	return val === true;
}

function isPathBlocked( pathname ) {
	const path = trimSlash( pathname );

	for ( let item of pathsBlocked ) {
		if ( path === item || path.startsWith( `${item}/` ) ) {
			return true;
		}
	}

	return false;
}

function isSearchBlocked( search ) {
	const keys = search
		.replace( /^\?/, '' )
		.split( '&' )
		.map( str => str.replace( /(.+)=.+/, '$1' ) );

	return keys.some(
		key => paramsBlocked.has( key )
	);
}

function isCacheExpired( cacheKey ) {
	return !cacheKey.startsWith( VERSION );
}

function isCacheableRequest( req ) {
	const { url, method, referrer } = req;
	const { hostname, pathname, search } = new URL( url );

	if ( method !== 'GET' ) {
		return false;
	}

	if ( !hostsAllowed.has( hostname ) ) {
		return false;
	}

	if ( isPathBlocked( pathname ) ) {
		return false;
	}

	if ( referrer && isPathBlocked( new URL( referrer ).pathname ) ) {
		return false;
	}

	if (isSearchBlocked( search )) {
		return false;
	}

	return true;
}

function isLocalRequest( req ) {
	return req.url.startsWith( SCOPE_ORIGIN );
}

function isUploadRequest( req ) {
	return /wp-content\/uploads\//.test( req.url );
}

/*!
 * Attribute cache types
 */

function isPageRequest( req ) {
	return getContentType( req ) === CACHE_TYPES.content;
}

function isImageRequest( req ) {
	return getContentType( req ) === CACHE_TYPES.image;
}

function isPrecacheRequest( req ) {
	const url = new URL( req.url );
	const match = REQUIRED_DEPENDENCIES.find( path => trimSlash( url.pathname ) === trimSlash( path ) );
	return !isNil( match );
}

function getContentType( req ) {
	const header = req.headers.get( 'Accept' );
	const types = [
		CACHE_TYPES.static,
		CACHE_TYPES.content,
		CACHE_TYPES.image
	];

	return types.find( type => {
		const test = headerTests.get( type );
		if ( !test ) {
			return;
		}
		return test( header );
	} );
}

function getCacheType( req ) {
	const types = [
		CACHE_TYPES.static,
		CACHE_TYPES.content,
		CACHE_TYPES.image,
		CACHE_TYPES.other
	];

	return types.find( type => {
		const test = cacheCriteria.get( type );
		if ( !test ) {
			return;
		}
		const results = test( req );
		return results.every( isTrue );
	} );
}

/*!
 * Fetch/Cache
 */

function openCache( name ) {
	return caches.open( toCacheName( name ) );
}

function openCacheFor( req ) {
	const type = getCacheType( req );
	return openCache( type );
}

/**
 * Network + Cache
 */
function fetchRequest( req, options ) {
	return fetch( req, options ).then( res => {

		if ( res.ok ) {
			const clone = res.clone();

			openCacheFor( req ).then( cache => {
				return cache.put( req, clone );
			} );
		}

		return res;
	} );
}

function matchRequest( req, options ) {
	return caches.match( req, options ).then( res => {
		return res || Promise.reject(
				`matchRequest: could not match ${req.url}`
			);
	} );
}

function matchFallback( req ) {
	const { hostname, pathname } = new URL( req.url );

	if ( isPageRequest( req ) ) {
		const pathkey = trimSlash( pathname );
		const page = fallbackPages.get( pathkey ) || fallbackPages.get( undefined );
		const cacheId = REQUIRED_PAGES.find( path => path === page );

		return caches.match( cacheId );
	}

	if ( isImageRequest( req ) ) {
		const image = fallbackImages.get( hostname );
		const cacheId = REQUIRED_FILES.find( path => path.endsWith( image ) );

		return caches.match( cacheId );
	}

	// Use an empty response if nothing better can be found in a cache.
	return Promise.resolve( new Response() );
}

function limitCacheSize( cacheName, maxItems ) {
	return openCache( cacheName )
		.then( cache => {
			return Promise.all( [ cache, cache.keys() ] );
		} )
		.then( ( [cache, keys] ) => {
			const deletions = [];
			const limit = Math.abs( maxItems );

			while ( keys.length > limit ) {
				deletions.push(
					cache.delete( keys.shift() )
				);
			}

			return Promise.all( deletions );
		} )
		.then( deleted => {
			return deleted.filter( isTrue ).length;
		} )
		.catch( err => {
			warn( `limitCacheSize: ${err}` );
		} );
}

/*!
 * Fetch
  */

function retrieveAsset( req, type ) {
	if ( type === CACHE_TYPES.static ) {
		req = new Request( trimSearch( req.url ) );
	}
	return matchRequest( req, matchOptions.get( type ) ).catch( err => {
		warn( `retrieveAsset: ${err}` );
		return fetchRequest( req );
	} );
}
cedures
 */
function retrievePage( req, type ) {
	return fetchRequest( req ).catch( err => {
		warn( `retrievePage: ${err}` );
		return matchRequest( req, matchOptions.get( type ) );
	} );
}

/*!
 * Install Event
 */
addEventListener( 'install', event => {
	const requests = REQUIRED_DEPENDENCIES.map( url => {
		return new Request( url, fetchOptions.get( CACHE_TYPES.static ) );
	} );

	event.waitUntil(
		openCache( CACHE_TYPES.static )
			.then( cache => {
				return cache.addAll( requests );
			} )
			.catch( err => {
				warn( `install: ${err}` );
			} )
			.then( skipWaiting() )
	);
} );

/*!
 * Activation Event
 */
addEventListener( 'activate', event => {
	event.waitUntil(
		caches.keys()
			.then( keys => {
				const expired = keys.filter( isCacheExpired );
				const deletions = expired.map( key => caches.delete( key ) );
				return Promise.all( deletions );
			} )
			.catch( err => {
				warn( `activate: ${err}` );
			} )
			.then( clients.claim() )
	);
} );

/*!
 * Fetch event
 */
addEventListener( 'fetch', event => {
	const request = event.request;

	if ( isCacheableRequest( request ) ) {
		const cacheType = getCacheType( request );
		const proceedure = procedures.get( cacheType );

		event.respondWith(
			proceedure( request, cacheType )
				.catch( err => {
					warn( `fetch: ${err}` );
					return matchFallback( request );
				} )
		);
	}
} );

/*!
 * Message Event
 */
addEventListener( 'message', event => {
	// Trim caches if the `trimCaches` command is sent
	if ( event.data.command == 'trimCaches' ) {
		// Trim caches
		for ( let cache in CACHE_TYPES ) {
			let maxItems = cacheSizeLimits.get( cache );
			if ( maxItems ) {
				limitCacheSize( cache, maxItems );
			}
		}
	}
} );

/*!
 * Debug
 */
function warn( ...args ) {
	if ( DEBUG ) {
		return console.warn.call( console, ...args );
	}
}

function log( ...args ) {
	if ( DEBUG ) {
		return console.log.call( console, ...args );
	}
}
