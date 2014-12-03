// Get "chrome privileges" to access the Components object.
var {Cu, Cc, Ci} = require("chrome");

Cu.import("resource://gre/modules/ctypes.jsm");
Cu.import("resource://gre/modules/Services.jsm");

var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
pageMod.PageMod({
    include: ["*", "file://*"],
    attachTo: ["existing", "top"],
    contentScriptFile: data.url("content.js"),
    contentScriptWhen: "start", // Attach the content script before any page script loads.

    onAttach: function(worker) {
        worker.port.on("lengthInBytesCalled", function(arg) {
            console.log("arg to lengthInBytes in main.js: " + arg);
            let result = lengthInBytes(arg);

            console.log("result of lengthInBytes in main.js: " + result);
            worker.port.emit("lengthInBytesReturned", result);
        });
    }
});

let libc = {

    lib: null,

    init: function() {

        let os = Services.appinfo.OS;

        if (os == "Darwin") {
            this.lib = ctypes.open("libc.so");
        } else if (os == "Linux") {
            // Try letting the system look for the library in standard locations.
            this.lib = ctypes.open("libc.so.6");
        } else {
            throw "Your OS " + os + " is not supported";
        }

        // Declare the `strlen` function.
        this.strlen = this.lib.declare("strlen",
                                       ctypes.default_abi,
                                       ctypes.size_t,
                                       ctypes.char.ptr);
    },

    shutdown: function() {
        this.lib.close();
    },
}

function lengthInBytes(str) {
    // str is a JS string; convert it to a ctypes string.
    let cString = ctypes.char.array()(str);

    libc.init();
    let length = libc.strlen(cString);
    libc.shutdown();

    // `length` is a ctypes.UInt64; turn it into a JSON-serializable
    // string before returning it.
    return length.toString();
}
