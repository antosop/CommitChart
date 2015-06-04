var gui = require('nw.gui');
var win = gui.Window.get();

var notifier = require('node-notifier');
var path = require('path');
var hg = require('node--hg');
var HGMonitor = require('node--hg-monitor');
var MainView = require('./main-view.js');
var React = require('react');

require('../styles/main.css');
var imgDir = path.join(process.cwd(), 'content/images');

var directory = 'C:/html5';
var repo = null;
var monitor = null;
var repoStatus = HGMonitor.Status.clean;
var waiting = false;

notifier.on('click', function(){
    win.show();
});

win.on('close', function(){
    this.hide();
    notifier.notify({
        title: 'Source Command still running',
        message: 'click tray icon to open.',
        icon: path.join(imgDir, 'check-in.png'),
        tag: 'running'
    });
});

function update(){
    var currentBookmark;
    var needsUpdate;
    var hasOutgoing;
    var needsCommit;
    return repo.run('log', '-r .', '-T {currentbookmark}')
    .then(function(output){
        currentBookmark = output.trim();
        return repo.run('log', '-Tjson', '-r (::@)-(::.)');
    }).then(function(output){
        needsUpdate = JSON.parse(output).length > 0;
        return repo.run('log', '-Tjson', '-r (::.)-(::@)');
    }).then(function(output){
        hasOutgoing = JSON.parse(output).length > 0;
        return repo.run('summary');
    }).then(function(output){
        needsCommit = !output.match(/commit: .*\(clean\)/g);
        if ((hasOutgoing || !needsUpdate) && needsCommit) {
            throw new Error('Please checkin, shelf, or revert');
        }
        if (needsUpdate) {
            if (hasOutgoing){
                return repo.run('help', 'rebase').then(function(output){
                    var hasRebase = !output.match(/enabling extensions/g);
                    if (!hasRebase){
                        throw new Error('Please enable rebase extension');
                    }
                    return repo.run('rebase', '-b .', '-d @');
                });
            } else {
                return repo.run('update', '@').then(function(){
                    if(currentBookmark){
                        return repo.run('bookmark', '-f', currentBookmark);
                    } else {
                        return repo.run('bookmark', '-i');
                    }
                });
            }
        } else {
            throw new Error('Already up to date');
        }
    }).then(function(){
        notifier.notify({
            title: 'Success',
            message: 'Update successful',
            icon: path.join(imgDir, 'update.png')
        });
    });
}

function push(){
    return repo.run('push', '-r .').then(function(){
        notifier.notify({
            title: 'Success',
            message: 'Push successful',
            icon: path.join(imgDir, 'push.png')
        });
    }).catch(function(err){
        var noChanges = !!err.message.match(/no changes found/g);
        var abort = err.message.match(/abort:.*/);
        if (noChanges){
            throw new Error('Nothing to push');
        }
        if (abort){
            throw new Error(abort);
        }
    });

}

function runIfOpen(action, func){
    if (repo) {
        beginWait();
        func().catch(function(err){
            notifier.notify({
                title: action + ' Error',
                message: err.message,
                icon: path.join(imgDir, 'reject-red.png')
            });
        }).then(function(){
            monitor.updateHistory()
            .then(stopWaiting);
        });
    } else {
        notifier.notify({
            title: 'Cannot ' + action,
            message: 'no repo open.',
            icon: path.join(imgDir, 'reject-red.png')
        });
    }
}

var tray = new gui.Tray({
    icon: path.join(imgDir, 'check-in.png')
});

var menu = new gui.Menu();
var bookmarkMenuItem = new gui.MenuItem({
    type: 'normal',
    label: '...',
    icon: path.join(imgDir, 'bookmark.png'),
    enabled: false
});
menu.append(bookmarkMenuItem);

menu.append(new gui.MenuItem({
    type: 'normal',
    label: 'update',
    icon: path.join(imgDir, 'update-16.png'),
    click: function(){runIfOpen('Update', update); }
}));

menu.append(new gui.MenuItem({
    type: 'normal',
    label: 'push',
    icon: path.join(imgDir, 'push-16.png'),
    click: function(){runIfOpen('Push', push); }
}));

menu.append(new gui.MenuItem({
    type: 'normal',
    label: 'close',
    icon: path.join(imgDir, 'close.png'),
    click: function() {
        win.close(true);
    }
}));

tray.menu = menu;

tray.on('click', function() {
    win.show();
});

function beginWait() {
    waiting = true;
    tray.icon = path.join(imgDir, 'wait.png');
    tray.tooltip = 'waiting...';
}

function showStatus() {
    switch (repoStatus) {
        case HGMonitor.Status.clean:
            tray.icon = path.join(imgDir, 'check-in.png');
            tray.tooltip = 'everything up to date.';
            break;
        case HGMonitor.Status.commit:
            tray.icon = path.join(imgDir, 'commit-16.png');
            tray.tooltip = 'you have changes to commit.';
            break;
        case HGMonitor.Status.update:
            tray.icon = path.join(imgDir, 'update-16.png');
            tray.tooltip = 'you need to update.';
            break;
        case HGMonitor.Status.push:
            tray.icon = path.join(imgDir, 'push-16.png');
            tray.tooltip = 'you have commits to push.';
            break;
    }
}

function stopWaiting() {
    waiting = false;
    showStatus();
}



function notifyIncoming(user, commitMessages){
    notifier.notify({
        title: user + ': ' + commitMessages.length + (commitMessages.length > 1 ? ' commits' : ' commit'),
        message: 'Click to view',
        icon: path.join(imgDir, 'pull.png'),
        sound: true,
        wait: true
    });
}

function updateStatus(stat){
    repoStatus = stat;
    if (!waiting){
        showStatus();
    }
}

function updateCurrentBookmark(name){
    bookmarkMenuItem.label = name;
}

function openRepo() {
    hg.open(directory).then(function(repository){
        repo = repository;
        monitor = new HGMonitor(repo);
        monitor.on('incoming', notifyIncoming);
        monitor.on('status', updateStatus);
        monitor.on('bookmark', updateCurrentBookmark);
    }).catch(function(){
        repo = null;
        monitor = null;
        tray.icon = path.join(imgDir, 'reject-red-16.png');
        tray.tooltip = 'Not a valid repository.';
    }).then(function(){
        renderView();
    });
}

function handleRepoChange(dir) {
    if(repo) {
        repo.close();
    }
    if(monitor){
        monitor.stop();
    }
    directory = dir;
    openRepo();
}

function renderView(){
    var mainView = <MainView onRepoChange={handleRepoChange} repoDir={{value: directory, isValid: !!repo}} />;

    React.render(mainView, document.getElementById('container'));
}

jQuery(win.window.document).ready(function(){
    jQuery('#close-window').on('click', function(){
        win.close();
    });

    openRepo();
});
