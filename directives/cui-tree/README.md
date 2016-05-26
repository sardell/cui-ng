# CUI-Tree
Version 1.0


### Description
Cui-Tree is a directive that generates a tree like markup structure, based on an array of objects with 'children'.

### Usage Example

```html
  <div class="cui-tree" cui-tree="app.tree" cui-tree-leaf-display="object.text"></div>
```

* cui-tree-leaf-display determines what to show in each leaf, and it accepts: properties from each object (use object.propertyName), strings ( wrap them in '' ) and filters ( ex: (object.name | cuiI18n) ). You can also concat display values ( ex : cui-tree-leaf-display="object.text + ' ' + object.text2" )

```javascript
    app.tree=[
        {
            text:"I'm a parent node",
            children: [{
                text:"I'm a child!"
            }]
        },
        {
            text:"I'm a sibling of the parent"
        }
    ];
```

### Optional attributes

Note:
* by "nesting level" we're referring to the nesting of a certain "leaf" in a tree. So a top level parent has nesting level 0, a child of that parent has nesting level 1, its child has nesting level 2, and so on.
* a "leaf" is an object in our tree. A "branch" is a conglomerate of a branch and it's children.

* `cui-tree-nest-0-class` (default: 'cui-tree--nesting-0') - class that wraps the whole tree, starting at level 0 nesting.
* `cui-tree-nest-x-class` (default: 'cui-tree--nested') - class that wraps each "branch" that has at least level 1 nesting.
* `cui-tree-leaf-wrapper`(default:'<div class="cui-tree__leaf"></div>') - html wrapper for each leaf in the tree
* `cui-tree-last-leaf-class` (default: 'cui-tree__leaf--last') - class to apply to a leaf it if its the last leaf on that branch
* `cui-tree-branch-wrapper` (default:'<div class="cui-tree__branch"></div>') - html wrapper for each branch
* `cui-tree-last-branch-class` (default: 'cui-tree__branch--last') - class to wrap the parent leaf and it's children if that leaf is the last leaf on that nesting level
* `cui-tree-nest-prefix` (default: 'cui-tree--nesting-) - class prefix to apply to every nesting level after level 0. (would be cui-tree--nesting-1, cui-tree--nesting-2, and so on)
* `cui-tree-leaf-click-callback` - callback function to a click on a leaf. This function is called with 3 params - the object on the leaf that got clicked, the leaf html element that got clicked (so we can manipulate classes) and the JS click event, in that order.


![cui-tree-example](https://github.com/thirdwavellc/cui-ng/blob/master/directives/cui-tree/cui-tree.png?raw=true)

## Change Log 5/17/2016

* Now using scope.$eval to parse the display value. No breaking changes.