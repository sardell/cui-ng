describe('Password-validation',function(){
    var $compile,
        $rootScope,
        $timeout;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_,_$timeout_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $timeout= _$timeout_;
        spyOn($rootScope, '$broadcast');
    }));

    it('parses a password policies array',inject(function(Policy){
        var policies=[
            {
                'allowUpperChars':true,
                'allowLowerChars':true,
                'allowNumChars':true,
                'allowSpecialChars':true,
                'requiredNumberOfCharClasses':3
            },
            {
                'disallowedChars':'^&*)(#$'
            },
            {
                'min':8,
                'max':18
            },
            {
                'disallowedWords':['password','admin']
            }
        ];
        parsedPolicies=Policy.parse(JSON.stringify(policies));
        expect(parsedPolicies.disallowed.disallowedChars).toBe('^&*)(#$');
    }));

    it('returns validators, based on the parsed policies',inject(function(Policy){
        var policies=[
            {
                'allowUpperChars':true,
                'allowLowerChars':true,
                'allowNumChars':true,
                'allowSpecialChars':true,
                'requiredNumberOfCharClasses':3
            },
            {
                'disallowedChars':'^&*)(#$'
            },
            {
                'min':8,
                'max':18
            },
            {
                'disallowedWords':['password','admin']
            }
        ];
        Policy.parse(JSON.stringify(policies));
        expect(Object.keys(Policy.getValidators())).toEqual(["complex","lowercase","lowercaseNotAllowed","uppercase","uppercaseNotAllowed","number","numberNotAllowed","special","specialNotAllowed","disallowedChars","disallowedWords","length"]);
    }));

});

