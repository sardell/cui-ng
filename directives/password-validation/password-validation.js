angular.module('cui-ng')
.factory('CuiPasswordInfo',[function(){
    var info={};
    return info;
}])
.factory('CuiPasswordValidators',['CuiPasswordInfo',function(CuiPasswordInfo){
    RegExp.escape = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    var policies={};
    var complex=function(modelValue,viewValue){
        if(!modelValue) return false;
        var numberOfUsedClasses=0;
        if(policies.allowLowerChars){
            if (/.*[a-z].*/.test(viewValue)) numberOfUsedClasses++;
        }
        if(policies.allowUpperChars){
            if (/.*[A-Z].*/.test(viewValue)) numberOfUsedClasses++;
        }
        if(policies.allowSpecialChars){
            if (!(/^[a-z0-9]+$/i.test(viewValue))) numberOfUsedClasses++;
        }
        if(policies.allowNumChars){
            if (/.*[0-9].*/.test(viewValue)) numberOfUsedClasses++;
        }
        return numberOfUsedClasses>=policies.requiredNumberOfCharClasses;
    };
    var validators={
        setPolicies: function(newPolicies){
            policies=newPolicies;
        },
        lowercase: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return /.*[a-z].*/.test(viewValue);
        },
        uppercase: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return /.*[A-Z].*/.test(viewValue);
        },
        number: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return /.*[0-9].*/.test(viewValue);
        },
        special: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return !(/^[a-z0-9]+$/i.test(viewValue));
        },
        complex: complex,
        lowercaseNotAllowed: function(modelValue,viewValue){
            if(!viewValue) return true;
            return !(/.*[a-z].*/.test(viewValue));
        },
        uppercaseNotAllowed: function(modelValue,viewValue){
            if(!viewValue) return true;
            return !(/.*[A-Z].*/.test(viewValue));
        },
        numberNotAllowed: function(modelValue,viewValue){
            if(!viewValue) return true;
            return !(/.*[0-9].*/.test(viewValue));
        },
        specialNotAllowed: function(modelValue,viewValue){
            if(!viewValue) return true;
            return /^[a-z0-9]+$/i.test(viewValue);
        },
        disallowedChars: function(modelValue,viewValue){
            if(!viewValue) return true;
            var valid=true;
            var disallowedChars=[];
            policies.disallowedChars.split('').forEach(function(disallowedChar){
                if(viewValue.indexOf(disallowedChar)>-1){
                    if(valid) valid=false;
                    disallowedChars.push(disallowedChar);
                }
            });
            CuiPasswordInfo.disallowedChars=disallowedChars.join(', ');
            return valid;
        },
        disallowedWords: function(modelValue,viewValue){
            // var regExpString='';
            if(!viewValue) return true;
            var valid=true;
            var disallowedWords=[];
            policies.disallowedWords.forEach(function(word){
                if(viewValue.toUpperCase().indexOf(word.toUpperCase())>-1){
                    if(valid) valid=false;
                    disallowedWords.push(word);
                }
            });
            CuiPasswordInfo.disallowedWords=disallowedWords.join(', ');
            return valid;
        },
        length: function(modelValue,viewValue){
            if(!modelValue) return false;
            return ((viewValue.length<=policies.max) && (viewValue.length>=policies.min));
        }
    };
    return validators;
}])
.factory('CuiPasswordPolicies',['CuiPasswordValidators','CuiPasswordInfo',function(CuiPasswordValidators,CuiPasswordInfo){
    var policies;
    var parsedPolicies={};
    var policy={
        set: function(policies){
            policies=policies;
            this.parse(policies);
        },
        get: function(){
            return parsedPolicies;
        },
        parse: function(policies){
            if(policies.length){ // if we received an array
                policies.forEach(function(policyRulesObject){
                    Object.keys(policyRulesObject).forEach(function(policyKey){
                        parsedPolicies[policyKey]=policyRulesObject[policyKey];
                    });
                });
            }
            else angular.copy(policies,parsedPolicies);
            CuiPasswordInfo.policies=parsedPolicies;
        },
        getValidators: function(){
            var validators={};
            validators.complex=CuiPasswordValidators.complex;

            // if lower chars are not allowed add a check to see if there's a lowercase in the input
            if (parsedPolicies.allowLowerChars) {
                validators.lowercase=CuiPasswordValidators.lowercase;
                validators.lowercaseNotAllowed=function(){ return true ;};
            }
            else {
                validators.lowercase=function() { return true ;};
                validators.lowercaseNotAllowed=CuiPasswordValidators.lowercaseNotAllowed;
            }

            if (parsedPolicies.allowUpperChars) {
                validators.uppercase=CuiPasswordValidators.uppercase;
                validators.uppercaseNotAllowed=function(){ return true ;};
            }
            else {
                validators.uppercase=function(){ return true ;};
                validators.uppercaseNotAllowed=CuiPasswordValidators.uppercaseNotAllowed;
            }

            if (parsedPolicies.allowNumChars){
                validators.number=CuiPasswordValidators.number;
                validators.numberNotAllowed=function(){ return true ;};
            }
            else{
                validators.number=function(){ return true ;};
                validators.numberNotAllowed=CuiPasswordValidators.numberNotAllowed;
            }

            if(parsedPolicies.allowSpecialChars){
                validators.special=CuiPasswordValidators.special;
                validators.specialNotAllowed=function(){ return true ;};
            }
            else{
                validators.special=function(){ return true ;};
                validators.specialNotAllowed=CuiPasswordValidators.specialNotAllowed;
            }

            if(parsedPolicies.disallowedChars){
                validators.disallowedChars=CuiPasswordValidators.disallowedChars;
            }

            if(parsedPolicies.disallowedWords){
                validators.disallowedWords=CuiPasswordValidators.disallowedWords;
            }

            if(parsedPolicies.min || parsedPolicies.max){
                validators.length=CuiPasswordValidators.length;
            }

            return validators;
        }
    };
    return policy;
}])
.directive('passwordValidation', ['CuiPasswordPolicies','CuiPasswordValidators','CuiPasswordInfo','$rootScope',function(CuiPasswordPolicies,CuiPasswordValidators,CuiPasswordInfo,$rootScope){
    return {
        require: 'ngModel',
        scope: {},
        restrict: 'A',
        link: function(scope, elem, attrs, ctrl){
            function getCurrentPasswordPolicies(){ return CuiPasswordInfo.policies };

            scope.$watch(getCurrentPasswordPolicies,function(newPasswordValidationRules){
                if(newPasswordValidationRules) {
                    CuiPasswordValidators.setPolicies(newPasswordValidationRules);
                    angular.forEach(CuiPasswordPolicies.getValidators(),function(checkFunction,validationName){
                      ctrl.$validators[validationName]=checkFunction;
                    });
                    ctrl.$validate();
                    CuiPasswordInfo.errors=ctrl.$error;
                }
            },function(newObj,oldObj){
                return Object.keys(newObj).length!==Object.keys(oldObj).length;
            });
        }
    };
}])
.directive('passwordPopover',['CuiPasswordInfo',function(CuiPasswordInfo){
    return {
        scope:true,
        restrict: 'A',
        link:function(scope,elem,attrs){
            function getCurrentPasswordInfo(){ return CuiPasswordInfo };

            scope.$watch(getCurrentPasswordInfo,function(newPasswordInfo){
                if(newPasswordInfo){
                    Object.keys(newPasswordInfo).forEach(function(key){
                        scope[key]=newPasswordInfo[key];
                    });
                }
            },function(newObj,oldObj){
                return !angular.equals(newObj,oldObj);
            });
        }
    };
}]);