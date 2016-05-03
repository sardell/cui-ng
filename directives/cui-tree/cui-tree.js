const cuiTreeHelpers = {
    getKeyValue:(keyString,object) => {
        if(!keyString) return object;
        const keys=keyString.split('.').slice(1);
        let returnValue;
        if(keys.length === 0) return object;
        else {
            let i=0;
            do {
                returnValue? returnValue=returnValue[keys[i]] : returnValue=object[keys[i]];
                i++;
            }
            while (i<keys.length);
        }
        return returnValue;
    },
    getElements : (objects, opts, nesting=0) => {
        let nodes=[];
        const { getKeyValue, getElements } = cuiTreeHelpers;
        const { cuiTreeLeafDisplay, cuiTreeLeafDisplayFilter, cuiTreeLeafWrapper, cuiTreeNestPrefix } = opts;

        let $node = $(`<div class="${cuiTreeNestPrefix + nesting}"></div>`);
        objects.forEach((object) => {
            const $elementInner = $(`<span>${getKeyValue(cuiTreeLeafDisplay, object)}</span>`);
            const $leafWrapper = $(cuiTreeLeafWrapper).append($elementInner);
            $node.append($leafWrapper);
            if(object.children) $node.append(getElements(object.children, opts, nesting + 1)); // recursively gets the child nodes
        });
        return $node;
    }
}

const cuiTree = {
    pre: (scope,elem,attrs) => {
        const cuiTreeArray = scope.$eval(attrs.cuiTree);
        elem.append(cuiTreeHelpers.getElements(cuiTreeArray, attrs));
    }
}

angular.module('cui-ng')
.directive('cuiTree',[()=>{
    return {
        restrict:'A',
        scope: {},
        compile: ()=>{
            const { pre, post } = cuiTree;
            return { pre, post };
        }
    }
}]);