// Notification about TechNutty's offline functionality

var OfflinedropCookie = true;
var OfflinecookieDuration = 90;
var OfflinecookieName = 'OfflineNotificationCookie';
var OfflinecookieValue = 'on';


if ('serviceWorker' in navigator) {
// Listen for claiming of our ServiceWorker
navigator.serviceWorker.addEventListener('controllerchange', function(event) {
  // Listen for changes in the state of our ServiceWorker
  navigator.serviceWorker.controller.addEventListener('statechange', function() {
    // If the ServiceWorker becomes "activated", let the user know they can go offline!
    if (this.state === 'activated') {
      // Show the offline notification
			var bodytag = document.getElementsByTagName('body')[0];
	    var div = document.createElement('div');
	    div.setAttribute('id','offline-notification-wrapper');
	    div.innerHTML = '<div id="offlineNotification"><span>Caching complete! Future visits will work offline.</span> <a class="close-offline-banner" style="font-size: 14px;font-weight: 800; href="javascript:void(0);" onclick="removeMeOffline();"><span>X</span></a></div>';
	    bodytag.insertBefore(div,bodytag.firstChild);
	    document.getElementsByTagName('body')[0].className+=' offlineNotificationBanner';
	    createOfflineCookie(window.OfflinecookieName,window.OfflinecookieValue, window.OfflinecookieDuration);
	  }
		function createOfflineCookie(name,value,days) {
		    if (days) {
		        var date = new Date();
		        date.setTime(date.getTime()+(days*24*60*60*1000));
		        var expires = "; expires="+date.toGMTString();
		    }
		    else var expires = "";
		    if(window.OfflinedropCookie) {
		        document.cookie = name+"="+value+expires+"; path=/";
		    }
		}

		function checkOfflineCookie(name) {
		    var nameEQ = name + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0;i < ca.length;i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1,c.length);
		        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		    }
		    return null;
		}

		function eraseOfflineCookie(name) {
		    createOfflineCookie(name,"",-1);
		}

		window.onload = function(){
		    if(checkOfflineCookie(window.OfflinecookieName) != window.OfflinecookieValue){
		        createDiv();
		    }
		}
  });
});
}

function removeMeOffline(){
	var element = document.getElementById('offline-notification-wrapper');
	element.parentNode.removeChild(element); // Remove notification if close is pressed
