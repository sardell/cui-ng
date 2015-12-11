#cui-icon

[Extracted from here](https://github.com/angular/material/tree/master/src/components/icon/js). 
[Documented here](https://material.angularjs.org/1.0.0-rc7/api/directive/mdIcon).
[Demo here](https://material.angularjs.org/1.0.0-rc7/demo/icon).

The `cui-icon` directive makes it easier to use vector-based icons in your app (as opposed to raster-based icons types like PNG). The directive supports both icon fonts and SVG icons.

All styling (color, size, etc) can be done as expected, via css. 

Icons should be considered view-only elements that should not be used directly as buttons; instead nest a <cui-icon> inside a button to add hover and click features.

### Simple directive usage
When using SVGs:
```html
<!-- Icon ID using icon set prefix; icons are pre-registered using $cuiIconProvider -->
<cui-icon cui-svg-icon="iot:template" class="medium-icon"></cui-icon>
<cui-icon cui-svg-icon="action:build" class="medium-icon"></cui-icon>
<cui-icon cui-svg-icon="fa:fa-list" class="medium-icon"></cui-icon>
<button class="medium-button">
    <cui-icon cui-svg-icon="fa:fa-list" class="medium-icon"></cui-icon>
</button>
```


### Simple provider usage
Use the $cuiIconProvider to configure your application with svg iconsets (see the 'sample icon files' folder for iconset examples).
```js
// Include module...
angular.module('app', ['cuiIcons'])

// Load desires svg iconsets... 
.config(['$cuiIconProvider', function($cuiIconProvider) {
    $cuiIconProvider
        .iconSet('action', 'assets/images/icons/material-design/action-icons.svg', 24)
        .iconSet('fa', 'assets/images/icons/fontawesome/sprites.svg', 1792)
        .iconSet('iot', 'assets/images/icons/covisint/iot.svg', 1024, true)
}])

// Pre-fetch icons sources by URL and cache in the $templateCache...
.run(function($http, $templateCache) {
    var urls = [
        'assets/images/icons/covisint/iot.svg',
        'assets/images/icons/fontawesome/sprites.svg',
        'assets/images/icons/material-design/action-icons.svg'
    ];
    // ...subsequent $http calls will look there first.
    angular.forEach(urls, function(url) {
        $http.get(url, {
            cache: $templateCache
        });
    });
})
```

### All the features
All directive features documented [here](https://material.angularjs.org/1.0.0-rc7/api/directive/mdIcon) and [here](https://material.angularjs.org/1.0.0-rc7/api/service/$mdIcon), and the provider features documented [here](https://material.angularjs.org/1.0.0-rc7/api/service/$mdIconProvider) are supported.
