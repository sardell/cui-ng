angular.module('cui-ng')
.directive('uiSrefActiveNested',['$state',function($state){
    return{
        restrict:'A',
        scope:{},
        link:function(scope,elem,attrs){
            if(!attrs.uiSref) {
                throw 'ui-sref-active-nested can only be used on elements with a ui-sref attribute';
                return;
            }

            // if this element is a link to a state that is nested
            if(attrs.uiSref.indexOf('.')>-1){
                var parentState=attrs.uiSref.split('.')[0];
            }
            // else if it's a parent state
            else var parentState=attrs.uiSref;
            scope.$on('$stateChangeStart',applyActiveClassIfNestedState);

            function applyActiveClassIfNestedState(e,toState){
                if(toState.name.indexOf('.')>-1 && toState.name.split('.')[0]===parentState){
                    elem[0].classList.add(attrs.uiSrefActiveNested);
                }
                else if(toState.name.indexOf('.')===-1 && toState.name===parentState){
                    elem[0].classList.add(attrs.uiSrefActiveNested);
                }
                else elem[0].classList.remove(attrs.uiSrefActiveNested);
            };
        }
    };
}]);