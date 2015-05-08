var spawn = require('child_process').spawn;
var _ = require('lodash');
var http = require('http');
var express = require('express');
var hg = require('./hg');
var HGMonitor = require('./hg-monitor');

var numCommits = [];
var newCommits = [];

var app = express();

app.get('/data', function(req, res) {
    res.send({newCommits: newCommits, commitCount: numCommits});
});

app.use('/', express.static(__dirname + '/dist'));

var server = http.createServer(app);

hg.open('C:/html5',function(repo){

    new HGMonitor(server, repo);

});

server.listen(3000);
