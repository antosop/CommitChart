var _ = require('lodash');
var notifier = require('node-notifier');
var path = require('path');

function HGMonitor(win, repo){

    notifier.on('click', function(notifierObject, options){
        win.show();
    });

    function pullChanges() {
        repo.run('pull');
    }

    function getIncoming() {
        repo.run('incoming','-Tjson', '-M').then(function(output) {
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
                        icon: path.join(process.cwd(),'images/check-in.png'),
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
    }

    updateCommits();
    setInterval(updateCommits, 5000);
}
module.exports = HGMonitor;
