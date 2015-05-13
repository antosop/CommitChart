module.exports = function() {
    return new Promise(function(resolve, reject) {
        if (!('Notification' in window)) {
            return;
        }
        window.Notification.requestPermission(function (perm) {
            switch (perm) {
                case 'granted':
                    resolve();
                    break;
                case 'denied':
                    reject(Error('Permission denied'));
                    break;
            }
        });
    });
};
