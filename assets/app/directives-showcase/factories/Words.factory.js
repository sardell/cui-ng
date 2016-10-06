angular.module('app')
.factory('Words', function($http) {
    
    return {
        get: () => {
            return $http.jsonp('http://randomword.setgetgo.com/get.php?callback=JSON_CALLBACK')
        }
    }

})
