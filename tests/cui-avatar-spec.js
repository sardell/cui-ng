describe('Cui-avatar',function(){
    var $compile,
        $rootScope;

    beforeEach(module('cui-ng'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile= _$compile_;
        $rootScope= _$rootScope_;
    }));

    it('Replaces the background image with the given url',function(){
        var element = $compile('<cui-avatar user-avatar="\'http://imgurl.com/image.jpg\'">')($rootScope);
        $rootScope.$digest();
        expect(element[0].style.backgroundImage).toBe('url(http://imgurl.com/image.jpg)');
    })
})