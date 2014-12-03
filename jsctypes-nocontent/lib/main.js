let events = require("sdk/system/events");

// Get "chrome privileges" to access the Components object.
var {Cu, Cc, Ci} = require("chrome");

Cu.import("resource://gre/modules/ctypes.jsm");
Cu.import("resource://gre/modules/Services.jsm");

let gDebug = true;
let gPrefix = "jsctypes-nocontent: ";
function log(x) {
  if (gDebug) {
    console.log(gPrefix + x);
  }
}

let libc = null;
let libc_strlen = null;

function loadLibraries() {
    let os = Services.appinfo.OS;

    // Try letting the system look for the library in standard locations.
    if (os == "Darwin") {
        this.lib = ctypes.open("libc.dylib");
    } else if (os == "Linux") {
        this.lib = ctypes.open("libc.so.6");
    } else {
        throw "Your OS " + os + " is not supported";
    }

    // Declare the `strlen` function.
    libc_strlen = this.lib.declare("strlen",
                                   ctypes.default_abi,
                                   ctypes.size_t,
                                   ctypes.char.ptr);
}

function unloadLibraries() {
  if (libc) {
    libc.close();
  }
}


function lengthInBytes(str) {
    // str is a JS string; convert it to a ctypes string.
    let cString = ctypes.char.array()(str);

    let length = libc_strlen(cString);

    // `length` is a ctypes.UInt64; turn it into a JSON-serializable
    // string before returning it.
    return length.toString();
}

function injectFunctions(event) {
  // event.subject is an nsIDOMWindow
  // event.data is a string representing the origin
  log("injecting functions for origin " + event.data);
  let domWindow = event.subject;

  // Add lengthInBytes() to window
  Cu.exportFunction(lengthInBytes, domWindow,
                    { defineAs: "lengthInBytes" });
}


let gInitialized = false;

exports.main = function(options, callbacks) {
  if (!gInitialized &&
      (options.loadReason == "startup" ||
       options.loadReason == "install" ||
       options.loadReason == "enable")) {
    log("initializing");
    loadLibraries();
    events.on("content-document-global-created", injectFunctions);
    gInitialized = true;
  }
};

exports.onUnload = function(reason) {
  log("onUnload: " + reason);
  if (gInitialized && (reason == "shutdown" || reason == "disable")) {
    log("deinitializing");
    events.off("content-document-global-created", injectFunctions);
    unloadLibraries();
    gInitialized = false;
  }
};
