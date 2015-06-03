require('es6-promise').polyfill();
//var HGMonitor = require('./hg-monitor');
var hg = require('./hg');
var path = require('path');
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
hg.open('C:/html5').then(function(repository){
    repo = repository;
    return repo.run('log', '-r .', '-T {currentbookmark}');
}).then(function(r){
    console.log('"' + r.trim() + '"');
    repo.close();
}).catch(function(e){
    console.log('e : ', e);
    repo.close();
});
