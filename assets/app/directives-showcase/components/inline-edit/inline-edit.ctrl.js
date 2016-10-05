angular.module('app')
.controller('inlineEditCtrl', function(words) {

    const inlineEdit = this

    inlineEdit.getRandomWord = function() {
        words.get()
        .then(function(res) {
            inlineEdit.random2 = res.data
        })
    }

})
