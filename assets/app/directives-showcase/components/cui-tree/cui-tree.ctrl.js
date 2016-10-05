angular.module('app')
.controller('cuiTreeCtrl', function() {

	const cuiTree = this

    var listOfIds = [1]

    cuiTree.addSibling = function(id,text,tree) {
        if( tree.some(function(leaf){ return leaf.id===parseInt(id) }) ) {
            listOfIds.push(listOfIds[listOfIds.length-1]+1)
            tree.push({id:listOfIds[listOfIds.length-1],text:text})
        }
        else {
            tree.forEach(function(leaf){
                if(leaf.children && leaf.children.length>0){
                    cuiTree.addSibling(id,text,leaf.children)
                }
            })
        }
    }

    cuiTree.addChild = function(id,text,tree) {
        var indexOfNode = _.findIndex(tree,function(leaf){ return leaf.id === parseInt(id) })
        if(indexOfNode >= 0) {
            listOfIds.push(listOfIds[listOfIds.length-1]+1)
            tree[indexOfNode].children ? tree[indexOfNode].children.push({id:listOfIds[listOfIds.length-1],text:text}) : tree[indexOfNode].children = [{id:listOfIds[listOfIds.length-1],text:text}]
        }
        else {
            tree.forEach(function(leaf){
                if(leaf.children && leaf.children.length>0){
                    cuiTree.addChild(id,text,leaf.children)
                }
            })
        }
    }

    cuiTree.removeLeaf = function(id, tree) {
        var indexOfNode = _.findIndex(tree,function(leaf){ return leaf.id === parseInt(id) })
        if(indexOfNode >= 0) {
            tree.splice(indexOfNode, 1)
        }
        else {
            tree.forEach(function(leaf) {
                if(leaf.children && leaf.children.length>0){
                    cuiTree.removeLeaf(id, leaf.children)
                }
            })
        }
    }

    var previousActive
    cuiTree.leafClickCallback = function(object,leaf,e){
        if(previousActive){
            previousActive.classList.remove('active')
        }
        previousActive = $(leaf)[0]
        previousActive.classList.add('active')
        cuiTree.leafBeingHandled = object
    }

    // cui-tree end -------------------------------------------------------------

})
