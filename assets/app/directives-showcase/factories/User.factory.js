angular.module('app')
.factory('User', function($rootScope) {
	
	return {
        getUser: () => {
            return $rootScope.appUser
        },
        setUser: (user) => {
            $rootScope.appUser = user
        }
    }

})
