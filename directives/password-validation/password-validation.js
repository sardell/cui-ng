angular.module('cui-ng')
.directive('passwordValidation', [function(){		
	return {		
		require: 'ngModel',		
		scope: true,		
		restrict: 'A',		
		link: function(scope, element, attrs, ctrl){
		    var policies=JSON.parse('[' + attrs.passwordValidation + ']')[0];
		    var parsedPolicies={};
		    for(var i=0;i<policies.length;i++){
		    	var keys=Object.keys(policies[i]);
		    	if(keys.indexOf('allowUpperChars')>-1){
		    		parsedPolicies.classes=policies[i];
		    	}
		    	if(keys.indexOf('disallowedChars')>-1){
		    		parsedPolicies.disallowed=policies[i];
		    	}
		    	if(keys.indexOf('min')>-1){
		    		parsedPolicies.count=policies[i];
		    	}
		    }

			// if lowercases are allowed and there is at least one
			ctrl.$validators.lowercase = function(modelValue,viewValue){
				if(parsedPolicies.classes.allowLowerChars) return (/.*[a-z].*/.test(viewValue));
				return true;
			};

			// if lowercases are not allowed make sure there is none
			ctrl.$validators.lowercaseNotAllowed = function(modelValue,viewValue){
				if(!parsedPolicies.classes.allowLowerChars) return !(/.*[a-z].*/.test(viewValue));
				return true;
			};

			// if uppercases are allowed and there is at least one
			ctrl.$validators.uppercase = function(modelValue,viewValue){
				if(parsedPolicies.classes.allowUpperChars) return (/.*[A-Z].*/.test(viewValue));
				return true;
			};

			// if uppercases are not allowed make sure there is none
			ctrl.$validators.uppercaseNotAllowed = function(modelValue,viewValue){
				if(!parsedPolicies.classes.allowUpperChars) return !(/.*[A-Z].*/.test(viewValue));
				return true;
			};

			// if numbers are allowed and there is at least one
			ctrl.$validators.number = function(modelValue,viewValue){
				if(parsedPolicies.classes.allowNumChars) return (/.*[0-9].*/.test(viewValue));
				return true;
			};

			// if numbers are not allowed make sure there is none
			ctrl.$validators.numberNotAllowed = function(modelValue,viewValue){
				if(!parsedPolicies.classes.allowNumChars) return !(/.*[0-9].*/.test(viewValue));
				return true;
			};

			// if special chars are allowed and there is at least one
			ctrl.$validators.special = function(modelValue,viewValue){
				return (/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue) && parsedPolicies.classes.allowSpecialChars);
			};

			// if special chars are not allowed make sure there is none
			ctrl.$validators.specialNotAllowed = function(modelValue,viewValue){
				if(!parsedPolicies.classes.allowSpecialChars) return !(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue));
				return true;
			};

			// make sure the number of required classes is met
			ctrl.$validators.complex = function(modelValue,viewValue){
				var numberOfUsedClasses=0;
				if(parsedPolicies.classes.allowLowerChars){
					ctrl.$validators.lowercase(modelValue,viewValue) ? numberOfUsedClasses++ : true;
				}
				if(parsedPolicies.classes.allowUpperChars){
					ctrl.$validators.uppercase(modelValue,viewValue) ? numberOfUsedClasses++ : true;
				}
				if(parsedPolicies.classes.allowSpecialChars){
					ctrl.$validators.special(modelValue,viewValue) ? numberOfUsedClasses++ : true;
				}
				if(parsedPolicies.classes.allowNumChars){
					ctrl.$validators.number(modelValue,viewValue) ? numberOfUsedClasses++ : true;
				}
				return (numberOfUsedClasses>=parsedPolicies.classes.requiredNumberOfCharClasses);
			};

			// make sure the password meets the length requirements
			ctrl.$validators.length = function(modelValue,viewValue){
				return ((viewValue.length<=parsedPolicies.count.max) && (viewValue.length>=parsedPolicies.count.min));
			};

			// make sure there's no disallowed chars
			ctrl.$validators.disallowedChars = function(modelValue,viewValue){
				var regExp=new RegExp('['+RegExp.escape(parsedPolicies.disallowed.disallowedChars)+']','g');
				return !regExp.test(viewValue);
			}

			RegExp.escape = function(text) {
			  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			};
		}		
	};		
}]);