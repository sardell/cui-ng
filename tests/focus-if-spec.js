describe('Focus-if',function(){
    var $compile,
        $rootScope,
        $timeout;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_,_$timeout_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
        $timeout= _$timeout_;
    }));

    it('focuses an input if the condition inside of focus-if evaluates to true',function(){
        var element = angular.element(
          '<input ng-model="password" name="password" focus-if="true" />'
        );
        $compile(element)($rootScope);
        spyOn(element[0],'focus');
        $timeout.flush();
        expect(element[0].focus).toHaveBeenCalled();
    });
});