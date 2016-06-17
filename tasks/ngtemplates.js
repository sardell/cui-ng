module.exports = config => {
    return {
        demo: {
            src: config.html.demoSrc,
            dest: config.js.demoTemplateCache,
            options: {
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhiteSpace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeReduntantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkAttributes: true
                },
                module: 'app'
            }
        }
    }
}
