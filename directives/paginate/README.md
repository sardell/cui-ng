# paginate

Responsive pagination made easy.

## Basic usage

```html
    <paginate class="paginate" results-per-page="app.perPage" count="app.count" ng-model="app.page"></paginate>
```

## Optional attributes

* `on-page-change`: Callback for page change event (passes current page). Ex: `on-page-change="app.pageChangeHandler"`
* `page-class`: (default 'paginate__page') - Class to apply to each page indicator wrapper
* `active-page-class`: (default 'paginate__page--active') - Class to apply to the active page indicator wrapper
* `ellipses-class`: (default 'paginate__ellipses') - Class to apply to the ellipses wrapper
* `previous-class`: (default 'paginate__previous') - Class to apply to the 'previous' button wrapper
* `next-class`: (default 'paginate__next')  - Class to apply to the 'next' button wrapper
* `page-container-class`: (default 'paginate__page-container') - Class to apply to the page indicator container (wraps page indicators and ellipses)
* `ellipses-button`: (default '...') - Markup to apply to the ellipses button
* `previous-button`: (default '<') - Markup to apply to the previous button
* `next-button`: (default '>') - Markup to apply to the next button