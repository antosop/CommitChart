var _ = require('lodash');
//var SSE = require('sse');
var notifier = require('node-notifier');
var path = require('path');
//var exec = require('child_process').exec;
//var open = require('open');

function HGMonitor(win, repo){
    //var sse = new SSE(server);
    //var client=null;

    //sse.on('connection', function(c) {
        //triggerEvent('close', '{}');
        //client=c;
        //c.on('close', function(){
            //if(c === client){
                //client=null;
            //}
        //});
    //});

    //setInterval(function(){
        //notifier.notify({'title': 'PING!', message: 'this is a test', icon: 'c:/SourceCommand/dist/check-in.png', sound: true, wait: true});
    //}, 10000);

    /*function getLog() {*/
        /*repo.run('log',['-Tjson','-d today'],function(output) {*/
            /*var match = output.match(/[\[\{](.|[\r\n])*[\]\}]/);*/
            /*if (match) {*/
                /*var result = JSON.parse(match[0]);*/
                /*var counts = _.countBy(result, function(r){*/
                    /*return r.user;*/
                /*});*/
                /*var numCommits = _.map(_.sortBy(_.pairs(counts), function(n){*/
                    /*return -n[1];*/
                /*}), function(n){*/
                    /*return {name: n[0], count: n[1]};*/
                /*});*/

                /*[>triggerEvent('totals', JSON.stringify(numCommits));<]*/
            /*}*/
        /*});*/
    /*}*/

    notifier.on('click', function(notifierObject, options){
        win.show();
        //if (client){
            //var p = path.join(__dirname,'nircmd.exe win activate title "Source Command"');
            //exec(p);
        //} else {
            //exec('chrome --app=http://localhost:3000/');
        //}
    });

    function pullChanges() {
        repo.run('pull',[],function(){});
    }

    function getIncoming() {
        repo.run('incoming',['-Tjson', '-M'],function(output) {
            var match = output.match(/[\[\{](.|[\r\n])*[\]\}]/);
            if (match) {
                var commitInfo = _.map(JSON.parse(match[0]),function(commit){
                    return {user:commit.user, comment:commit.desc};
                });
                var newCommits = _.groupBy(commitInfo,'user');
                _.forEach(newCommits, function(n, key){
                    newCommits[key] = _.pluck(n,'comment');
                });

                _.forEach(newCommits, function(value, key){
                    notifier.notify({
                        title: key + ': ' + value.length + (value.length > 1 ? ' commits' : ' commit'),
                        message:'Click to view',
                        icon: path.join(__dirname,'check-in.png'),
                        sound: true,
                        wait: true
                    });
                });
            }
        });
    }

    function updateCommits() {
        console.log('updating');
        getIncoming();
        pullChanges();
        /*getLog();*/
    }

    updateCommits();
    setInterval(updateCommits, 5000);

    //function triggerEvent(name, data){
        //if(client){
            //var eventData = {event: name, data: data};
            //console.log('sending ' + name + ' event');
            //client.send(eventData);
        //}
    //}

    //process.on('SIGINT', function(){
        //triggerEvent('close', '{}');
        //process.exit(2);
    //});

    /*this.stop = function(){*/
        /*while (clientQueue.length > 0){*/
            /*clientQueue.pop().close();*/
        /*}*/
    /*};*/
}
module.exports = HGMonitor;
