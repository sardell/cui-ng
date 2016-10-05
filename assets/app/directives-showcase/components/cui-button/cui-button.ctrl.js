angular.module('app')
.controller('cuiButtonCtrl', function($timeout) {

	const cuiButton = this
    
    let booleanSwitch = false

    cuiButton.cuiButtonClick = () => {
        cuiButton.cuiButtonLoading = true
        cuiButton.cuiButtonSuccess = false
        cuiButton.cuiButtonError = false

        $timeout(() => {
            cuiButton.cuiButtonLoading = false
            
            if (booleanSwitch) cuiButton.cuiButtonSuccess = true
            else cuiButton.cuiButtonError = true

            booleanSwitch =! booleanSwitch
        }, 1000)
        .then(() => {
            $timeout(() => {
                cuiButton.cuiButtonSuccess = false
                cuiButton.cuiButtonError = false
            }, 1500)
        })
    }

})
