# CUI popover
Version 1.0


### Description
Cui-popover lets your create responsive popovers easily, with the help of the tether.js library.

### Usage Example
#### Markup
```html
    <span id="test" ng-click="directives.popoverOpen=!directives.popoverOpen">This is the target attachment!</span>

    <div cui-popover target="#test" pointer-height="13" pointer-width="10"
    popover-positions="[{position:'top', popoverOffset:'10px 0', contentOffset:'0'},'any']"
    ng-if="directives.popoverOpen" style="display:inline-block;">
        This is the element that's attached
    </div>
```

### Attributes
* `target` (required) : Css selector for the target , ex: `target="#id-of-target"`. This is the only required attribute.
* `popover-positions` (required) : an array of position objects or key strings. This is where most of this directive's functionality comes to play, extending the default tether behaviors and improving them where possible.

Inside of this array you will define the fallbacks for positioning, in order of preference. Fallbacks can be one of the following:
    * An object with a `position` property, where `position` is 'left','right','top' or 'bottom'; In this object you can also specify `contentOffset` and `popoverOffset` (more about that below). If you choose not to pass those properties to the object, the offsets will be inherited from the values set in the `popover-offset` and `content-offset` attributes. If those aren't set, they will default to 0.
    * The string `'any'`; This tells the popover directive: "show the popover wherever you can, following the content-offset and popover-offset rules set in the attributes, or 0 offset if those aren't set".
    * The string `'inverted'`; Use this only if you set an object with a `position` in the array, before this string. This "inverted" position will be perfectly symmetric to the position before it, relatively to the target element.
    * The string `'hide'`; This will hide the popover if none of the positions before it were able to fit on screen. Use this only in the last position of the array.

* `popover-offset` (optional - default is '0 0', can be 'px' or '%') : Offset (vertical horizontal) of the popover and pointer. If the positioning is vertical (top or bottom) and the offset is a percentage then the horizontal offset will be based on the target's width and the vertical offset based on the height of the popover element + the height of the pointer. Everything is reversed for horizontal positioning (horizontal offset is based on the element's width and vertical offset is based on the element's height).
* `content-offset` (optional - default is '0', can be 'px' or '%') : Offset between the pointer (which stays in the point based on popover-offset) and the actual content box that the directive was applied to. It will automatically be veritcal or horizontal based on which position (horizontal offset for vertical positionings, vertical offset otherwise). If it's a '%' then it always be based on the width of the content box (to avoid scenarios where the arrow and the box don't meet try to avoid using a content-offset greater than ~45%).

NOTE: `popover-offset` and `content-offset` will only be applied to positions for which you don't specify a `popoverOffset` or a `contentOffset`, respectively.

* `pointer-height` (optional - default is 14) : Height in pixels of the pointer. Note that when in horizontal positionings this will be the "width" of the pointer element.
* `pointer-width` (optional - default is 9) : Width in pixels of the pointer. Note that when in vertical positionings this will be the "height" of the pointer element.

### Known issues
* If you use it on a div make sure to make its `display` be `inline-block` or the offset will be miscalculated.


## Change Log 4/27/2016

* Major rework. The new way of setting a position array is much more intuitive and functional than the previous implementation, giving the developer an infinite amount of positioning possibilities.

## Change Log 5/3/2016

* Cui-popover now listens for changes to the element's inner html. This ensures that even if the popover is outside of controller's scope it will always be up to date.