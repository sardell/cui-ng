module.exports = config => {
    return {
        css: {
            files: config.scss.demoSrc,
            tasks: ['sass']
        },
        scripts: {
            files: config.js.moduleSrc.concat(config.js.demoSrc),
            tasks: ['concat:demo','concat:module'],
            options: {
                spawn: false,
            },
        }
    }
}
