# CUI popover
Version 1.0


### Description
Cui-popover lets your create responsive popovers easily, with the help of the tether.js library.

### Usage Example
#### Markup
```html
    <span id="test" ng-click="directives.popoverOpen=!directives.popoverOpen">This is the target attachment!</span>

    <div cui-popover target="#test" popover-position="right" popover-offset="0 10px" content-offset="0%" pointer-height="13" pointer-width="10" allowed-reposition="any" hide-popover-if-oob="false"
    ng-if="directives.popoverOpen" style="display:inline-block;">
        This is the element that's attached
    </div>
```

### Attributes
* `target` (required) : Css selector for the target , ex: `target="#id-of-target"`. This is the only required attribute.
* `popover-position` (optional - default is 'bottom') : Position relative to the target where the popover is supposed to attach to. Can be 'top', 'bottom', 'left' or 'right'.
* `popover-offset` (optional - default is '0 0', can be 'px' or '%') : Offset (vertical horizontal) of the popover and pointer. If the positioning is vertical (top or bottom) and the offset is a percentage then the horizontal offset will be based on the target's width and the vertical offset based on the height of the popover element + the height of the pointer. Everything is reversed for horizontal positioning (horizontal offset is based on the element's width and vertical offset is based on the element's height)
* `content-offset` (optional - default is '0', can be 'px' or '%') : Offset between the pointer (which stays in the point based on popover-offset) and the actual content box that the directive was applied to. It will automatically be veritcal or horizontal based on which position (horizontal offset for vertical positionings, vertical offset otherwise). If it's a '%' then it always be based on the width of the content box (to avoid scenarios where the arrow and the box don't meet try to avoid using a content-offset greater than ~45%).
* `hide-popover-if-oob` (optional - default is `false`, can be `true` or `false`) : Hides the popover if it goes out of bounds rather than trying to reposition it.
* `allowed-reposition` (optional - default is 'any', can be 'any', 'opposite' or 'none') : One of the key features of this directive.
Default tether behavior will invert the positioning of the element (right if position was set to left and there's no room to show on the left side), but what if there's no room on the right side either?
If the `allowed-reposition` is set to 'any' or not passed then the popover will try to show on the bottom or top.
'opposite' will only allow inverting the positioning (`left -> right` , `right -> left` or `top -> bottom`, `bottom -> top`).
'none' will ensure your tethered element never changes its position.
* `pointer-height` (optional - default is 14) : Height in pixels of the pointer. Note that when in horizontal positionings this will be the "width" of the pointer element.
* `pointer-width` (optional - default is 9) : Width in pixels of the pointer. Note that when in vertical positionings this will be the "height" of the pointer element.


### Known issues
* Sometimes when the element goes out of bounds on both the position that it's in and the inverse of that position it will blink for a split second before rotating the positioning 90deg. This is due to tether's constraints firing faster than the angular watch function.
* If you use it on a div make sure to make its `display` be `inline-block` or the offset will be miscalculated.