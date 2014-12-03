function lengthInBytes(arg, callback) {
    console.log("arg to lengthInBytes:" + arg);
    self.port.emit("lengthInBytesCalled", arg);

    self.port.on("lengthInBytesReturned", function(result) {
        console.log("result of lengthInBytes: " + result);
        callback(result);
    });
}

function lengthInBytesPromise(arg) {
    self.port.emit("lengthInBytesCalled", arg);

    let returnVal = new Promise(function(resolve, reject) {
        // ???
    });

    self.port.on("lengthInBytesReturned", function(result) {
        Promise.resolve(returnVal);
    });

    return returnVal;
}

exportFunction(lengthInBytes, unsafeWindow, {defineAs: "lengthInBytes",
                                             allowCallbacks: true});

exportFunction(lengthInBytesPromise, unsafeWindow, {defineAs: "lengthInBytesPromise"});
