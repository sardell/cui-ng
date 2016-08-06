module.exports = config => {
    return {
        build: {
            src: config.demo.buildDir
        },
        tmp: {
            src: './.tmp/'
        }
    }
}
