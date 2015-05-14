var http = require('http');
var express = require('express');
var hg = require('./hg');
var HGMonitor = require('./hg-monitor');
var exec = require('child_process').exec;

var app = express();

app.use('/', express.static(__dirname + '/../dist'));

var server = http.createServer(app);

hg.open('C:/html5',function(repo){
    new HGMonitor(server, repo);
});

server.listen(3000,function(){
    exec('chrome --app=http://localhost:3000/');
});

