const {Cu} = require("chrome");
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;

pageMod.PageMod({
    include: ["*", "file://*"],
    attachTo: ["existing", "top"],
    contentScriptFile: data.url("content.js"),
    contentScriptWhen: "start", // Attach the content script before any page script loads.
});
