angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
          scope.toggleExpand=function(){
              elem.hasClass('expanded')? elem.removeClass('expanded') : elem.addClass('expanded');
          };
        }
    };
}]);
