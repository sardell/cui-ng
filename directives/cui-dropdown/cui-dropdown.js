angular.module('cui-ng')
.directive('cuiDropdown', ['$compile','$timeout', function($compile,$timeout) {
	'use strict';

	return {
		restrict: 'E',

		scope: {
		},

		link: function(scope, elem, attrs) {
			var self;

			var cuiDropdown = {
				initScope: function() {
					self = this;
				},

				config: {
					// Render Input
					inputClass: attrs.class || 'cui-input',
					inputId: attrs.id,
					// Render Dropdown
					dropdownWrapperClass: attrs.class || 'cui-styleguide__popover-container',
					target: attrs.target,
					attachment: attrs.attachment || 'top middle',
					targetAttachment: attrs.targetAttachment || 'bottom middle',
					offset: attrs.offset || '-10px 0',
					dropdownClass: attrs.class || 'cui-popover'
				},

				selectors: {
					$cuiDropdown: angular.element(elem)
				},

				render: {
					input: function() {
						var element = $compile(
							String.prototype.concat(
								'<input class="', self.config.inputClass, '" id="',self.config.inputId ,'" />'
							)
						)(scope);
						self.selectors.$cuiDropdown.replaceWith(element);
						self.selectors.$cuiInput = element; // Caches selector
					},

					dropdown: function() {
						var element = $compile(
							String.prototype.concat(
								'<div class="', self.config.dropdownWrapperClass, '"',
								'tether target="', self.config.target, '" attachment="', self.config.attachment, '"', 
								'target-attachment="', self.config.targetAttachment, '" offset="', self.config.offset,'">',
									'<div class="', self.config.dropdownClass, '">',
										'<p>TEST</p>',
									'</div>',
								'</div>'
							)
						)(scope);
						$(document.body).append(element);
					}
				}
			};
			cuiDropdown.initScope();
			cuiDropdown.render.input();
			cuiDropdown.render.dropdown();
		}
	};

}]);
