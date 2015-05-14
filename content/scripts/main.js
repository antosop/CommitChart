//var Doughnut = require('react-chartjs').Pie;
/*var _ = require('lodash');*/
//var React = require('react');
/*var Notify = require('notifyjs');*/
/*var permissionToNotify = require('./permission-to-notify.js');*/

/*permissionToNotify();*/

/*if ('serviceWorker' in navigator) {*/
    /*navigator.serviceWorker.register('/sw.bundle.js').then(function(registration){*/
        /*//Registration was successful*/
        /*console.log('ServiecWorker registration successful with scope: ', registration.scope);*/
    /*}).catch(function(err) {*/
        /*//registration failed :(*/
        /*console.log('ServiceWorker registration failed: ', err);*/
    /*});*/
/*}*/

var es = new EventSource('/sse');
es.onerror = function (arg1) {
    console.log(arg1);
};

es.addEventListener('close', function(e){
    window.close();
});
