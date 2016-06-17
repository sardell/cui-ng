module.exports = config => {
    return {
        html: config.demo.baseDir + 'index.html',
        options: {
            src: config.demo.baseDir,
            dest: config.demo.buildDir
        }
    }
}
