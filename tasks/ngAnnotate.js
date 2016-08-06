module.exports = config => {
    return {
        options: {
            singleQuotes: true
        },
        module: {
            files: {
                [ config.js.moduleOut ]: config.js.moduleOut
            }
        },
        demo: {
            files: {
                [ config.js.demoOut ]: config.js.demoOut
            }
        }
    }
}