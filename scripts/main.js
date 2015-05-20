var notifier = require('node-notifier');
var path = require('path');
var gui = require('nw.gui');
var win = gui.Window.get();
console.log(process.cwd());
win.on('close',function(){
    this.hide();
    notifier.notify({
        title: "Source Command still running",
        message:"click tray icon to open.",
        icon: path.join(process.cwd(),'images/check-in.png'),
        tag: 'running'
    });
});

var hg = require('./scripts/hg');
var HGMonitor = require('./scripts/hg-monitor');
var path = require('path');
var repo;
hg.open('C:/html5').then(function(repository){
    repo = repository;
    new HGMonitor(win, repo);
});

function update(){
    repo.run('summary').then(function(results){
        var unclean = !results.match(/commit: .*\(clean\)/g);
        if (unclean){
           throw new Error("Please checkin, shelf, or revert");
        }
        var needsUpdate = !results.match(/update: \(current\)/g);
        if (!needsUpdate){
            throw new Error("Already up to date");
        }
        return repo.run('outgoing');
    }).then(function(results){
        var needsRebase = !results.match(/no changes found/g);
        if (needsRebase){
            return repo.run('help','rebase').then(function(results){
                var hasRebase = !results.match(/enabling extensions/g);
                if (!hasRebase){
                    throw new Error("Please enable rebase extension");
                }
                return repo.run('rebase');
            });
        } else {
            return repo.run('update');
        }
    }).then(function(){
        notifier.notify({
            title: "Success",
            message: "Update successful",
            icon: path.join(process.cwd(), "images/update.png")
        });
    }).catch(function(err){
        notifier.notify({
            title: "Error Updating",
            message: err.message,
            icon: path.join(process.cwd(), "images/reject-red.png")
        });
    });
}

var gui = require('nw.gui');
var tray = new gui.Tray({
    icon: 'images/check-in.png'
});

var menu = new gui.Menu();
menu.append(new gui.MenuItem({
    type: 'normal',
    label: 'close',
    click: function() {
        win.close(true);
    }
}));

menu.append(new gui.MenuItem({
    type: 'normal',
    label: 'update',
    icon: 'images/update-16.png',
    click: update
}))

tray.menu = menu;

tray.on('click', function() {
    win.show();
});

