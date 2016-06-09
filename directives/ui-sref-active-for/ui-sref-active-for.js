angular.module('cui-ng')
.directive('uiSrefActiveFor',['$state','PubSub',($state,PubSub) => {
    return {
        restrict:'A',
        compile:() => {
            return {
                pre:(scope,elem,attrs) => {
                    let active,
                        classList = attrs.uiSrefActiveForClasses ? attrs.uiSrefActiveForClasses.split(',').map(x => x.trim()) : ['active']

                    const handleStateChange = (e, { toState }) => {
                        if(toState.name.indexOf(attrs.uiSrefActiveFor) >= 0 && !active) {
                            classList.forEach(className => elem[0].classList.add(className))
                            active = true
                        }
                        else if(toState.name.indexOf(attrs.uiSrefActiveFor) < 0 && active) {
                            classList.forEach(className => elem[0].classList.remove(className))
                            active = false
                        }
                    };

                    PubSub.subscribe('stateChange', handleStateChange);

                    handleStateChange(null, { toState: $state.current });

                    scope.$on('$destroy',()=> PubSub.unsubscribe('stateChange'));
                }
            }
        }
    }
}])