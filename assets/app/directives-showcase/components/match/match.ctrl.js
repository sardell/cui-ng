angular.module('app')
.controller('matchCtrl', function(words) {

    const match = this

    let timer

    match.startGame = function() {
        if (angular.isDefined(timer)) $interval.cancel(timer)
            match.userInput = ''
            match.counter = 0

            words.get()
            .then(function(res) {
                match.random = res.data
                match.gameStarted = true

                timer = $interval(function() {
                    match.counter += 0.01
                }, 10)
            })
        }

    match.stopGame = function() {
        $interval.cancel(timer)
        timer = undefined
    }

    match.restartGame = function() {
        match.gameStarted = false
        match.startGame()
    }

})
