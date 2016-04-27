angular.module('cui-ng')
.provider('$pagination', [function() {
	var paginationOptions;
	var userValue;

	this.setPaginationOptions = function(valueArray) {
		paginationOptions = valueArray;
	};

	this.getPaginationOptions = function() {
		return paginationOptions;
	};

	this.setUserValue = function(value) { // sets the user value so that other pages that use that directive will have that value saved
		userValue = value;
	};

	this.getUserValue = function() {
		return userValue;
	};

	this.$get = function() {
		return this;
	};
}])
.directive('resultsPerPage', ['$compile','$pagination', function($compile,$pagination) {
	return {
		restrict: 'E',
		scope: {
			selected: '=ngModel',
		},
		link: function(scope, elem, attrs) {
			var self;

			var resultsPerPage = {
				initScope: function() {
					self = this;
					scope.options = $pagination.getPaginationOptions();
					scope.selected = $pagination.getUserValue() || scope.options[0];

					scope.$watch('selected', function(selected) {
						$pagination.setUserValue(selected);
						scope.selected = selected;
					});
				},

				config: {
					selectClass: attrs.class || 'cui-dropdown'
				},

				render: function() {
					var element = $compile(
						String.prototype.concat(
							'<cui-dropdown class="', this.config.selectClass, '" ng-model="selected"',
								'options="options">',
							'</cui-dropdown>'
						)
					)(scope);
					angular.element(elem).replaceWith(element);
				}
			};
			resultsPerPage.initScope();
			resultsPerPage.render();
		}
	};
}]);
