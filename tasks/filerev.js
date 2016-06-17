module.exports = config => {
    return {
        demo:{
            src: [
                config.demo.buildDir + 'assets/css/main.css',
                config.demo.buildDir + 'assets/js/vendor.js',
                config.demo.buildDir + 'assets/js/app.js'
            ]
        }
    }
}
