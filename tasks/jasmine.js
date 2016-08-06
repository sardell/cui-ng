module.exports = config => {
    return {
        module: {
            src: config.js.moduleOut,
            options: {
                specs: config.tests,
                helpers: config.testHelpers
            }
        }
    }
}
