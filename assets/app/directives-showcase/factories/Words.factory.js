angular.module('app')
.factory('Words', function($http) {
    
    return {
        get: () => {
            return $http.get('http://randomword.setgetgo.com/get.php')
        }
    }

})
