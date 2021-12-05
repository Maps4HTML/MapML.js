module.exports = {
    serverOptions: {
        command: 'node test/server.js',
        port: 30001,
        launchTimeout: 10000,
    },
    launchOptions: {
      headless: true,
//      devtools: true, // expose browser devtools when headless: false
    },
    connectOptions: {
        slowMo: 250,
    },
    browsers: ["firefox"],
}
