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
        return String(returnValue);
    },
    getDisplayValue:(opts,object) => {
        const { cuiTreeLeafDisplay, cuiTreeLeafDisplayFilter } = opts;
        const { getKeyValue } = cuiTreeHelpers;
        let propertiesToDisplay = cuiTreeLeafDisplay.split('+');
        propertiesToDisplay = propertiesToDisplay.map(x => x.trim());

        let displayValue='';
        propertiesToDisplay.forEach((property) => {
            if(property.indexOf(`'`)>=0 || property.indexOf(`"`)>=0) {
                displayValue += property.split(`'`).join('').split('"').join('');
            }
            else displayValue += getKeyValue(property, object);
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
                classList.push(cuiTreeNestPrefix || defaults.cuiTreeNestPrefix) + nesting;
                classList.push( cuiTreeNestXClass || defaults.cuiTreeNestXClass );
        };
        return classList;
    },
    getElements : (opts, objects, leafClickCallback, nesting=0) => {
        const { getKeyValue, getElements, getDisplayValue, getClassListForNestingLevel } = cuiTreeHelpers;
        const { cuiTreeBranchWrapper, cuiTreeLeafWrapper, cuiTreeLastLeafClass, cuiTreeLastBranchClass } = opts;
        let $node = $(`<div></div>`);
        getClassListForNestingLevel(opts,nesting).forEach(className => $node[0].classList.add(className));
        objects.forEach((object,i) => {
            const $leafInner = $(`<span>${ getDisplayValue(opts,object) }</span>`);
            const $leafWrapper = $(cuiTreeLeafWrapper || defaults.cuiTreeLeafWrapper);
            $leafWrapper[0].addEventListener("click",function(e){ leafClickCallback(object,this,e) },true);
            $leafWrapper.append($leafInner);
            if(i === objects.length-1) $leafWrapper[0].classList.add(cuiTreeLastLeafClass || defaults.cuiTreeLastLeafClass); // add class to last leaf of each indent level.
            if(object.children) { // if it has children creat a new branch for the leaf and it's children
                const $branchWrapper = $(cuiTreeBranchWrapper || defaults.cuiTreeBranchWrapper).append($leafWrapper);
                if(i === objects.length-1) $branchWrapper[0].classList.add(cuiTreeLastBranchClass || defaults.cuiTreeLastBranchClass);
                $branchWrapper.append(getElements(opts, object.children, leafClickCallback, nesting + 1)); // recursively gets the child nodes
                $node.append($branchWrapper);
            }
            else {
                $node.append($leafWrapper);
            }
        });
        return $node;
    }
};

const cuiTree =  {
    pre: (scope,elem,attrs) => {
        let $tree;
        const leafClickCallback = scope.$eval(attrs.cuiTreeLeafClickCallback);

        const renderTree = (tree) => {
            if($tree) {
                $tree.detach();
                $tree.children().unbind();
            }
            $tree = cuiTreeHelpers.getElements(attrs, tree, leafClickCallback);
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

angular.module('cui-ng')
.directive('cuiTree',[()=>{
    return {
        restrict:'A',
        scope: true,
        compile: ()=>{
            const { pre, post } = cuiTree;
            return { pre, post };
        }
    }
}]);