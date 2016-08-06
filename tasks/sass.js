module.exports = config => {
    return {
        demo:{
            files:{
                [ config.scss.demoOut ]: config.scss.demoEntry
            }
        }
    }
}
