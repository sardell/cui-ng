angular.module('app')
.controller('customErrorCtrl', function(FakeAPI) {

    const customError = this

    customError.customErrors = {
        usernameTaken: function(value) {
            return {
                promise: FakeAPI.checkIfUsernameAvailable(value), valid: function(res) {
                    return res
                }
            }
        },
        notAdmin: function(value) {
            let _value = ''
            if (value) _value = value.toLowerCase()
            return _value !== 'admin'
        }
    }

})
