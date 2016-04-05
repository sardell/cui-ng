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
			selected: '=',
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
					wrapperClass: attrs.wrapperClass || 'cui-select-wrapper',
					selectClass: attrs.selectClass || 'cui-select',
				},

				render: function() {
					var element = $compile(
						String.prototype.concat(
							'<div class="', this.config.wrapperClass, '">',
								'<select class="', this.config.selectClass, '" ng-model="selected"',
									'ng-options="option as option for option in options">',
								'</select>',
							'</div>')
					)(scope);
					angular.element(elem).replaceWith(element);
				}
			};
			resultsPerPage.initScope();
			resultsPerPage.render();
		}
	};
}]);
