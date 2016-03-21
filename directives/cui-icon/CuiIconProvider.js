angular.module('cui-ng')
.provider('$cuiIcon', [function(){
    var iconSets={};

    this.iconSet=function(namespace,path,viewBox){
        iconSets[namespace]={
            path:path,
            viewBox:viewBox || undefined
        };
    };

    this.getIconSets=function(){
        return iconSets;
    };

    this.getIconSet=function(namespace){
        if(!iconSets[namespace]) {
            console.log('This collection of icons needs to be defined within your app\`s config');
            return;
        }
        return iconSets[namespace];
    };

    this.$get=function(){
        return this;
    };
}]);