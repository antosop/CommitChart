var _ = require('lodash');
/*var Notify = require('./notify.js');*/
/*var CACHE_NAME = 'source-command-cache-v1';*/
// The files we want to cache
/*var urlsToCache = [*/
    /*'/',*/
    /*'/main.bundle.js'*/
/*];*/

//Set the callback for the install step
self.addEventListener('install', function(event){
    //Perform install step
    /*event.waitUntil(*/
        /*caches.open(CACHE_NAME)*/
        /*.then(function(cache) {*/
            /*console.log('Opened cache');*/
            /*return cache.addAll(urlsToCache);*/
        /*})*/
    /*);*/

    setInterval(function(){
        self.registration.showNotification('PING!', {body: 'this is a test', icon: '/check-in.png', tag: 'test'});
    }, 10000);

    var es = new EventSource('/sse');
    es.onerror = function (arg1) {
        console.log(arg1);
    };
    es.addEventListener('recent', function(e){
        var data = JSON.parse(e.data);
        _.forEach(data, function(value, key){
            self.registration.showNotification(value.length + ' new commits from ' + key, {body: _.map(value, function(v, i){
                    return (i + 1) + ' - ' + v;
            }).join('\n'), icon: '/check-in.png'});
        });
        console.log(e.data);
    }, false);
});

self.addEventListener('notificationclick', function(e){
    console.log(e);
});
/*self.addEventListener('fetch', function(event){*/
    /*event.respondWith(*/
        /*caches.match(event.request)*/
        /*.then(function(response) {*/
            /*if (response) {*/
                /*return response;*/
            /*}*/

            /*// IMPORTANT: Clone the request. A request is a stream and*/
            /*// can only be consumed once. SInce we are consuming this*/
            /*// once by cache and once by the browser for fetch, we need*/
            /*// to clone the response*/
            /*var fetchRequest = event.request.clone();*/

            /*return fetch(fetchRequest).then(*/
                /*function(response) {*/
                    /*// Check if we received a valid response*/
                    /*if(!response || response.status !== 200 || response.type !== 'basic') {*/
                        /*return response;*/
                    /*}*/

                    /*// IMPORTANT: Clone the response. A response is a stream*/
                    /*// and because we want the browser to consume the response*/
                    /*// as well as the cache consuming the response, we need*/
                    /*// to clone it so we have 2 streams.*/
                    /*var responseToCache = response.clone();*/

                    /*caches.open(CACHE_NAME)*/
                    /*.then( function(cache) {*/
                        /*cache.put(event.request, responseToCache);*/
                    /*});*/

                    /*return response;*/
                /*}*/
            /*);*/
        /*})*/
    /*);*/
/*});*/


