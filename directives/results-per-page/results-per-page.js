angular.module('cui-ng')
.provider('$pagination', ['$injector',function($injector) {
	let paginationOptions;
	let userValue;

	this.setPaginationOptions = (valueArray) => {
		paginationOptions = valueArray;
	};

	this.getPaginationOptions = () => {
		return paginationOptions;
	};

	this.setUserValue = (value) => { // sets the user value so that other pages that use that directive will have that value saved
		try {
			const localStorageService = $injector.get('localStorageService');
			localStorageService.set('resultsPerPage',value);
		}
		catch (e){ }
		userValue = value;
	};

	this.getUserValue = () => {
		try {
			const localStorageService=$injector.get('localStorageService');
			userValue = localStorageService.get('resultsPerPage');
		}
		catch (e){ }
		return userValue;
	}

	this.$get = () => this;
}])
.directive('resultsPerPage', ['$compile','$pagination', ($compile,$pagination) => {
	return {
		restrict: 'E',
		scope: {
			selected: '=ngModel',
		},
		link: (scope, elem, attrs) => {
			const resultsPerPage = {
				initScope: () => {
					scope.options = $pagination.getPaginationOptions();
					scope.selected = $pagination.getUserValue() || scope.options[0];

					scope.$watch('selected', (selected) => {
						$pagination.setUserValue(selected);
						scope.selected = selected;
					});
				},
				config: {
					selectClass: attrs.class || 'cui-dropdown'
				},
				render: () => {
					const element = $compile(`<cui-dropdown class="${resultsPerPage.config.selectClass}" ng-model="selected" options="options"></cui-dropdown>`)(scope);
					angular.element(elem).replaceWith(element);
				}
			};
			resultsPerPage.initScope();
			resultsPerPage.render();
		}
	};
}]);
