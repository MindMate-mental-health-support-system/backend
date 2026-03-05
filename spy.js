const util = require('util');
process.on('exit', (code) => {
    console.log('EXIT CALLED with code', code);
    console.log('Active handles:', process._getActiveHandles().length);
    console.log('Active requests:', process._getActiveRequests().length);
});
