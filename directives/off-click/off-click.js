angular.module('cui-ng')
.factory('OffClickFilterCache',[()=>{
    let filterCache={};
    return filterCache;
}])
.directive('offClickFilter',['OffClickFilterCache',(OffClickFilterCache)=>{
    return {
        restrict:'A',
        link : (scope, elem, attrs) => {
            const filters = attrs.offClickFilter.split(',');

            filters.forEach((filter)=>{
                OffClickFilterCache[filter] ? OffClickFilterCache[filter].push(elem[0]) : OffClickFilterCache[filter]=[elem[0]];
            })
            scope.$on('$destroy',()=>{
                filters.forEach((filter)=>{
                    if(OffClickFilterCache[filter].length>1) {
                        OffClickFilterCache[filter].splice(OffClickFilterCache[filter].indexOf(elem[0]),1);
                    }
                    else delete OffClickFilterCache[filter];
                })
            });
        }
    };
}])
.directive('offClick', ['$rootScope', '$parse', 'OffClickFilterCache', ($rootScope, $parse, OffClickFilterCache) => {
    let id = 0;
    let listeners = {};
    // add variable to detect touch users moving..
    let touchMove = false;

    const targetInFilter = (target, elms) => {
        if (!target || !elms) return false;
        const elmsLen = elms.length;
        for (let i = 0; i < elmsLen; ++i) {
            const currentElem = elms[i];
            let containsTarget = false;
            try {
                containsTarget = currentElem.contains(target);
            } catch (e) {
                // If the node is not an Element (e.g., an SVGElement) node.contains() throws Exception in IE,
                // see https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
                // In this case we use compareDocumentPosition() instead.
                if (typeof currentElem.compareDocumentPosition !== 'undefined') {
                    containsTarget = currentElem === target || Boolean(currentElem.compareDocumentPosition(target) & 16);
                }
            }

            if (containsTarget) {
                return true;
            }
        }
        return false;
    }

    const offClickEventHandler = (event) => {
        // If event is a touchmove adjust touchMove state
        if( event.type === 'touchmove' ){
            touchMove = true;
            // And end function
            return false;
        }
        // This will always fire on the touchend after the touchmove runs...
        if( touchMove ){
            // Reset touchmove to false
            touchMove = false;
            // And end function
            return false;
        }
        const target = event.target || event.srcElement;
        angular.forEach(listeners, (listener, i) => {
            let filters=[];
            if(OffClickFilterCache['#'+listener.elm.id]) filters = filters.concat(OffClickFilterCache['#'+listener.elm.id]);
            angular.forEach(listener.elm.classList, (className)=>{
                if(OffClickFilterCache['.' + className]) filters = filters.concat(OffClickFilterCache['.' + className]);
            });
            if (!(listener.elm.contains(target) || targetInFilter(target, filters))) {
                $rootScope.$evalAsync(function () {
                    listener.cb(listener.scope, {
                        $event: event
                    });
                });
            }

        });
    }


    // Add event listeners to handle various events. Destop will ignore touch events
    document.addEventListener("touchmove", offClickEventHandler, true);
    document.addEventListener("touchend", offClickEventHandler, true);
    document.addEventListener('click', offClickEventHandler, true);


    return {
        restrict: 'A',
        compile: (elem, attrs) => {
            const fn = $parse(attrs.offClick);
            return function (scope, element) {
                const elmId = id++;
                let removeWatcher;

                const on = () => {
                    listeners[elmId] = {
                        elm: element[0],
                        cb: fn,
                        scope: scope
                    };
                };

                const off = () => {
                    listeners[elmId] = null;
                    delete listeners[elmId];
                };

                if (attrs.offClickIf) {
                    removeWatcher = $rootScope.$watch(() => $parse(attrs.offClickIf)(scope), (newVal) => {
                        newVal && on() || !newVal && off()
                    });
                } else on();

                scope.$on('$destroy', () => {
                    off();
                    if (removeWatcher) {
                        removeWatcher();
                    }
                    element = null;
                });

            };
        }
    };
}]);
