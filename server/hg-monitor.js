var SSE = require('sse');

function HGMonitor(server, repo){
    function getLog() {
        repo.run('log',['-Tjson','-d today'],function(output) {
            var result = JSON.parse(output);
            var counts = _.countBy(result, function(r){
                return r.user;
            });
            numCommits = _.map(_.sortBy(_.pairs(counts), function(n){
                return -n[1];
            }), function(n){
                return {name: n[0], count: n[1]};
            });
        });
    }

    function updateCommits() {

        repo.run('incoming',['-Tjson'],function(output) {
            var commitInfo = _.map(JSON.parse(output.match(/[\[\{](.|[\r\n])*[\]\}]/)[0]),function(commit){
                return {user:commit.user, comment:commit.desc};
            });
            newCommits = _.groupBy(commitInfo,'user');
            _.forEach(newCommits, function(n, key){
                newCommits[key] = _.pluck(n,'comment');
            });
            console.log(newCommits);
            //newCommits = _.groupBy(commitInfo, 'user');
        });
        getLog();
        //var pull = spawn('hg', ['pull']);

        //pull.on('close', getLog);
    }

    updateCommits();
    setInterval(updateCommits, 5000);
}
module.exports = HGMonitor;
