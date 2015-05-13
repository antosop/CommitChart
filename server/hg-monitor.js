var _ = require('lodash');
/*var SSE = require('sse');*/
var notifier = require('node-notifier');

function HGMonitor(server, repo){
    /*var sse = new SSE(server);*/
    /*var clientQueue = [];*/

    /*sse.on('connection', function(client) {*/
        /*console.log('adding client');*/
        /*clientQueue.push(client);*/
        /*client.on('close', function(){*/
            /*console.log('removing client');*/
            /*_.remove(clientQueue, client);*/
        /*});*/
        /*if (eventQueue.length > 0)*/
            /*console.log('sending queued events');*/
        /*while (eventQueue.length > 0) {*/
            /*var eventData = eventQueue.shift();*/
            /*client.send(eventData);*/
        /*}*/
    /*});*/

    /*setInterval(function(){*/
        /*notifier.notify({'title': 'PING!', message: 'this is a test', icon: 'c:/SourceCommand/dist/check-in.png', open: 'http://localhost:3000', sound: true});*/
    /*}, 10000);*/

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
                    notifier.notify({title: value.length + ' new commits from ' + key, message: _.map(value, function(v, i){
                            return (i + 1) + ' - ' + v;
                    }).join('\n'), icon: path.join(__dirname,'check-in.png'), sound: true});
                });
            }
        });
    }

    function updateCommits() {
        getIncoming();
        pullChanges();
        /*getLog();*/
    }

    updateCommits();
    setInterval(updateCommits, 5000);

    /*function triggerEvent(name, data){*/
        /*var eventData = {event: name, data: data};*/
        /*if (clientQueue.length > 0){*/
            /*_.forEach(clientQueue, function(client){*/
                /*console.log('sending event');*/
                /*client.send(eventData);*/
            /*});*/
        /*} else {*/
            /*console.log('queueing event');*/
            /*eventQueue.push(eventData);*/
        /*}*/
    /*}*/

    /*this.stop = function(){*/
        /*while (clientQueue.length > 0){*/
            /*clientQueue.pop().close();*/
        /*}*/
    /*};*/
}
module.exports = HGMonitor;
