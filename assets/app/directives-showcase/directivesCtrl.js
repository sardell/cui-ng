angular.module('app')

.factory('user',['$rootScope',function($rootScope) {
    return {
        getUser: function() {
            return $rootScope.appUser;
        },
        setUser: function(user) {
            $rootScope.appUser = user;
        }
   };
}])

.factory('fakeApi',['$q','$timeout',function($q,$timeout) {
    return {
        checkIfUsernameAvailable: function(username) {
            var deferred = $q.defer();
            var delay = (Math.random() * 1000); // Simulate API random delay
            $timeout(function(){
                deferred.resolve(username !== 'Steven.Seagal');
            }, delay);
            return deferred.promise;
        }
    };
}])

.factory('words',['$http',function($http) {
    return {
        get: function() {
            return $http.get('http://randomword.setgetgo.com/get.php');
        }
    };
}])

.controller('directivesCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','$translate','fakeApi','$interval','words',
        'CuiPasswordPolicies','$q',
function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,$translate,fakeApi,$interval,words,
        CuiPasswordPolicies,$q) {

    var directives = this;
    var timer;

    directives.appUser = {
        names: ['Bill','Murray'],
        email: 'orin.fink@thirdwavellc.com'
    };

    $timeout(function() {
        directives.appUser.avatar = 'https://www.fillmurray.com/140/100';
    }, 1500);

    directives.hits = 0;

    directives.addPoints = function() {
        if (directives.notPlaying !== true) {
            directives.missed = false;
            directives.hits = ((directives.hits || 0)+1);
        }
    };

    directives.passwordPolicies = {};
    directives.passwordPolicies.disallowedWords = 'admin,password';
    directives.passwordPolicies.disallowedChars = '^%';
    directives.passwordPolicies.allowUpperChars = true;
    directives.passwordPolicies.allowLowerChars = true;
    directives.passwordPolicies.allowNumChars = true;
    directives.passwordPolicies.allowSpecialChars = true;
    directives.passwordPolicies.requiredNumberOfCharClasses = 2;
    directives.passwordPolicies.min = 6,
    directives.passwordPolicies.max = 8,

    $scope.$watch('directives.passwordPolicies', function(newPolicies, oldPolicies) {
        if(newPolicies) CuiPasswordPolicies.set([{
            allowUpperChars:directives.passwordPolicies.allowUpperChars,
            allowLowerChars:directives.passwordPolicies.allowLowerChars,
            allowNumChars:directives.passwordPolicies.allowNumChars,
            allowSpecialChars:directives.passwordPolicies.allowSpecialChars,
            requiredNumberOfCharClasses:directives.passwordPolicies.requiredNumberOfCharClasses,
            disallowedChars:directives.passwordPolicies.disallowedChars,
            min:directives.passwordPolicies.min,
            max:directives.passwordPolicies.max,
            disallowedWords:directives.passwordPolicies.disallowedWords.split(',')
        }]);
    }, true);

    directives.customErrors ={
            'usernameTaken':function(value) {
                return {
                    'promise':fakeApi.checkIfUsernameAvailable(value),
                    'valid':function(res){
                        return res;
                    }
                }
            },
            'notAdmin':function(value) {
                return value !== 'admin' && value !== 'Admin';
            }
    };

    directives.startGame = function() {
        if (angular.isDefined(timer)) $interval.cancel(timer);
        directives.userInput = '';
        directives.counter = 0;
        words.get()
        .then(function(res) {
            directives.random = res.data;
            directives.gameStarted = true;
            timer = $interval(function() {
                directives.counter += 0.01;
            }, 10);
        });
    };

    directives.stopGame = function() {
        $interval.cancel(timer);
        timer = undefined;
    };

    directives.restartGame = function() {
        directives.gameStarted = false;
        directives.startGame();
    };

    directives.getRandomWord = function() {
        words.get()
        .then(function(res) {
            directives.random2 = res.data;
        });
    };

    directives.testCallback = function() {
        console.log('hi!');
    };

    directives.onEdit = function(value) {
        console.log('test');
        if (!angular.isDefined(value)) {
            directives.inlineError = {};
        }
        else directives.inlineError = {
            test:value
        };
        directives.noSave = (value !== 'admin');
    };

    // Paginate Start -----------------------------------------------------------
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (toParams.page) {
            directives.page = parseInt($stateParams.page);
        }
    });

    directives.handlePageChange = function(page) {
        directives.currentPage = page;
    };
    // Paginate End -------------------------------------------------------------

    // Auto-Complete & Language Change Start ------------------------------------

    directives.defaultCountry = {
        name: 'United States',
        code: 'US'
    };

    // Auto-Complete & Language Change End --------------------------------------

    // CUI-Authorization Start --------------------------------------------------
    directives.buildEntitlements = function() {
        if (Object.keys(directives.entitlements || {}).length === 0) {
            directives.userEntitlements = [];
        }
        else {
            var entitlements = [], i = 0;
            angular.forEach(directives.entitlements, function(value, key) {
                if(value) {
                    entitlements[i] = key;
                    i++;
                }
            });
            directives.userEntitlements = entitlements;
        }
    };

    directives.buildEntitlements();
    // CUI-Authorization End ----------------------------------------------------

}]);
