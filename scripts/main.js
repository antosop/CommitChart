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

hg.open('C:/html5',function(repo){
    new HGMonitor(win, repo);
});

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

tray.menu = menu;

tray.on('click', function() {
    win.show();
});
