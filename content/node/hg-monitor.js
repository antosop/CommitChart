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
        repo.run('pull').then(function(output){
            return repo.run('bookmark','-f', '@', '-r heads(! outgoing())');
        });
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
        var currentBookmark;
        var needsUpdate;
        var hasOutgoing;
        var needsCommit;
        repo.run('log', '-r .', '-T {currentbookmark}')
        .then(function(output){
            currentBookmark = output.trim();
            that.emit('bookmark', currentBookmark || 'default');
            return repo.run('log', '-Tjson', '-r (::@)-(::.)');
        }).then(function(output){
            console.log(output);
            needsUpdate = JSON.parse(output).length > 0;
            return repo.run('log', '-Tjson', '-r (::.)-(::@)');
        }).then(function(output){
            hasOutgoing = JSON.parse(output).length > 0;
            return repo.run('summary');
        }).then(function(output){
            needsCommit = !output.match(/commit: .*\(clean\)/g);
            if ((hasOutgoing || !needsUpdate) && needsCommit) {
                that.emit('status', Status.commit);
            } else if (needsUpdate) {
                that.emit('status', Status.update);
            } else if (hasOutgoing) {
                that.emit('status', Status.push);
            } else {
                that.emit('status', Status.clean);
            }
        }).catch(function(err){
            console.log(err);
        });

        //repo.run('summary').then(function(output) {
            //var needsCommit = !output.match(/commit: .*\(clean\)/g);
            //var needsUpdate = !output.match(/update: \(current\)/g);
            //if (needsCommit) {
                //that.emit('status', Status.commit);
            //} else if (needsUpdate) {
                //that.emit('status', Status.update);
            //} else {
                //repo.run('outgoing').then(function(output) {
                    //var needsPush = !output.match(/no changes found/g);
                    //if (needsPush) {
                        //that.emit('status', Status.push);
                    //} else {
                        //that.emit('status', Status.clean);
                    //}
                //});
            //}
        //});
    }

    function updateCommits() {
        getIncoming();
        pullChanges();
        checkStatus();
        //that.emit('test');
    }

    updateCommits();
    var intervalId = setInterval(updateCommits, 5000);
    this.stop = function(){
        clearInterval(intervalId);
        this.removeAllListeners();
    }
}
HGMonitor.prototype = new EventEmitter();
HGMonitor.Status = Status;
module.exports = HGMonitor;
