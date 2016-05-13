angular.module('cui-ng')
.directive('cuiExpandable',[() => {
    return{
        restrict:'E',
        scope:true,
        link:(scope,elem,attrs) => {
            const expandableBody = angular.element(elem[0].querySelector('cui-expandable-body'));
            expandableBody.hide(); // hide the body by default
            const toggleClass = () => {
                elem.toggleClass('expanded');
            };
            const toggleBody = () => {
                expandableBody.animate({'height':'toggle'}, parseInt(elem.attr('transition-speed') || 300) ,'linear');
            };

            scope.toggleExpand = (event) => {
                // this way labels won't toggle expand twice
                if(event && event.target.tagName==='INPUT' && event.target.labels && event.target.labels.length > 0 ) return;
                toggleClass();
            };
            scope.expand = () => {
                if(!scope.expanded) toggleClass();
            };
            scope.collapse = () => {
            	if(scope.expanded) toggleClass();
            };
            scope.$watch(() => elem.attr('class') , (newValue,oldValue) => {
                if(oldValue === newValue && newValue.indexOf('expanded') > -1 ){ // if the element the expanded class put in by default
                    scope.expanded = true;
                    toggleBody();
                }
                else if(newValue.indexOf('expanded') === -1){
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
