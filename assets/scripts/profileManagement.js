angular.module('app')
.controller('profileManagementCtrl',['Person',function(Person){
    var profile=this;
    profile.user=Person.add();
    console.log(profile.user);

    profile.save=function(){
        //Todo save profile.user to api
        console.log(profile.user);
    }
}]);