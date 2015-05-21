var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var Status = {
    clean: 0,
    commit: 1,
    update: 2,
    push: 3
};

function HGMonitor(repo){
    EventEmitter.call(this);
    var that = this;

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
                    console.log(key, " : ", value);
                    that.emit('incoming', key, value);
                });
            }
        });
    }

    function checkStatus() {
        repo.run('summary').then(function(output) {
            var needsCommit = !output.match(/commit: .*\(clean\)/g);
            var needsUpdate = !output.match(/update: \(current\)/g);
            if (needsCommit) {
                that.emit('status', Status.commit);
            } else if (needsUpdate) {
                that.emit('status', Status.update);
            } else {
                repo.run('outgoing').then(function(output) {
                    var needsPush = !output.match(/no changes found/g);
                    if (needsPush) {
                        that.emit('status', Status.push);
                    } else {
                        that.emit('status', Status.clean);
                    }
                });
            }
        });
    }

    function updateCommits() {
        console.log("monitoring");
        getIncoming();
        pullChanges();
        checkStatus();
        //that.emit('test');
    }

    updateCommits();
    setInterval(updateCommits, 5000);
}
HGMonitor.prototype = new EventEmitter();
HGMonitor.Status = Status;
module.exports = HGMonitor;
