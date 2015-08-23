//var r = 'false';
//console.log(!r || !JSON.parse(r));
require('es6-promise').polyfill();
//var HGMonitor = require('./hg-monitor');
var hg = require('./hg');
//var path = require('path');
//var _ = require('')
//var fs = require('fs');
//var Growl = require('node-notifier').Growl;
//var  exec = require('child_process').exec;

//var notifier = new Growl({name: 'Source Command'});

//notifier.notify({
    //title: 'Error',
    //message: 'JK',
    //icon: path.join(__dirname,'../images/reject-red.png')
//})

//var ChildProcess = exec('hg resolve --all -R c:\\diffTest', function(err, stdout, stderr){
    //console.log("out: ", stdout);
    //console.log("err: ", stderr);
    //if (err){
        //console.log("exec error: ", err);
    //}
//});

var repo;
hg.open('c:/clones/diffTest').then(function(repository){
    repo = repository;
    return repo.isUnnamedHead();
}).then(function(r){
    console.log(r);
    //console.log('isUnnamedHead', !!r && JSON.parse(r));
    //var result = JSON.parse(r);
    //console.log(_.pluck(result, 'bookmarks'));
    repo.close();
}).catch(function(e){
    console.log(e.stack);
    repo.close();
});
