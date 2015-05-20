require('es6-promise').polyfill();

var hg = require('./hg');
var repo;
hg.open('C:/html5').then(function(repository){
    repo = repository;
    return repo.run('help','rebase');
}).then(function(results){
    var hasRebase = !results.match(/enabling extensions/g);
    if (!hasRebase){
        throw new Error("Please enable rebase extension");
    }
    return repo.run('summary');
}).then(function(results){
    var unclean = !results.match(/commit: .*\(clean\)/g);
    if (unclean){
       throw new Error("Please checkin, shelf, or revert");
    }
    return repo.run('outgoing');
}).then(function(results){
    var needsRebase = !results.match(/no changes found/g);
    if (needsRebase){
        console.log('rebase');
        return repo.run('rebase');
    } else {
        console.log('update');
        return repo.run('update');
    }
}).then(function(result){
    console.log(result);
    repo.close();
}).catch(function(err){
    console.log(err);
    repo.close();
});

