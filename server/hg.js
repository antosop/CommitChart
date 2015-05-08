var HGCommandServer = require('hg').HGCommandServer;

function openHgRepo(path, success, failure) {
    var commandServer = new HGCommandServer();
    var queue = [];
    commandServer.start(path, function(err){
        if (err){
            failure(err);
        } else {
            var value = "";
            commandServer.on("output", function(err, lines) {
                lines.forEach(function(line) {
                    value = value + line.body;
                });
            });

            commandServer.on("result", function(err, code) {
                var callback = queue.shift();
                callback(value);
                value = "";
            });
            var repo = new Repo(commandServer, queue);
            success(repo);
        }
    });
}

function Repo(commandServer, queue){
    this.run = function(command,args,callback) {
        args.splice(0,0,command);
        commandServer.runcommand.apply(commandServer,args);
        queue.push(callback);
    };
    this.close = function() {
        commandServer.stop();
    };
}

module.exports = {open: openHgRepo};
