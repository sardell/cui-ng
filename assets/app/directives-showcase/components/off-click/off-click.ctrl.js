angular.module('app')
.controller('offClickCtrl', function() {

    const offClick = this

    offClick.hits = 0

    offClick.addPoints = () => {
        if (offClick.notPlaying !== true) {
            offClick.missed = false
            offClick.hits = ((offClick.hits || 0) +1)
        }
    }

})
