# Cui-Table

### Description

The `Cui-Table` can be helpful when building out generic CUI style tables that require sorting and pagination.

```
<cui-table cui-table-config="cuiTable.cuiTableOptions">
	<cui-table-header 
		headers="['cui-name', 'username', 'status']"
        sorting="cuiTable.sortBy"
        sorting-callbacks="cuiTable.sortingCallbacks"
      ></cui-table-header>
      <cui-table-row ng-repeat="user in cuiTable.userList | filter: cuiTable.userSearch">
        <div ng-include="'assets/app/directives-showcase/components/cui-table/partials/cui-table-row.html'"></div>
      </cui-table-row>
    </cui-table>
```


### Using Cui-Table

`Cui-Table` is composed of three components:

* Main `cui-table` wrapper
* `cui-table-header` which houses the header logic
* `cui-table-row` which you customize by building out your own partial markup (you can use ours as a base)


#### Cui-Table

This wraps `cui-table-header` and `cui-table-row` and takes in pagination options.

```
<cui-table cui-table-config="cuiTable.cuiTableOptions">
</cui-table>
```

You need to specify an object of table options to be able to utilize pagination with `Cui-Table`:

```
cuiTable.cuiTableOptions = {
	paginate: true,
	recordCount: 12,
	pageSize: 10,
	initialPage: 1,
	onPageChange: (page, pageSize) => {
	    updateStateParams({ page, pageSize })
	    populateUsers({ page, pageSize })
	}
}
```

* paginate: (optional) Set to true if you want to include pagination options with your table
* recordCount: (required with paginate) The total number of items in the table.
* pageSize: (required with paginate) The number of results to display per page. 
* initialPage: (required with paginate) The initial pagination page to show on load.
* onPageChange: (required with paginate) Callbacks to hit after a page change.

NOTE: Pagination will automatically be hidden if initially the `cuiTableOptions` recordCount is less than pageSize.


#### Cui-Table-Header

The header is where you are able to set the header column names, the sorting object, as well as a sorting callback.

```
<cui-table-header 
	headers="['cui-name', 'username', 'status']" 
	sorting="cuiTable.sortBy"
	sorting-callbacks="cuiTable.sortingCallbacks"
></cui-table-header>
```

* headers: (required) Array of strings that act as column titles. 
	* The headers will automatically position themselves to be responsive. 
	* Header names are also built to work with the cuiI18n translation library. The `cui-name` header is one of our keys
	that would automatically be translated on a language change. You can also use regular names if you wish.
* sorting: (optional) This is used in conjunction with `sorting-callbacks`.
	* Points to the scope object that is used to store the current sorting parameters.
	* This is required if you want to be able to sort the table by clicking on the headers.
* sorting-callbacks: (optional) This is used in conjunction with `sorting`.
	* Scope object that handles what kind of method to run on each header click.
	* The callbacks need to align with the header names to work properly.

```
cuiTable.sortingCallbacks = {
        name () {
            cuiTable.sortBy.sortBy = 'name'
            cuiTable.sort(['name.given', 'name.surname'], cuiTable.sortBy.sortType)
            updateStateParams()
        },
        username () {
            cuiTable.sortBy.sortBy = 'username'
            cuiTable.sort('username', cuiTable.sortBy.sortType)
            updateStateParams()
        },
        status () {
            cuiTable.sortBy.sortBy = 'status'
            cuiTable.sort('status', cuiTable.sortBy.sortType)
            updateStateParams()
        }
    }
```


#### Cui-Table-Row

The row wraps a partial that contains markup for a row that you run `ng-repeat` over. This is also where
you are able to attach other optional components such as a filter as shown in the demo.

```
<cui-table-row ng-repeat="user in cuiTable.userList | filter: cuiTable.userSearch">
	<div ng-include="'assets/app/directives-showcase/components/cui-table/partials/cui-table-row.html'"></div>
</cui-table-row>
```

```
<li class="cui-flex-table__tr cui-flex-table__tr--c">
  <!-- Avatar -->
  <div class="cui-flex-table__avatar-col">
    <div class="cui-profile__user-avatar" aria-hidden="true" 
      cui-avatar cui-avatar-names="[user.name.given, user.name.surname]" 
      cui-avatar-color-class-prefix="cui-avatar__color" 
      cui-avatar-color-count="5"
    ></div>
  </div>
  <div class="cui-flex-table__mobile-stack">
    <!-- Name -->
    <div class="cui-flex-table__left"><span class="cui-flex-table__title">{{user.name.given}} {{user.name.surname}}</span></div>
    <!-- Username -->
    <div class="cui-flex-table__middle"><span class="cui-mobile-only ">Username: &nbsp;</span>{{user.username}}</div>
    <!-- Status -->
    <div class="cui-flex-table__right" >
      <span ng-class="'cui-status--'+user.status.toLowerCase()">{{user.status}}</span>
    </div>
  </div>
</li>
```
