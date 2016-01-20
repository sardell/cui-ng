angular.module('cui-ng')
.directive('cuiAvatar',[function(){
    return{
        restrict: 'E',
        scope:{
            userAvatar:'='
        },
        link:function(scope,elem,attrs){
            scope.user={};
            scope.$watch('userAvatar',function(){
                var background;
                if(scope.userAvatar){
                    background= 'url("' + scope.userAvatar + '")';
                    angular.element(elem).css('background-image',background);
                }
                else{
                    background = '#AAA';
                    angular.element(elem).css({'background-image':'none','background-color':background});
                }
            });
        }
    };
}]);
