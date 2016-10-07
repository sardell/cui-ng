angular.module('app')
.controller('onEnterCtrl', function() {

	const onEnter = this

    onEnter.onEnterResults = []

    onEnter.onEnter = (text) => {
        if (text && text !== '') {
        	onEnter.onEnterResults.push({ id: onEnter.onEnterResults.length + 1, text: text })
        }
        onEnter.onEnterInput = ''
    }

})
