angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
            var expandableBody=angular.element(elem).children('cui-expandable-body');
            expandableBody.hide();
            scope.toggleExpand=function(){
                elem.toggleClass('expanded');
                expandableBody.animate({'height':'toggle'},300,'linear');
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
