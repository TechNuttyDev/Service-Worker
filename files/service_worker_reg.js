// Service Worker

if ('serviceWorker' in navigator) {
    // Check for service worker

    console.log("Browser supports Service Worker");

    // var el = document.getElementById('InstallServiceWorkerBanner');
    var bl = document.getElementById('InstalledServiceWorkerBanner');
    // var ul = document.getElementById('UpdatedServiceWorkerBanner');

console.log('About to try to install a Service Worker');

navigator.serviceWorker.register('/serviceworker.js?v=1.0.1.1.2', {
  scope: '/'
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
    // This would be for if the service worker is not installed, but that state does not exist, I am still looking for a way to change that.
   // if (this.state === 'null') {
   // console.log("No Service Worker active...");
   // el.style.display = 'block';  
   // }
    // I would also like an update state, the code for that would be something like the following:
      // if (this.state === 'null') {
   // console.log("Current Service Worker state: Updating);
   // ul.style.display = 'block';  
   // }
   }
  );
});
} else {
    log("This browser does not support Service Worker.");
}