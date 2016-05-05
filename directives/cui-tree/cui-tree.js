const defaults = {
    cuiTreeNest0Class : 'cui-tree--nesting-0',
    cuiTreeNestXClass : 'cui-tree--nested',
    cuiTreeLeafWrapper: '<div class="cui-tree__leaf"></div>',
    cuiTreeLastLeafClass : 'cui-tree__leaf--last',
    cuiTreeBranchWrapper: '<div class="cui-tree__branch"></div>',
    cuiTreeLastBranchClass : 'cui-tree__branch--last',
    cuiTreeNestPrefix : 'cui-tree--nesting-'
};

const cuiTreeHelpers = {
    getKeyValue:(keyString,object) => {;
        if(!keyString) return object;
        const keys=keyString.split('.').slice(1);
        let returnValue;
        if(keys.length === 0) return object;
        else {
            let i=0;
            do {
                angular.isDefined(returnValue)? returnValue=returnValue[keys[i]] : returnValue=object[keys[i]];
                i++;
            }
            while (i<keys.length);
        }
        return returnValue;
    },
    getDisplayValue:($filter, opts, object) => {
        const { cuiTreeLeafDisplay } = opts;
        const { getKeyValue } = cuiTreeHelpers;
        let propertiesToDisplay = cuiTreeLeafDisplay.split('+');
        propertiesToDisplay = propertiesToDisplay.map(x => x.trim());

        let displayValue='',
            filter;
        propertiesToDisplay.forEach((property) => {
            let tempDisplayValue;
            if(property.indexOf('|')>=0) { // if it's a filter
                [ property,filter ] = property.replace(/(\(|\)|\))/g,'').split('|');
            }

            if(property.indexOf(`'`)>=0 || property.indexOf(`"`)>=0) {
                tempDisplayValue = property.split(`'`).join('').split('"').join('');
            }
            else {
                tempDisplayValue = getKeyValue(property.trim(), object);
            }

            if(filter) tempDisplayValue = $filter(filter.trim())(tempDisplayValue.trim());

            displayValue += tempDisplayValue;
        });
        return displayValue;
    },
    getClassListForNestingLevel: (opts,nesting) => {
        const { cuiTreeNestPrefix, cuiTreeNest0Class, cuiTreeNestXClass } = opts;
        let classList = [];
        switch (nesting){
            case 0:
                classList.push( cuiTreeNest0Class || defaults.cuiTreeNest0Class );
                break;
            default:
                classList.push((cuiTreeNestPrefix || defaults.cuiTreeNestPrefix) + nesting);
                classList.push( cuiTreeNestXClass || defaults.cuiTreeNestXClass );
        };
        return classList;
    },
    getElements : ($filter, opts, objects, leafClickCallback, nesting=0) => {
        const { getKeyValue, getElements, getDisplayValue, getClassListForNestingLevel } = cuiTreeHelpers;
        const { cuiTreeBranchWrapper, cuiTreeLeafWrapper, cuiTreeLastLeafClass, cuiTreeLastBranchClass } = opts;
        let $node = $(`<div></div>`);
        getClassListForNestingLevel(opts,nesting).forEach(className => $node[0].classList.add(className));
        objects.forEach((object,i) => {
            const $leafInner = $(`<span>${ getDisplayValue($filter, opts, object) }</span>`);
            const $leafWrapper = $(cuiTreeLeafWrapper || defaults.cuiTreeLeafWrapper);
            if(leafClickCallback) $leafWrapper[0].addEventListener("click",function(e){ leafClickCallback(object,this,e) },true);
            $leafWrapper.append($leafInner);
            if(i === objects.length-1) $leafWrapper[0].classList.add(cuiTreeLastLeafClass || defaults.cuiTreeLastLeafClass); // add class to last leaf of each indent level.
            if(object.children) { // if it has children creat a new branch for the leaf and it's children
                const $branchWrapper = $(cuiTreeBranchWrapper || defaults.cuiTreeBranchWrapper).append($leafWrapper);
                if(i === objects.length-1) $branchWrapper[0].classList.add(cuiTreeLastBranchClass || defaults.cuiTreeLastBranchClass);
                $branchWrapper.append(getElements($filter, opts, object.children, leafClickCallback, nesting + 1)); // recursively gets the child nodes
                $node.append($branchWrapper);
            }
            else {
                $node.append($leafWrapper);
            }
        });
        return $node;
    }
};

const cuiTree =  ($filter) => {
    return {
        pre: (scope,elem,attrs) => {
            let $tree;
            const leafClickCallback = scope.$eval(attrs.cuiTreeLeafClickCallback);

            const renderTree = (tree) => {
                if($tree) {
                    $tree.detach();
                    $tree.children().unbind();
                }
                $tree = cuiTreeHelpers.getElements($filter, attrs, tree, leafClickCallback);
                elem.append($tree);
            };

            scope.$watch(()=>scope.$eval(attrs.cuiTree),(newTree)=>{
                if(newTree) renderTree(newTree);
            },true);

            scope.$on('$destroy',()=>{
                $tree.children().unbind();
            });
        }
    };
};

angular.module('cui-ng')
.directive('cuiTree',['$filter',($filter)=>{
    return {
        restrict:'A',
        scope: true,
        compile: ()=>{
            return cuiTree($filter);
        }
    }
}]);