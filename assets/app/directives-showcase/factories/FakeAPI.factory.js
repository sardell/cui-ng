angular.module('app')
.factory('FakeAPI', function($q, $timeout) {
    
    return {
        checkIfUsernameAvailable: (username) => {
            const deferred = $q.defer()
            const delay = (Math.random() * 1000) // Simulate API random delay
            let _username = ''

            $timeout(function() {
                if (username) _username = username.toLowerCase()
                deferred.resolve(_username !== 'steven.seagal')
            }, delay)

            return deferred.promise
        }
    }
    
})
