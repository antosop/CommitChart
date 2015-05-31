require('es6-promise').polyfill();
var HGMonitor = require('./hg-monitor');
var hg = require('./hg');
var path = require('path');
var notifier = require('node-notifier');
var  exec = require('child_process').exec;

var ChildProcess = exec('hg resolve --all -R c:\\diffTest', function(err, stdout, stderr){
    console.log("out: ", stdout);
    console.log("err: ", stderr);
    if (err){
        console.log("exec error: ", err);
    }
});
//var repo;
//hg.open('C:/diffTest').then(function(repository){
    //repo = repository;
    //return repo.run('resolve','--all');
//}).then(function(r){
    //console.log('r : ', r);
    //repo.close();
//}).catch(function(e){
    //console.log('e : ', e);
    //repo.close();
//});
