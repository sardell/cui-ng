angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
            scope.toggleExpand=function(){
                elem.toggleClass('expanded');
            };
            scope.expand=function(){
                if(!scope.expanded) scope.toggleExpand();
            };
            scope.collapse=function(){
            	if(scope.expanded) scope.toggleExpand();
            };
            scope.$watch(function() {return elem.attr('class'); }, function(newValue){
                if(newValue.indexOf('expanded')>-1) scope.expanded=true;
                else scope.expanded=false;
            });
        }
    };
}]);
