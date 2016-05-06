angular.module('cui-ng')
.directive('uiSrefActiveNested',['$state',($state) => {
    return{
        restrict:'A',
        link:(scope,elem,attrs)=>{
            let parentState;
            if(!attrs.uiSref) {
                throw 'ui-sref-active-nested can only be used on elements with a ui-sref attribute';
                return;
            }
            // if this element is a link to a state that is nested
            if(attrs.uiSref.indexOf('.')>-1){
                parentState = attrs.uiSref.split('.')[0];
            }
            // else if it's a parent state
            else parentState=attrs.uiSref;
            scope.$on('$stateChangeStart', applyActiveClassIfNestedState);

            let applyActiveClassIfNestedState = (e,toState) => {
                if(toState.name.indexOf('.')>-1 && toState.name.split('.')[0] === parentState){
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