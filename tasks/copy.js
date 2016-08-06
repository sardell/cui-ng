module.exports = config => {
    return {
        build: Object.keys(config.thingsToCopyToBuild).reduce((buildCopyConfig, thingToCopy) => {
                return {
                    files: buildCopyConfig.files.concat([{
                        src: [thingToCopy],
                        dest: config.thingsToCopyToBuild[thingToCopy]
                    }])
                }
        }, {
            files: []
        })
    }
}
