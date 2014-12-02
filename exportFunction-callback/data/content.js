function hello(name) {
    console.log("Hello from privileged code, " + name + "!");
}

exportFunction(hello, unsafeWindow, {defineAs: "hello"});
