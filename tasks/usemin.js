module.exports = config => {
    return {
        options: {
            assetsDirs: [config.demo.buildDir]
        },
        css: [config.demo.buildDir + 'assets/css/**.*.css'],
        js: [config.demo.buildDir + 'assets/js/**.*.js'],
        html: [config.demo.buildDir + 'index.html']
    }
}
