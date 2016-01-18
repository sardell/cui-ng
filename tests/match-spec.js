describe('Match',function(){
    var $compile,
        $rootScope;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        var element = angular.element(
          '<form name="form">' +
          '<input ng-model="password" name="password" />' +
          '<input ng-model="passwordRe" name="password2" match="password" />' +
          '</form>'
        );
        $compile(element)($rootScope);
        form = $rootScope.form;
    }));

    it('attaches a match error to the field with the attribute if it does not match the model it\'s compared to',function(){
        form.password.$setViewValue('aaaaaaa');
        form.password2.$setViewValue('bbbbbbb');
        $rootScope.$digest();
        expect(form.password2.$error.match).toBe(true);
    });
     it('removes the match error from the field with the attribute when it matches the model it\'s compared to',function(){
        form.password.$setViewValue('aaaaaaa');
        form.password2.$setViewValue('bbbbbbb');
        $rootScope.$digest();
        expect(form.password2.$error.match).toBe(true);
        form.password2.$setViewValue('aaaaaaa');
        expect(form.password2.$error.match).toBe(undefined);
    });
});