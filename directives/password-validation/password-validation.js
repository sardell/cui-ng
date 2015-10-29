angular.module('cui-ng')
.directive('passwordValidation', [function(){		
	return {		
		require: 'ngModel',		
		scope: true,		
		restrict: 'A',		
		link: function(scope, element, attrs, ctrl){		
			ctrl.$validators.length = function(modelValue,viewValue){		
				if(/^.{8,20}$/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.lowercase = function(modelValue,viewValue){		
				if(/.*[a-z].*/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.uppercase = function(modelValue,viewValue){		
				if(/.*[A-Z].*/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.number = function(modelValue,viewValue){		
				if(/.*[0-9].*/.test(viewValue)){ return true; } else { return false; }		
			}		
			ctrl.$validators.complex = function(modelValue,viewValue){		
				if(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue)){ return true; } else { return false; }		
			}		
		}		
	};		
}]);