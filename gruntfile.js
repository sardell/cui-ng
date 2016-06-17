module.exports = grunt => {

    require('load-grunt-tasks')(grunt)

    const config = Object.assign({}, grunt.file.readJSON('./grunt-config.json'), {
        encoding: 'UTF8'
    }, {
        banner: grunt.template.process('\n\n// cui-ng build <%= dateTime %>\n\n', {
            data: {
                dateTime: grunt.template.today('default')
            }
        })
    })

    const tasks = grunt.file.expand('./tasks/*.js')

    grunt.initConfig(tasks.reduce( (configObject, task) => {
        return Object.assign({}, configObject, {
            [ task.replace('./tasks/','').replace('.js','') ]: require(task)(config)
        })
    }, {}))

    grunt.registerTask('default', [
        'sass:demo',
        'concat:demo',
        'concat:module',
        'babel:demo',
        'babel:module',
        'ngAnnotate:demo',
        'ngAnnotate:module',
        'browserSync:dev',
        'watch'
    ])

    grunt.registerTask('build', [
        'clean:build',
        'ngtemplates:demo',
        'sass:demo',
        'copy:build',
        'concat:demoWithTemplates',
        'concat:module',
        'babel:demo',
        'babel:module',
        'ngAnnotate:demo',
        'ngAnnotate:module',
        'uglify:module',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin',
        'clean:tmp'
    ])

    grunt.registerTask('demo', [
        'browserSync:demo'
    ])

    grunt.registerTask('test', [
        'build',
        'jasmine:module'
    ])

    grunt.registerTask('lint', [
        'jshint'
    ])
}
