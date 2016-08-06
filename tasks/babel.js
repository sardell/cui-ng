module.exports = config => {
    return {
        options: {
        sourceMap: true,
        presets: ['es2015'],
        retainLines:true
        },
        demo: {
            files: {
                [ config.js.demoOut ]: config.js.demoOut
            }
        },
        module: {
            files: {
                [ config.js.moduleOut ]: config.js.moduleOut
            }
        }
    }
}
