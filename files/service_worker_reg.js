// check if Service Worker is supported
if ('serviceWorker' in navigator) {
    // register the Service Worker, must be in the root directory to have site-wide scope...
    navigator.serviceWorker.register('/serviceworker.js')
        .then(function(registration) {
            // registration succeeded :-)
            console.log('SERVICE WORKER REGISTERED', registration.scope);
        }).catch(function(err) {
            // registration failed :-(
            console.log('SERVICE WORKER REGISTRATION HAS FAILED: ', err);
        });
}
