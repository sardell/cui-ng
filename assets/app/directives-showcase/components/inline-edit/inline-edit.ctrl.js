angular.module('app')
.controller('inlineEditCtrl', function(Words) {

    const inlineEdit = this

    inlineEdit.getRandomWord = function() {
        Words.get()
        .then(function(res) {
            inlineEdit.random2 = res.data.Word
        })
    }

})
