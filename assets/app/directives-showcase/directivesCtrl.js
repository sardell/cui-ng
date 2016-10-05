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

.controller('directivesCtrl',['$rootScope','$state','$stateParams','user','$timeout','localStorageService','$scope','$translate','fakeApi','$interval','words','$q','$compile',
    function($rootScope,$state,$stateParams,user,$timeout,localStorageService,$scope,$translate,fakeApi,$interval,words,$q,$compile) {

        var directives = this;
        var timer;
        // let booleanSwitch = false

        // directives.appUser = {
        //     names: ['Bill','Murray'],
        //     email: 'orin.fink@thirdwavellc.com'
        // };

        // $timeout(function() {
        //     directives.appUser.avatar = 'https://www.fillmurray.com/140/100';
        // }, 1500);

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
            if(newPolicies) directives.passwordPolicyObject = {
                allowUpperChars:newPolicies.allowUpperChars,
                allowLowerChars:newPolicies.allowLowerChars,
                allowNumChars:newPolicies.allowNumChars,
                allowSpecialChars:newPolicies.allowSpecialChars,
                requiredNumberOfCharClasses:newPolicies.requiredNumberOfCharClasses,
                disallowedChars:newPolicies.disallowedChars,
                min:newPolicies.min,
                max:newPolicies.max,
                disallowedWords:newPolicies.disallowedWords.split(',')
            };
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


    // Paginate Start -----------------------------------------------------------
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (toParams.page) {
            directives.page = parseInt($stateParams.page);
        }
    });

    $scope.$watch('directives.count', function(newCount){
        if(directives.rerenderPaginate) {
            directives.rerenderPaginate();
        }
    });

    directives.handlePageChange = function(page) {
        directives.currentPage = page;
    };
    // Paginate End -------------------------------------------------------------

    // On-enter start -----------------------------------------------------------

    directives.onEnterResults=[];
    directives.onEnter = function(text) {
        if(text && text!=='') directives.onEnterResults.push({id:directives.onEnterResults.length+1,text:text});
        directives.onEnterInput = '';
    };

    // On-enter end -------------------------------------------------------------

    // cui-tree start -----------------------------------------------------------

    var listOfIds = [1];

    directives.addSibling = function(id,text,tree) {
        if( tree.some(function(leaf){ return leaf.id===parseInt(id) }) ) {
            listOfIds.push(listOfIds[listOfIds.length-1]+1);
            tree.push({id:listOfIds[listOfIds.length-1],text:text});
        }
        else {
            tree.forEach(function(leaf){
                if(leaf.children && leaf.children.length>0){
                    directives.addSibling(id,text,leaf.children);
                }
            });
        }
    };

    directives.addChild = function(id,text,tree) {
        var indexOfNode = _.findIndex(tree,function(leaf){ return leaf.id === parseInt(id) });
        if(indexOfNode >= 0) {
            listOfIds.push(listOfIds[listOfIds.length-1]+1);
            tree[indexOfNode].children ? tree[indexOfNode].children.push({id:listOfIds[listOfIds.length-1],text:text}) : tree[indexOfNode].children = [{id:listOfIds[listOfIds.length-1],text:text}];
        }
        else {
            tree.forEach(function(leaf){
                if(leaf.children && leaf.children.length>0){
                    directives.addChild(id,text,leaf.children);
                }
            })
        }
    };

    directives.removeLeaf = function(id, tree) {
        var indexOfNode = _.findIndex(tree,function(leaf){ return leaf.id === parseInt(id) });
        if(indexOfNode >= 0) {
            tree.splice(indexOfNode, 1)
        }
        else {
            tree.forEach(function(leaf) {
                if(leaf.children && leaf.children.length>0){
                    directives.removeLeaf(id, leaf.children);
                }
            })
        }
    }

    var previousActive;
    directives.leafClickCallback = function(object,leaf,e){
        if(previousActive){
            previousActive.classList.remove('active');
        }
        previousActive = $(leaf)[0];
        previousActive.classList.add('active');
        directives.leafBeingHandled = object;
    };

    // cui-tree end -------------------------------------------------------------

    directives.log=function(message){
        console.log(message);
    }

}]);
