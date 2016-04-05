angular.module('cui-ng')
.provider('$cuiI18n',[function(){
    var preferenceArray,listOfLocaleCodesAndNames;

    this.setLocalePreference=function(newPreferenceArray){
        preferenceArray=newPreferenceArray;
    };

    this.setLocaleCodesAndNames=function(newPreferenceObject){
        listOfLocaleCodesAndNames=newPreferenceObject;
    };

    this.getLocaleCodesAndNames=function(){
        return listOfLocaleCodesAndNames;
    };

    this.getInternationalizedName=function(preferedLanguage,languageObjectArray){
        var languageObjectToUse;
        languageObjectToUse = _.find(languageObjectArray,function(languageObject){
            return languageObject.lang===preferedLanguage;
        })
        if (languageObjectToUse!=undefined) return languageObjectToUse.text || languageObjectToUse.value; // if the language being used by the user has a translation
        else {
            if(!preferenceArray) { // if a preference array hasn't been set
                console.log('You need to configure you prefered language array with cuiI18n.setLocalePreference');
                return;
            }
            for(var i=0;i <= preferenceArray.length;i++){
                languageObjectToUse = _.find(languageObjectArray,function(languageObject){
                    return languageObject.lang===preferenceArray[i];
                });
                if(languageObjectToUse!=undefined) return languageObjectToUse.text || languageObjectToUse.value;
            }
        }
    };

    this.$get = function(){
        return this;
    };
}]);