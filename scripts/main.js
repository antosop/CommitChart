var notifier = require('node-notifier');
var path = require('path');
var gui = require('nw.gui');
var hg = require('./scripts/hg');
var HGMonitor = require('./scripts/hg-monitor');
var path = require('path');

var win = gui.Window.get();
var repo;

notifier.on('click', function(notifierObject, options){
    win.show();
});

win.on('close',function(){
    this.hide();
    notifier.notify({
        title: "Source Command still running",
        message:"click tray icon to open.",
        icon: path.join(process.cwd(),'images/check-in.png'),
        tag: 'running'
    });
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
                return repo.run('rebase','-b .','-d first(head()-(.::))');
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

function push(){
    repo.run('push').then(function(results){
        var changes = !results.match(/no changes found/g);
        if (!changes){
            throw new Error("Nothing to push");
        }
        notifier.notify({
            title: "Success",
            message: "Push successful",
            icon: path.join(process.cwd(), "images/push.png")
        });
    }).catch(function(err){
        notifier.notify({
            title: "Error Pushing",
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
}));

menu.append(new gui.MenuItem({
    type: 'normal',
    label: 'push',
    icon: 'images/push-16.png',
    click: push
}));

tray.menu = menu;

tray.on('click', function() {
    win.show();
});

hg.open('C:/html5').then(function(repository){
    repo = repository;
    var monitor = new HGMonitor(repo);

    monitor.on('incoming',function(user, commitMessages){
        notifier.notify({
            title: user + ': ' + commitMessages.length + (commitMessages.length > 1 ? ' commits' : ' commit'),
            message:'Click to view',
            icon: path.join(process.cwd(),'images/pull.png'),
            sound: true,
            wait: true
        });
    });

    monitor.on('status', function(repoStatus){
        switch (repoStatus) {
            case HGMonitor.Status.clean:
                tray.icon = 'images/check-in.png';
                tray.tooltip = 'everything up to date.';
                break;
            case HGMonitor.Status.commit:
                tray.icon = 'images/commit-16.png';
                tray.tooltip = 'you have changes to commit.';
                break;
            case HGMonitor.Status.update:
                tray.icon = 'images/update-16.png';
                tray.tooltip = 'you need to update.';
                break;
            case HGMonitor.Status.push:
                tray.icon = 'images/push-16.png';
                tray.tooltip = 'you have commits to push.';
                break;
        }
    });
});
