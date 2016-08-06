module.exports = config => {
    return {
        options: {
            separator: '\n\n',
            banner: config.banner
        },
        demo: {
            src: [config.js.demoIntro].concat(
                [config.js.demoSrc].concat(
                [config.js.demoOutro] )),
            dest: config.js.demoOut
        },
        module: {
            src: [config.js.moduleIntro].concat(
                config.js.moduleSrc.concat(
                [config.js.moduleOutro] )),
            dest: config.js.moduleOut
        },
        demoWithTemplates: {
            src: [config.js.demoIntro].concat(
                [config.js.demoTemplateCache].concat(
                [config.js.demoSrc].concat(
                [config.js.demoOutro] ))),
            dest: config.js.demoOut
        }
    }
}
