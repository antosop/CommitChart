var HGCommandServer = require('hg').HGCommandServer;
var path = require('path');
var fs = require('fs');

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

module.exports = {open: openHgRepo};
