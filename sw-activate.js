// Service Worker

if ('serviceWorker' in navigator) {
    // Check for service worker

    console.log("\n%cThis browser supports Service Worker. World domination will continue. \n","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #333");

    var el = document.getElementById('InstallServiceWorkerBanner');
    var bl = document.getElementById('InstalledServiceWorkerBanner');

    console.info("\n%cWorld domination V1.9.6 loading....\n","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #333");

    navigator.serviceWorker.register('/sw.js?v=1.9.6', {
        scope: '/'
    }).then(function(reg) {
      if(reg.installing) {
        console.log("\n%cBooting up World domination V1.9.6\n","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #ce0606");
      } else if(reg.waiting) {
        console.log("\n%cRunning World domination V1.9.6, please refresh to complete Plan C.\n","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #ff8e00");   
      } else if(reg.active) {
        console.log("\n%cThe World domination V1.9.6 install was successfull, activate eleminate-dinosaur.exe.\n\n","font-family: 'Open Sans',sans-serif; font-size: 16px; color: #30a001");
      }
    }); 

navigator.serviceWorker.addEventListener('controllerchange', function(event) {
  console.info(
    '[controllerchange] World Domination plan has changed ' +
    'new details are as follows: ', event
  );

  navigator.serviceWorker.controller.addEventListener('statechange',
    function() {
      console.info('[controllerchange][statechange] ' +
        'New World Domination plan has successfully activated: ', this.state
      );
        // If service worker is already installed.
     if (this.state === 'activated') {
        console.log("World Domination state: Activated","font-family: 'Open Sans',sans-serif; font-size: 11px; color: #30a001");
        // bl.style.display = 'block'; 
    }     
   }
  );
});
} else {
    console.warn("This browser is insufficient. World Domination is on hold.","font-family: 'Open Sans',sans-serif; font-size: 16px; color: #ce0606");
}