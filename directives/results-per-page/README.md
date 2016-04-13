# Results Per Page Directive
Version 1.0

## Description
Results Per Page is an angular directive made to be used with CUI-Pagination.

## How to use

**Setup**

* You must have the `cui-ng` module injected as a dependency into your angular app.
* Inject $paginationProvider into your config or $pagination anywhere else.
* Set the options for your application:
	* If set in config: ```$paginationProvider.setPaginationOptions([10,25,50,100]);```
	* Anywhere else: ```$pagination.setPaginationOptions([10,25,50,100]);```

**Basic HTML Use**

```
<results-per-page ng-model="app.currentSelectedValue"></results-per-page>
```

* The scope variable set to ng-model will hold the current selected value.