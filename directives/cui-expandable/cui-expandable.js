angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
          scope.toggleExpand=function(){
              elem.toggleClass('expanded');
          };
        }
    };
}]);
