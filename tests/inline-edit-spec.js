describe('Inline-edit',function(){
    var $compile,
        $rootScope,
        $timeout;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_,_$timeout_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $timeout= _$timeout_;
    }));

    it('compiles into an inline edit component',function(){
        $rootScope.test="test text";
        var element = angular.element(
          '<inline-edit model="test" type="text" name="test" id="element"></inline-edit>'
        );
        $compile(element)($rootScope);
        $rootScope.$digest();
         // not sure what to test here - can't get the inner html of the compiled element, I'm guessing because
         // the directive itself also compiles a template with other directives in it.
    });
});