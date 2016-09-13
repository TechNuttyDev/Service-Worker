// Service Worker

if ('serviceWorker' in navigator) {
    // Check for service worker

    console.log("Browser supports Service Worker");

    var el = document.getElementById('InstallServiceWorkerBanner');
    var bl = document.getElementById('InstalledServiceWorkerBanner');

console.log('About to try to install a Service Worker');

navigator.serviceWorker.register('/serviceworker.js?v=1.0.1.1.2', {
  scope: '.'
}).then(function(registration) {
  console.log('The service worker has been registered ', registration);
});

navigator.serviceWorker.addEventListener('controllerchange', function(event) {
  console.log(
    '[controllerchange] A "controllerchange" event has happened ' +
    'within navigator.serviceWorker: ', event
  );

  navigator.serviceWorker.controller.addEventListener('statechange',
    function() {
      console.log('[controllerchange][statechange] ' +
        'A "statechange" has occured: ', this.state
      );
        // If service worker is already installed.
     if (this.state === 'activated') {
        console.log("Current Service Worker state: Activated");
        bl.style.display = 'block'; 
    }     
    if (this.state === 'null') {
    console.log("No Service Worker active...");
    el.style.display = 'block';  
    }
   }
  );
});
} else {
    log("This browser does not support Service Worker.");
}