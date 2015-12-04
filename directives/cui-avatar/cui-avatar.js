angular.module('cui-ng')
.directive('cuiAvatar',[function(){
    return{
        restrict: 'E',
        scope:{},
        link:function(scope,elem,attrs){
            scope.user={};
            attrs.$observe('userAvatar',function(){
                var background;
                if(attrs.userAvatar!==''){
                    scope.user.avatar=attrs.userAvatar;
                    background= 'url("' + scope.user.avatar + '")';
                    angular.element(elem).css('background-image',background);
                } 
                else{
                    scope.user.color='#AAA';
                    background= scope.user.color;
                    angular.element(elem).css({'background-image':'none','background-color':background});
                }
            });
        }
    };
}]);
