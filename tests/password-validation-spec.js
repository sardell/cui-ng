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
        console.log(Object.keys(Policy));
    }));

});

