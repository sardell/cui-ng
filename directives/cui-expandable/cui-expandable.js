angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope: true,
        link:function(scope,elem,attrs){
            var expandableBody=angular.element(elem).children('cui-expandable-body');
            expandableBody.hide(); // hide the body by default
            scope.toggleExpand=function(toggleClass){
                if(toggleClass==undefined || toggleClass!=false) elem.toggleClass('expanded');
                expandableBody.animate({'height':'toggle'},300,'linear');
            };
            scope.expand=function(){
                if(!scope.expanded) scope.toggleExpand();
            };
            scope.collapse=function(){
            	if(scope.expanded) scope.toggleExpand();
            };
            scope.$watch(function() {return elem.attr('class'); }, function(newValue,oldValue){
                if(oldValue===newValue && newValue.indexOf('expanded')>-1 ){ // if the element the expanded class put in by default
                    scope.expanded=true;
                    scope.toggleExpand(false);
                }
                else if(oldValue && newValue.indexOf('expanded')>-1){ // if the element has the expanded class now but didn't before
                    scope.expanded=true;
                }
                else scope.expanded=false;
            });
        }
    };
}]);
