describe('Custom-error',function(){
    var $compile,
        $rootScope,
        customErrors=[
            {
                name:'test',
                check:function(){
                    return true;
                }
            },
            {
                name:'test2',
                check:function(){
                    return false;
                }
            }
        ];

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $rootScope.customErrors=customErrors;
        var element = angular.element(
          '<form name="form">' +
          '<input ng-model="password" name="password" custom-error="customErrors" />' +
          '</form>'
        );
        $compile(element)($rootScope);
        form = $rootScope.form;
    }));

    it('attaches custom errors to the input, based on an array of custom errors and their check functions',function(){
        form.password.$setViewValue('');
        $rootScope.$digest();
        expect(form.password.$error.test).toBe(undefined);
        expect(form.password.$error.test2).toBe(true);
    });
});