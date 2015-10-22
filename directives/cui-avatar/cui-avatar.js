(function(angular){'use strict';
    angular.module('cui-ng')
    .directive('cuiAvatar',[function(){
        return{
            restrict: 'E',
            scope:{},
            link:function(scope,elem,attrs){
                scope.user={};
                attrs.$observe('userAvatar',function(){
                    if(attrs.userAvatar!==''){
                        scope.user.avatar=attrs.userAvatar;
                        var background= 'url("' + scope.user.avatar + '")';
                        angular.element(elem).css('background-image',background);
                    } 
                    else{
                        scope.user.color='#AAA';
                        var background= scope.user.color;
                        angular.element(elem).css({'background-image':'none','background-color':background})
                    }
                })
            }
        };
    }])
})(angular);