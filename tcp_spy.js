const async_hooks = require('async_hooks');
const fs = require('fs');
const hook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId, resource) {
        if (type === 'TCPSERVERWRAP') {
            const origUnref = resource.unref;
            if (origUnref) {
                resource.unref = function () {
                    fs.writeFileSync('unref-trace.txt', 'UNREF CALLED TRACE:\n' + new Error().stack);
                    return origUnref.apply(this, arguments);
                };
            }
        }
    }
});
hook.enable();
require('./server.js');
