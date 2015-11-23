angular.module('app')
.controller('profileManagementCtrl',['Person', 'localStorageService', '$scope', function(Person, localStorageService, $scope){
    var profile=this;

    profile.save=function(){
    	//Todo save profile.user to api
    	localStorageService.set('profile.user',$scope.profile.user)
    };

     var profileInStorage = localStorageService.get('profile.user');
        profile.user = profileInStorage || Person.add();
        $scope.$watch('profile.user',function(){
            localStorageService.set('profile.user',$scope.profile.user)
        }, true);
}]);