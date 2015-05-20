var HGCommandServer = require('hg').HGCommandServer;

function openHgRepo(path) {
    return new Promise(function(resolve, reject){
        var commandServer = new HGCommandServer();
        var queue = [];
        commandServer.start(path, function(err){
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
                    if (!fail){
                        var callback = queue.shift().resolve;
                        callback(value);
                        value = "";
                    }
                    fail = false;
                });

                commandServer.on("error", function(err, data){
                    console.log(err);
                    queue.shift().reject(err);
                    fail = true;
                });

                var repo = new Repo(commandServer, queue);
                resolve(repo);
            }
        });
    });
}

function Repo(commandServer, queue){
    this.run = function() {
        var args = arguments
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
