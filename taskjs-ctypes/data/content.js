function lengthInBytes(arg, callback) {
    console.log("arg to lengthInBytes:" + arg);
    self.port.emit("lengthInBytesCalled", arg);

    self.port.on("lengthInBytesReturned", function(result) {
        console.log("result of lengthInBytes: " + result);
        callback(result);
    });
}

exportFunction(lengthInBytes, unsafeWindow, {defineAs: "lengthInBytes",
                                             allowCallbacks: true});
