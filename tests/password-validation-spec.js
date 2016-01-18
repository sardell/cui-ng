describe('Password-validation',function(){
    var $compile,
        $rootScope,
        $timeout,
        policies=[
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
        ],
        policies2=[
            {
                'allowUpperChars':false,
                'allowLowerChars':false,
                'allowNumChars':false,
                'allowSpecialChars':false,
                'requiredNumberOfCharClasses':0
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
        ],
        form,form2;

    beforeEach(module('cui-ng'));


    beforeEach(inject(function(_$compile_,_$rootScope_,_$timeout_) {
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $timeout= _$timeout_;
        $rootScope.policies=policies;
        $rootScope.policies2=policies2;
        var element = angular.element(
          '<form name="form">' +
          '<input ng-model="password" name="password" password-validation="policies" />' +
          '</form>'
        );
         var element2 = angular.element(
          '<form name="form2">' +
          '<input ng-model="password" name="password" password-validation="policies2" />' +
          '</form>'
        );
        $compile(element)($rootScope);
        $compile(element2)($rootScope);
        form = $rootScope.form;
        form2 = $rootScope.form2
      }));

    it('parses a password policies array',inject(function(Policy){
        parsedPolicies=Policy.parse(policies);
        expect(parsedPolicies.disallowed.disallowedChars).toBe('^&*)(#$');
    }));

    it('returns validators, based on the parsed policies',inject(function(Policy){
        Policy.parse(policies);
        expect(Object.keys(Policy.getValidators())).toEqual(["complex","lowercase","lowercaseNotAllowed","uppercase","uppercaseNotAllowed","number","numberNotAllowed","special","specialNotAllowed","disallowedChars","disallowedWords","length"]);
    }));

    describe('looks at the view value of the input and attaches the correct errors to the input',function(){
        it('attaches lowercase error if lowercase is allowed and there\'s not enough character classes fulfilled',inject(function(Policy){
            form.password.$setViewValue('');
            $rootScope.$digest();
            expect(form.password.$error.lowercase).toBe(true);
            form.password.$setViewValue('aB1');
            $rootScope.$digest();
            expect(form.password.$error.lowercase).toBe(undefined);
        }));
        it('attaches uppercase error if uppercase is allowed and there\'s not enough character classes fulfilled',inject(function(Policy){
            form.password.$setViewValue('');
            $rootScope.$digest();
            expect(form.password.$error.uppercase).toBe(true);
            form.password.$setViewValue('aB1');
            $rootScope.$digest();
            expect(form.password.$error.uppercase).toBe(undefined);
        }));
        it('attaches number error if numbers are allowed and there\'s not enough character classes fulfilled',inject(function(Policy){
            form.password.$setViewValue('');
            $rootScope.$digest();
            expect(form.password.$error.number).toBe(true);
            form.password.$setViewValue('aB1');
            $rootScope.$digest();
            expect(form.password.$error.number).toBe(undefined);
        }));
        it('attaches special error if special chars are allowed and there\'s not enough character classes fulfilled',inject(function(Policy){
            form.password.$setViewValue('');
            $rootScope.$digest();
            expect(form.password.$error.special).toBe(true);
            form.password.$setViewValue('aB1');
            $rootScope.$digest();
            expect(form.password.$error.special).toBe(undefined);
        }));
        it('attaches complex error if there\'s not enough character classes fulfilled',inject(function(Policy){
            form.password.$setViewValue('');
            $rootScope.$digest();
            expect(form.password.$error.complex).toBe(true);
            form.password.$setViewValue('aB1');
            $rootScope.$digest();
            expect(form.password.$error.complex).toBe(undefined);
        }));
        it('attaches lowercaseNotAllowed error if there\'s a lowercase and lowercase is not allowed',inject(function(Policy){
            form2.password.$setViewValue('');
            $rootScope.$digest();
            expect(form2.password.$error.lowercaseNotAllowed).toBe(undefined);
            form2.password.$setViewValue('a');
            $rootScope.$digest();
            expect(form2.password.$error.lowercaseNotAllowed).toBe(true);
        }));
        it('attaches uppercaseNotAllowed error if there\'s an uppercase and uppercase is not allowed',inject(function(Policy){
            form2.password.$setViewValue('');
            $rootScope.$digest();
            expect(form2.password.$error.uppercaseNotAllowed).toBe(undefined);
            form2.password.$setViewValue('A');
            $rootScope.$digest();
            expect(form2.password.$error.uppercaseNotAllowed).toBe(true);
        }));
        it('attaches numberNotAllowed error if there\'s a number and numbers are not allowed',inject(function(Policy){
            form2.password.$setViewValue('');
            $rootScope.$digest();
            expect(form2.password.$error.numberNotAllowed).toBe(undefined);
            form2.password.$setViewValue('2');
            $rootScope.$digest();
            expect(form2.password.$error.numberNotAllowed).toBe(true);
        }));
        it('attaches specialNotAllowed error if there\'s a special character and special chars are not allowed',inject(function(Policy){
            form2.password.$setViewValue('');
            $rootScope.$digest();
            expect(form2.password.$error.specialNotAllowed).toBe(undefined);
            form2.password.$setViewValue('*');
            $rootScope.$digest();
            expect(form2.password.$error.specialNotAllowed).toBe(true);
        }));
        it('attaches disallowedChars error if there\'s a disallowed character',inject(function(Policy){
            form2.password.$setViewValue('');
            $rootScope.$digest();
            expect(form2.password.$error.disallowedChars).toBe(undefined);
            form2.password.$setViewValue('&');
            $rootScope.$digest();
            expect(form2.password.$error.disallowedChars).toBe(true);
        }));
        it('attaches disallowedWords error if there\'s a disallowed word',inject(function(Policy){
            form2.password.$setViewValue('');
            $rootScope.$digest();
            expect(form2.password.$error.disallowedWords).toBe(undefined);
            form2.password.$setViewValue('password');
            $rootScope.$digest();
            expect(form2.password.$error.disallowedWords).toBe(true);
        }));
        it('attaches length error if there\'s not enough allowed characters',inject(function(Policy){
            form.password.$setViewValue('');
            $rootScope.$digest();
            expect(form.password.$error.length).toBe(true);
            form.password.$setViewValue('1abcDefg');
            $rootScope.$digest();
            expect(form.password.$error.length).toBe(undefined);
            form.password.$setViewValue('1abcDefasfsaffssffasfas'); //too long
            $rootScope.$digest();
            expect(form.password.$error.length).toBe(true);
        }));
    });



});

