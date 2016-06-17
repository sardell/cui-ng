module.exports = config => {
    return {
        options: {
            sourceMap: true,
            mangle: true
        },
        module: {
            src: config.js.moduleOut,
            dest: config.js.moduleOut.replace('.js','.min.js')
        }
    }
}
