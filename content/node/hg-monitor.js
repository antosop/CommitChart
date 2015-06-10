var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

function HGMonitor(repo){
    EventEmitter.call(this);
    var that = this;

    function getChangesFromRemote() {
        return repo.getIncoming().then(function(changesets){
            if(changesets) {
                var commitInfo = _.map(changesets, function(commit){
                    return {user: commit.user, comment: commit.desc};
                });
                var newCommits = _.groupBy(commitInfo, 'user');
                _.forEach(newCommits, function(n, key){
                    newCommits[key] = _.pluck(n, 'comment');
                });

                _.forEach(newCommits, function(value, key){
                    that.emit('incoming', key, value);
                });
                return repo.pullChanges();
            }
        });
    }

    function checkState() {
        var branch = '';
        return repo.getCurrentBranch().then(function(currentBranch){
            branch = currentBranch;
            return repo.getCurrentBookmark();
        }).then(function(currentBookmark){
            that.emit('bookmark', (currentBookmark ? currentBookmark + ' : ' : '') + branch);
            return repo.getCurrentState();
        }).then(function(state){
            that.emit('state', state);
        });
    }

    this.updateHistory = function() {
        return getChangesFromRemote()
        //.then(function(){ return repo.bookmarkRemoteBranchHead(); })
        .then(checkState)
        .catch(function(err){
            console.log(err);
        });
        //that.emit('test');
    };

    this.updateHistory();
    var intervalId = setInterval(this.updateHistory, 5000);
    this.stop = function(){
        clearInterval(intervalId);
        this.removeAllListeners();
    };
}

HGMonitor.prototype = new EventEmitter();
module.exports = HGMonitor;
