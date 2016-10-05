angular.module('app')
.controller('customErrorCtrl', function(FakeAPI) {

    const customError = this

    customError.checkingUsername = false

    customError.customErrors = {
        usernameTaken: function(value) {
            return {
                promise: FakeAPI.checkIfUsernameAvailable(value), valid: function(res) {
                    return res
                }
            }
        },
        notAdmin: function(value) {
            return value !== 'admin' && value !== 'Admin'
        }
    }

})
