angular.module('app')
.controller('passwordValidationCtrl', function($scope) {

	const passwordValidation = this

	passwordValidation.passwordPolicies = {}

    passwordValidation.passwordPolicies.disallowedWords = 'admin,password'
    passwordValidation.passwordPolicies.disallowedChars = '^%'
    passwordValidation.passwordPolicies.allowUpperChars = true
    passwordValidation.passwordPolicies.allowLowerChars = true
    passwordValidation.passwordPolicies.allowNumChars = true
    passwordValidation.passwordPolicies.allowSpecialChars = true
    passwordValidation.passwordPolicies.requiredNumberOfCharClasses = 2
    passwordValidation.passwordPolicies.min = 6,
    passwordValidation.passwordPolicies.max = 8,

    $scope.$watch('passwordValidation.passwordPolicies', function(newPolicies, oldPolicies) {
        if(newPolicies) passwordValidation.passwordPolicyObject = {
            allowUpperChars:newPolicies.allowUpperChars,
            allowLowerChars:newPolicies.allowLowerChars,
            allowNumChars:newPolicies.allowNumChars,
            allowSpecialChars:newPolicies.allowSpecialChars,
            requiredNumberOfCharClasses:newPolicies.requiredNumberOfCharClasses,
            disallowedChars:newPolicies.disallowedChars,
            min:newPolicies.min,
            max:newPolicies.max,
            disallowedWords:newPolicies.disallowedWords.split(',')
        }
    }, true)

})
