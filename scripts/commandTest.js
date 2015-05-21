require('es6-promise').polyfill();
var HGMonitor = require('./hg-monitor');
var hg = require('./hg');
var path = require('path');
var notifier = require('node-notifier');

var repo;
hg.open('C:/html5').then(function(repository){
    repo = repository;
    var monitor = new HGMonitor(repo);
    monitor.on('incoming',function(user, commitMessages){
        notifier.notify({
            title: user + ': ' + commitMessages.length + (commitMessages.length > 1 ? ' commits' : ' commit'),
            message:'Click to view',
            icon: path.join(process.cwd(),'images/pull.png'),
            sound: true,
            wait: true
        });
    });

    monitor.on('test', function(){
        notifier.notify({
            title: "Test",
            message:'test',
            icon: path.join(process.cwd(),'images/commit.png'),
            sound: true,
            wait: true
        });
    });
});
