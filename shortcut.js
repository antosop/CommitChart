var path = require('path');
var ws = require('windows-shortcuts');

ws.create("%UserProfile%/Desktop/Source Command.lnk", {
    target: path.join(__dirname, "node_modules/nw/nwjs/nw.exe"),
    args: __dirname,
    icon: path.join(__dirname, "images/check-in.ico"),
    runStyle: ws.NORMAL
}, function(err){
    if (err)
        throw Error(err);
    else
        console.log("Shortcut created");
});
