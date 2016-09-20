# paginate

Responsive pagination made easy.

## Basic usage

```html
    <paginate class="paginate" results-per-page="app.perPage" count="app.count" ng-model="app.page"></paginate>
```

## Optional attributes

* `attach-renderer-to`: Pass this a scope variable and the directive will attach a re-render pagination function to it. Call that function every time the count changes!
* `on-page-change`: Callback for page change event (passes current page). Ex: `on-page-change="app.pageChangeHandler"` NOTE: I HIGHLY RECOMMEND THIS OVER A $WATCH
* `page-class`: (default 'paginate__page') - Class to apply to each page indicator wrapper
* `active-page-class`: (default 'paginate__page--active') - Class to apply to the active page indicator wrapper
* `ellipses-class`: (default 'paginate__ellipses') - Class to apply to the ellipses wrapper
* `previous-class`: (default 'paginate__previous') - Class to apply to the 'previous' button wrapper
* `next-class`: (default 'paginate__next')  - Class to apply to the 'next' button wrapper
* `page-container-class`: (default 'paginate__page-container') - Class to apply to the page indicator container (wraps page indicators and ellipses)
* `ellipses-button`: (default '...') - Markup to apply to the ellipses button
* `previous-button`: (default '<') - Markup to apply to the previous button
* `next-button`: (default '>') - Markup to apply to the next button

## Change Log 9/20/2016

* Removes the default unicode characters (`<` and `>`) in favor of background images.

## Change Log 5/6/2016

* Listening to the count was raising issues because most of the time the count changes it's a side effect from re-doing some API call, which in turn would potentially cause the page change callback to fire. This directive will no longer listen to count changes after first rendering. You will have to use the `attach-rerender-to` attribute and call that function every time the count changes.
