var spawn = require('child_process').spawn;
var _ = require('lodash');
var http = require('http');
var express = require('express');

var app = express();

var numCommits = {};

function updateCommits() {
	var pull = spawn('hg', ['pull']);

	pull.on('close', function(){
		var value = '';

		var log = spawn('hg', ['log', '-d -30', '-Tjson', '-v']);

		log.stdout.on('data', function(data){
			value = value + data;
		});

		log.stdout.on('close', function(){
			var result = JSON.parse(value);
			var counts = _.countBy(result, function(r){
				return r.user;
			});
			numCommits = _.map(_.sortBy(_.pairs(counts), function(n){
				return -n[1];
			}), function(n){
				return {name: n[0], count: n[1]};
			});
		});
	});
}

updateCommits();
setInterval(updateCommits, 5000);

app.get('/data', function(req, res) {
	res.send(numCommits);
});

app.use('/', express.static(__dirname + '/dist'));

var server = http.createServer(app);
server.listen(3000);
