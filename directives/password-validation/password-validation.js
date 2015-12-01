angular.module('cui-ng')
.factory('Validators',[function(){
	RegExp.escape = function(text) {
	  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	var policies={};
	var complex=function(modelValue,viewValue){
		var classes=policies.classes,
		numberOfUsedClasses=0;
		if(classes.allowLowerChars){
			/.*[a-z].*/.test(viewValue) ? numberOfUsedClasses++ : true;
		}
		if(classes.allowUpperChars){
			/.*[A-Z].*/.test(viewValue) ? numberOfUsedClasses++ : true;
		}
		if(classes.allowSpecialChars){
			/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue) ? numberOfUsedClasses++ : true;
		}
		if(classes.allowNumChars){
			/.*[0-9].*/.test(viewValue) ? numberOfUsedClasses++ : true;
		}
		return numberOfUsedClasses>=policies.classes.requiredNumberOfCharClasses;
	};
	var validators={
		setPolicies: function(newPolicies){
			policies=newPolicies;
		},
		lowercase: function(modelValue,viewValue){
			if(complex(modelValue,viewValue)) return true;
			return /.*[a-z].*/.test(viewValue);
		},
		uppercase: function(modelValue,viewValue){
			if(complex(modelValue,viewValue)) return true;
			return /.*[A-Z].*/.test(viewValue);
		},
		number: function(modelValue,viewValue){
			if(complex(modelValue,viewValue)) return true;
			return /.*[0-9].*/.test(viewValue);
		},
		special: function(modelValue,viewValue){
			if(complex(modelValue,viewValue)) return true;
			return /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue);
		},
		complex: complex,
		lowercaseNotAllowed: function(modelValue,viewValue){
			return !(/.*[a-z].*/.test(viewValue));
		},
		uppercaseNotAllowed: function(modelValue,viewValue){
			return !(/.*[A-Z].*/.test(viewValue));
		},
		numberNotAllowed: function(modelValue,viewValue){
			return !(/.*[0-9].*/.test(viewValue));
		},
		specialNotAllowed: function(modelValue,viewValue){
			return !(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(viewValue));
		},
		numberNotAllowed: function(modelValue,viewValue){
			return !(/.*[0-9].*/.test(viewValue));
		},
		disallowedChars: function(modelValue,viewValue){
			var regExp=new RegExp('['+RegExp.escape(policies.disallowed.disallowedChars)+']','g');
			return !regExp.test(viewValue);
		},
		disallowedWords: function(modelValue,viewValue){
			var regExpString='';
			var numberOfWords=policies.disallowedWords.disallowedWords.length;
			for(var i=0;i<numberOfWords;i++){
				if(i<(numberOfWords-1))regExpString+=policies.disallowedWords.disallowedWords[i]+'|';
				else regExpString+=policies.disallowedWords.disallowedWords[i];
			}
			var regExp=new RegExp(regExpString,'g');
			return !regExp.test(viewValue);
		},
		length: function(modelValue,viewValue){
			return ((viewValue.length<=policies.count.max) && (viewValue.length>=policies.count.min));
		}
	};
	return validators;
}])
.factory('Policy',['Validators',function(Validators){
	var policies;
	var parsedPolicies={};
	var policy={
		set: function(policiesString){
			policies=policiesString;
			this.parse(policies);
		},
		get: function(){
			return parsedPolicies;
		},
		parse: function(policiesString){
			// needs to parse the array out of the string passed
			var policies=JSON.parse('[' + policiesString + ']')[0];
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
		    	if(keys.indexOf('disallowedWords')>-1){
		    		parsedPolicies.disallowedWords=policies[i];
		    	}
		    };
		    return parsedPolicies;
		},
		getValidators: function(){
			var validators={};
			validators['complex']=Validators.complex;

			// if lower chars are not allowed add a check to see if there's a lowercase in the input
			parsedPolicies.classes.allowLowerChars ? ( validators['lowercase']=Validators.lowercase, validators['lowercaseNotAllowed']=function(){ return true ;} ):
				( validators['lowercase']=function(){ return true ;}, validators['lowercaseNotAllowed']=Validators.lowercaseNotAllowed );

			parsedPolicies.classes.allowUpperChars ? ( validators['uppercase']=Validators.uppercase, validators['uppercaseNotAllowed']=function(){ return true ;} ):
				( validators['uppercase']=function(){ return true ;}, validators['uppercaseNotAllowed']=Validators.uppercaseNotAllowed );

			parsedPolicies.classes.allowNumChars ? ( validators['number']=Validators.number,validators['numberNotAllowed']=function(){ return true ;} ):
				( validators['number']=function(){ return true ;}, validators['numberNotAllowed']=Validators.numberNotAllowed );

			parsedPolicies.classes.allowSpecialChars ? ( validators['special']=Validators.special, validators['specialNotAllowed']=function(){ return true ;} ):
				( validators['special']=function(){ return true ;}, validators['specialNotAllowed']=Validators.specialNotAllowed );

			validators['disallowedChars']=Validators.disallowedChars;
			validators['disallowedWords']=Validators.disallowedWords;
			validators['length']=Validators.length;

			return validators;
		}
	};

	return policy;
}])
.directive('passwordValidation', ['Policy','Validators',function(Policy,Validators){
	return {		
		require: 'ngModel',
		scope: true,	
		restrict: 'A',
		link: function(scope, element, attrs, ctrl){
		    Policy.set(attrs.passwordValidation);
		    Validators.setPolicies(Policy.get());
		    ctrl.$validators=Policy.getValidators();
		}		
	};		
}]);