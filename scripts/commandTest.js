require('es6-promise').polyfill();

var hg = require('./hg');
var repo;
hg.open('C:/html5').then(function(repository){
    repo = repository;
    return repo.run('rebase','-b .','-d first(head()-(.::))');
}).then(function(result){
    console.log(result);
    repo.close();
}).catch(function(err){
    console.log(err);
    repo.close();
});

