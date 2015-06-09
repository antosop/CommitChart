var HGCommandServer = require('hg').HGCommandServer;
var path = require('path');
var fs = require('fs');

var State = {
    clean: 0,
    commit: 1,
    update: 2,
    rebase: 3,
    push: 4
};

function openHgRepo(dir) {
    return new Promise(function(resolve, reject){
        fs.exists(path.join(dir, '.hg'), function(exists){
            if (exists){
                var commandServer = new HGCommandServer();
                var queue = [];
                commandServer.start(dir, function(err){
                    if (err){
                        reject(err);
                    } else {
                        var value = '';
                        commandServer.on('output', function(body, lines) {
                            lines.forEach(function(line) {
                                value = value + line.body;
                            });
                        });

                        commandServer.on('result', function(body) {
                            var callbacks = queue.shift();
                            if (parseInt(body, 10) === 0){
                                callbacks.resolve(value);
                            } else {
                                callbacks.reject(new Error(value));
                            }
                            value = '';
                        });

                        commandServer.on('error', function(error){
                            //console.log(err,' : ',data);
                            value = value + error.message;
                        });

                        var repo = new Repo(commandServer, queue);
                        resolve(repo);
                    }
                });
            } else {
                reject(new Error('repo does not exist.'));
            }
        });
    });
}

function Repo(commandServer, queue){
    this.run = function() {
        var args = arguments;
        return new Promise(function(resolve, reject){
            commandServer.runcommand.apply(commandServer, args);
            queue.push({resolve: resolve, reject: reject});
        });
    };

    this.close = function() {
        commandServer.stop();
    };
}

Repo.prototype.bookmarkRemoteHead = function() {
    return this.run('bookmark', '-f', '@', '-r heads(! outgoing())');
};

Repo.prototype.pullChanges = function() {
    return this.run('pull').then(this.bookmarkRemoteHead);
};

Repo.prototype.getIncoming = function() {
    return this.run('incoming', '-Tjson', '-M').then(function(output) {
        var match = output.match(/[\[\{](.|[\r\n])*[\]\}]/);
        if (match) {
            return Promise.resolve(JSON.parse(match[0]));
        } else {
            return Promise.resolve(null);
        }
    }).catch(function(err){
        if (!err.message.match(/no changes found/)){
            throw err;
        }
    });
};

Repo.prototype.getCurrentBookmark = function() {
    return this.run('log', '-r .', '-T {currentbookmark}')
    .then(function(output){
        return Promise.resolve(output.trim());
    });
};

Repo.prototype.log = function(revset) {
    return this.run('log', '-Tjson', '-r ' + revset).then(function(output){
        return Promise.resolve(JSON.parse(output));
    });
};

Repo.prototype.getChangesToRemoteHead = function() {
    return this.log('(::@)-(::.)');
};

Repo.prototype.getBranchingChanges = function() {
    return this.log('(::.)-(::@)');
};

Repo.prototype.needsCommit = function() {
    return this.run('summary').then(function(output){
        return Promise.resolve(!output.match(/commit: .*\(clean\)/g));
    });
};

Repo.prototype.getCurrentState = function() {
    var repo = this;
    var needsUpdate;
    var hasOutgoing;
    var needsCommit;
    return repo.getChangesToRemoteHead().then(function(changesets){
        needsUpdate = changesets.length > 0;
        return repo.getBranchingChanges();
    }).then(function(changesets){
        hasOutgoing = changesets.length > 0;
        return repo.needsCommit();
    }).then(function(output){
        needsCommit = output;
        var stat = State.clean;
        if ((hasOutgoing || !needsUpdate) && needsCommit) {
            stat = State.commit;
        } else if (needsUpdate) {
            if (hasOutgoing){
                stat = State.rebase;
            } else {
                stat = State.update;
            }
        } else if (hasOutgoing) {
            stat = State.push;
        }
        return Promise.resolve(stat);
    });
};

Repo.prototype.rebaseToRemoteHead = function() {
    var repo = this;
    return repo.run('help', 'rebase').then(function(output){
        var hasRebase = !output.match(/enabling extensions/g);
        if (!hasRebase){
            throw new Error('Please enable rebase extension');
        }
        return repo.run('rebase', '-b .', '-d @');
    });
};

Repo.prototype.update = function(revision) {
    return this.run('update', revision);
};

Repo.prototype.updateToRemoteHead = function() {
    var repo = this;
    var currentBookmark;
    return repo.getCurrentBookmark()
    .then(function(output){
        currentBookmark = output;
        return repo.update('@');
    }).then(function(){
        if(currentBookmark){
            return repo.run('bookmark', '-f', currentBookmark);
        } else {
            return repo.run('bookmark', '-i');
        }
    });
};

Repo.prototype.push = function() {
    return this.run('push', '-r .').catch(function(err){
        var noChanges = !!err.message.match(/no changes found/g);
        var abort = err.message.match(/abort:.*/);
        if (noChanges){
            throw new Error('Nothing to push');
        }
        if (abort){
            throw new Error(abort);
        }
    });
};

module.exports = {open: openHgRepo, State: State};
