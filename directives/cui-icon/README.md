# Cui-icon

### Description
The cui-icon directive and $cuiIcon provider work together to facilitate the inclusion of svg sprites.

### How to use
First, if you want to set a namespace for the icons so that later in your templates you can reference them by `namespace:id` you can do this in your config

```javascript
    angular.module('myApp')
    .config(['$cuiIconProvider',function($cuiIconProvider){
        $cuiIconProvider.iconSet('cui','bower_components/cui-icons/dist/icons/icons-out.svg','0 0 48 48');
    }]);
```

The syntax here is `$cuiIconProvider.iconSet(namespace,path,viewbox attribute)`
Note: the viewbox attribute can be overwritten by the cui-icon directive later, but if most of the svgs in this sprite share the same viewBox we highly recommend setting it here.

Then, if you want to cache those icons, in your run block you can do this

```javascript
    angular.module('myApp')
    .run(['$cuiIcon','$templateCache',`$http`,function($cuiIcon,$templateCache,$http){
        angular.forEach($cuiIcon.getIconSets(),function(iconSettings,namespace){
            $http.get(iconSettings.path,{
                cache: $templateCache
            });
        });
    }]);
```

Finally, in your html use like so

```html
    <cui-icon cui-svg-icon="cui:user"></cui-icon>
```

This will compile to the following markup, given our previous configuration

```html
    <cui-icon cui-svg-icon="cui:user"></cui-icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <use xlink:href="bower_components/cui-icons/dist/icons/icons-out.svg#user"></use>
        </svg>
    </cui-icon>
```

You can also just set your path directly in cui-icon, if you're not using sprites or just don't want to set your config

```html
    <cui-icon cui-svg-icon="bower_components/cui-icons/dist/icons/icons-out.svg#user"></cui-icon>
```

### Optional attributes

`svg-class` whatever you set on this attribute will apply as a `class` attribute on the `svg` element.
`viewBox` this will override the viewBox property set in your config.
`preserveAspectRatio` will apply as `preserveAspectRatio` on the `svg` element.