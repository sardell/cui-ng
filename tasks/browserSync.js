module.exports = config => {
    return {
        dev: {
            bsFiles: {
                src : [config.html.demoSrc].concat(
                    [config.js.moduleOut].concat(
                    [config.js.demoOut].concat(
                    [config.scss.demoOut] )))
            },
            options: {
                ghostMode: false,
                watchTask: true,
                online: true,
                port: 9001,
                server:{
                    baseDir: config.demo.baseDir
                }
            }
        },
        demo: {
            options: {
                ghostMode: false,
                watchTask: false,
                online: false,
                server:{
                    baseDir: config.demo.buildDir
                }
            }
        }
    }
}
