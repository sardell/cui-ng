angular.module('app')
.factory('FakeAPI', function($q, $timeout) {
    
    return {
        checkIfUsernameAvailable: (username) => {
            const deferred = $q.defer()
            const delay = (Math.random() * 1000) // Simulate API random delay

            $timeout(function(){
                deferred.resolve(username !== 'Steven.Seagal')
            }, delay)

            return deferred.promise
        }
    }
    
})
