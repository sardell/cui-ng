angular.module('app')
.controller('cuiAuthorizationCtrl', function() {

    const cuiAuthorization = this

    cuiAuthorization.buildEntitlements = () => {
	   if (Object.keys(cuiAuthorization.entitlements || {}).length === 0) {
            cuiAuthorization.userEntitlements = []
        }
        else {
            let entitlements = [] 
            let i = 0

            angular.forEach(cuiAuthorization.entitlements, (value, key) => {
                if (value) {
                    entitlements[i] = key
                    i++
                }
            })

            cuiAuthorization.userEntitlements = entitlements
        }
	}

    cuiAuthorization.buildEntitlements()

})
