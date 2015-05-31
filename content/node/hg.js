var HGCommandServer = require('hg').HGCommandServer;
var path = require('path');
var fs = require('fs');

function openHgRepo(dir) {
    return new Promise(function(resolve, reject){
        fs.exists(path.join(dir, '.hg'),function(exists){
            if (exists){
                var commandServer = new HGCommandServer();
                var queue = [];
                commandServer.start(dir, function(err){
                    if (err){
                        reject(err);
                    } else {
                        var value = "";
                        var fail = false;
                        commandServer.on("output", function(err, lines) {
                            lines.forEach(function(line) {
                                value = value + line.body;
                            });
                        });

                        commandServer.on("result", function(err, code) {
                            //console.log(err,' : ',code);
                            if (!fail){
                                var callback = queue.shift().resolve;
                                callback(value);
                                value = "";
                            }
                            fail = false;
                        });

                        commandServer.on("error", function(err, data){
                            //console.log(err,' : ',data);
                            queue.shift().reject(err);
                            fail = true;
                        });

                        var repo = new Repo(commandServer, queue);
                        resolve(repo);
                    }
                });
            } else {
                reject(new Error("repo does not exist."));
            }
        });
    });
}

function Repo(commandServer, queue){
    this.run = function() {
        var args = arguments;
        return new Promise(function(resolve, reject){
            commandServer.runcommand.apply(commandServer,args);
            queue.push({resolve: resolve, reject: reject});
        });
    };
    this.close = function() {
        commandServer.stop();
    };
}

module.exports = {open: openHgRepo};
