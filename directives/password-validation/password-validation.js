angular.module('cui-ng')
.factory('CuiPasswordInfo',[() => {
    let policies={};
    let info={};
    return { info, policies };
}])
.factory('CuiPasswordValidators',['CuiPasswordInfo',(CuiPasswordInfo) => {
    RegExp.escape = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const validators = (policies, id) => {
        CuiPasswordInfo.info[id] = {}; // Initialize the object that holds the info for this password validation (disallowedWords, disallowedChars)
        return {
            lowercase: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return /.*[a-z].*/.test(viewValue);
            },
            uppercase: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return /.*[A-Z].*/.test(viewValue);
            },
            number: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return /.*[0-9].*/.test(viewValue);
            },
            special: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return !(/^[a-z0-9]+$/i.test(viewValue));
            },
            complex: (modelValue,viewValue) => {
                if(!modelValue) return false;
                let numberOfUsedClasses=0;
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
                return numberOfUsedClasses >= policies.requiredNumberOfCharClasses;
            },
            lowercaseNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return !(/.*[a-z].*/.test(viewValue));
            },
            uppercaseNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return !(/.*[A-Z].*/.test(viewValue));
            },
            numberNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return !(/.*[0-9].*/.test(viewValue));
            },
            specialNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return /^[a-z0-9]+$/i.test(viewValue);
            },
            disallowedChars: (modelValue,viewValue) => {
                if(!viewValue) return true;
                var valid = true;
                var disallowedChars = [];
                policies.disallowedChars.split('').forEach((disallowedChar) => {
                    if(viewValue.indexOf(disallowedChar)> -1){
                        valid=false;
                        disallowedChars.push(disallowedChar);
                    }
                });
                CuiPasswordInfo.info[id].disallowedChars = disallowedChars.join(', ');
                return valid;
            },
            disallowedWords: (modelValue,viewValue) => {
                if(!viewValue) return true;
                let valid = true;
                let disallowedWords = [];
                policies.disallowedWords.forEach((word) => {
                    if(viewValue.toUpperCase().indexOf(word.toUpperCase())>-1){
                        valid=false;
                        disallowedWords.push(word);
                    }
                });
                CuiPasswordInfo.info[id].disallowedWords = disallowedWords.join(', ');
                return valid;
            },
            length: (modelValue,viewValue) => {
                if(!modelValue) return false;
                return (viewValue.length <= policies.max) && (viewValue.length >= policies.min);
            }
        };
    };

    const getValidators = (parsedPolicies,id) =>{
        let validator = {};
        const passwordValidators = Object.assign({}, validators(parsedPolicies,id));
        const trueFunction = () => true;

        CuiPasswordInfo.policies[id]=parsedPolicies;

        validator.complex = passwordValidators.complex;

        // if lower chars are not allowed add a check to see if there's a lowercase in the input
        if (parsedPolicies.allowLowerChars) {
            validator.lowercase = passwordValidators.lowercase;
            validator.lowercaseNotAllowed = trueFunction;
        }
        else {
            validator.lowercase = trueFunction;
            validator.lowercaseNotAllowed = passwordValidators.lowercaseNotAllowed;
        }

        if (parsedPolicies.allowUpperChars) {
            validator.uppercase = passwordValidators.uppercase;
            validator.uppercaseNotAllowed = trueFunction;
        }
        else {
            validator.uppercase = trueFunction;
            validator.uppercaseNotAllowed = passwordValidators.uppercaseNotAllowed;
        }

        if (parsedPolicies.allowNumChars){
            validator.number = passwordValidators.number;
            validator.numberNotAllowed = trueFunction;
        }
        else{
            validator.number = trueFunction;
            validator.numberNotAllowed = passwordValidators.numberNotAllowed;
        }

        if(parsedPolicies.allowSpecialChars){
            validator.special = passwordValidators.special;
            validator.specialNotAllowed = trueFunction;
        }
        else{
            validator.special = trueFunction;
            validator.specialNotAllowed = passwordValidators.specialNotAllowed;
        }

        if(parsedPolicies.disallowedChars){
            validator.disallowedChars = passwordValidators.disallowedChars;
        }

        if(parsedPolicies.disallowedWords){
            validator.disallowedWords = passwordValidators.disallowedWords;
        }

        if(parsedPolicies.min || parsedPolicies.max){
            validator.length = passwordValidators.length;
        }

        return validator;
    };

    return { getValidators };
}])
.factory('CuiPasswordPolicies', ['CuiPasswordValidators','CuiPasswordInfo', (CuiPasswordValidators,CuiPasswordInfo) => {
    const policy = {
        parse: (policies) => {
            let newParsedPolicies={};
            if(policies.length){ // if we received an array
                policies.forEach((policyRulesObject) => {
                    Object.keys(policyRulesObject).forEach((policyKey) => {
                        newParsedPolicies[policyKey] = policyRulesObject[policyKey];
                    });
                });
            }
            else newParsedPolicies = Object.assign({},policies);
            return newParsedPolicies;
        }
    };
    return policy;
}])
.directive('passwordValidation', ['CuiPasswordPolicies','CuiPasswordValidators',(CuiPasswordPolicies,CuiPasswordValidators) => {
    return {
        require: 'ngModel',
        scope: {
            passwordValidation:'='
        },
        restrict: 'A',
        link: (scope, elem, attrs, ctrl) => {
            let passwordValidationKey = scope.$id;
            ctrl.passwordValidationKey = passwordValidationKey;

            scope.$watch('passwordValidation', (newPasswordValidationRules) => {
                if(newPasswordValidationRules ) {
                    let parsedPolicies = CuiPasswordPolicies.parse(newPasswordValidationRules);
                    let validators = CuiPasswordValidators.getValidators(parsedPolicies,passwordValidationKey);
                    angular.forEach(validators, (checkFunction,validationName) => {
                      ctrl.$validators[validationName] = checkFunction;
                    });
                    ctrl.$validate();
                }
            });
        }
    };
}])
.directive('passwordPopover',['CuiPasswordInfo', (CuiPasswordInfo) => {
    return {
        restrict: 'A',
        link: (scope,elem,attrs) => {
            let passwordValidationKey = scope.$eval(attrs.ngMessages.replace('.$error','.passwordValidationKey')); // get the passwordValidationKey from the input it's applied to

            scope.$watchCollection(() => CuiPasswordInfo.info[passwordValidationKey], (newPasswordInfo) => {
                if(newPasswordInfo){
                    Object.keys(newPasswordInfo).forEach(key => {
                        scope[key]=newPasswordInfo[key];
                    });
                }
            });

            scope.$watchCollection(() => CuiPasswordInfo.policies[passwordValidationKey], (newPasswordPolicies) => {
                if(newPasswordPolicies) scope.policies = Object.assign({},newPasswordPolicies);
            });

            scope.$watchCollection(() => scope.$eval(attrs.ngMessages), (newErrorObject) => {
                if(newErrorObject) scope.errors = Object.assign({},newErrorObject);
            });
        }
    };
}]);