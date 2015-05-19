var notifier = require('node-notifier');
var path = require('path');
var gui = require('nw.gui');
var win = gui.Window.get();
win.on('close',function(){
    this.hide();
    notifier.notify({
        title: "Source Command still running",
        message:"click tray icon to open.",
        icon: path.join(process.cwd(),'/server/images/check-in.png'),
        tag: 'running'
    });
});

//var http = require('http');
//var express = require('express');
var hg = require('./hg');
var HGMonitor = require('./hg-monitor');
//var exec = require('child_process').exec;
var path = require('path');

//var app = express();

//app.use('/', express.static(__dirname + '/../dist'));

//var server = http.createServer(app);

hg.open('C:/html5',function(repo){
    new HGMonitor(win, repo);
});

//server.listen(3000,function(){
    //var child = exec('chrome --app=http://localhost:3000/');
//});
var gui = require('nw.gui');
var tray = new gui.Tray({
    icon: 'server/images/check-in.png'
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
