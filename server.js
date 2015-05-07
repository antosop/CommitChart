var exec = require('child_process').exec;
var _ = require('lodash');

exec('hg pull', function(){
	exec('hg log -v -Tjson -d "today"', function(err, stdout, stderr) {
		var result = JSON.parse(stdout);
		var counts = _.countBy(result, function(r){
			return r.user;
		});
		console.log(_.map(_.sortBy(_.pairs(counts),function(n){
				return -n[1];
			}),function(n){
				return {name: n[0], count: n[1]};
			})
		);
	});
});
