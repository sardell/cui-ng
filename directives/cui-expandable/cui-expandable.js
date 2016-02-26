angular.module('cui-ng')
.directive('cuiExpandable',['$parse',function($parse){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
            var expandableBody=angular.element(elem).children('cui-expandable-body');
            var transitionSpeed=parseInt(attrs.transitionSpeed || 300);
            expandableBody.hide(); // hide the body by default
            var toggleClass=function(){
                elem.toggleClass('expanded');
            };
            var toggleBody=function(){
                expandableBody.animate({'height':'toggle'},transitionSpeed,'linear');
            };

            scope.toggleExpand=function(){
                toggleClass();
            };
            scope.expand=function(){
                if(!scope.expanded) toggleClass();
            };
            scope.collapse=function(){
            	if(scope.expanded) toggleClass();
            };
            scope.$watch(function() {return elem.attr('class'); }, function(newValue,oldValue){
                if(oldValue===newValue && newValue.indexOf('expanded')>-1 ){ // if the element the expanded class put in by default
                    scope.expanded=true;
                    toggleBody();
                }
                else if(newValue.indexOf('expanded')===-1){
                    if(scope.expanded===true) toggleBody();
                    scope.expanded=false;
                }
                else{
                    if(scope.expanded===false) toggleBody();
                    scope.expanded=true;
                }
            });
        }
    };
}]);
