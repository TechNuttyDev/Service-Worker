<script>

// Service Worker

if ('serviceWorker' in navigator) {
    // Check for service worker

    console.log("Browser supports Service Worker");
    if (navigator.serviceWorker.current) {
    // If service worker is already installed.
        console.log("Current Service Worker state: \\o/");
    } else {
    // If service has not been installed.
    console.log("No Service Worker active...");
var el = document.getElementById('InstallServiceWorkerBanner');
var body = document.getElementsByTagName('body');
el.style.display = 'block';  

    }
    window.onload=function(){

    // Service worker install script.

    document.getElementById('tn-offline-install').addEventListener('click', function () {
        console.log('About to try to install a Service Worker');

        navigator.serviceWorker.register('/serviceworker.js?v=1.0.1.1.2', {
            scope: '/'
        })
        .then(function (serviceWorker) {
           register = serviceWorker;
            document.getElementsByTagName('body').innerHTML='<div id="offline-notification-wrapper"><div id="offlineNotification"><span>Caching complete! Future visits will work offline.</span> <a class="close-offline-banner" style="font-size: 14px;font-weight: 800; href="javascript:void(0);" onclick="removeMeOffline();"><span>X</span></a></div></div>';
            console.log('Successfully installed ServiceWorker');
            serviceWorker.addEventListener('statechange', function (event) {
            console.log("Worker state is now " + event.target.state);
        });
    }, function (why) {
        console.log('Failed to install:' + why);
    });
    }); // Install button

    }  // Onload

} else {
    log("This browser does not support Service Worker.");
}

</script>