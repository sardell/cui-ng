(function(angular){'use strict'

	angular.module('cui-ng',[]);

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
        if (languageObjectToUse!=undefined) return languageObjectToUse.text; // if the language being used by the user has a translation
        else {
            if(!preferenceArray) { // if a preference array hasn't been set
                console.log('You need to configure you prefered language array with cuiI18n.setLocalePreference');
                return;
            }
            for(var i=0;i <= preferenceArray.length;i++){
                languageObjectToUse = _.find(languageObjectArray,function(languageObject){
                    return languageObject.lang===preferenceArray[i];
                });
                if(languageObjectToUse!=undefined) return languageObjectToUse.text;
            }
        }
    };

    this.$get = function(){
        return this;
    };
}]);

angular.module('cui-ng')
.filter('cuiI18n',['LocaleService','$cuiI18n',function(LocaleService,$cuiI18n){
    return function(languageObjectArray){
        return $cuiI18n.getInternationalizedName(LocaleService.getLocaleCode(),languageObjectArray);
    }
}]);

angular.module('cui-ng')
.directive('autoComplete', ['$q', '$parse', '$http', '$sce', '$timeout', '$templateCache', '$interpolate', function ($q, $parse, $http, $sce, $timeout, $templateCache, $interpolate) {
    // keyboard events
    var KEY_DW  = 40;
    var KEY_RT  = 39;
    var KEY_UP  = 38;
    var KEY_LF  = 37;
    var KEY_ES  = 27;
    var KEY_EN  = 13;
    var KEY_TAB =  9;

    var MIN_LENGTH = 3;
    var MAX_LENGTH = 524288;  // the default max length per the html maxlength attribute
    var PAUSE = 500;
    var BLUR_TIMEOUT = 200;

    // string constants
    var REQUIRED_CLASS = 'autocomplete-required';
    var TEXT_SEARCHING = 'Searching...';
    var TEXT_NORESULTS = 'No results found';
    var TEMPLATE_URL = '/angucomplete-alt/index.html';

    // Set the default template for this directive
    $templateCache.put(TEMPLATE_URL,
        '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' +
        '  <input id="{{id}}_value" name="{{inputName}}" ng-class="{\'ng-valid\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' +
        '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' +
        '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' +
        '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>' +
        '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' +
        '      <div ng-if="imageField" class="angucomplete-image-holder">' +
        '        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>' +
        '        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>' +
        '      </div>' +
        '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' +
        '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' +
        '      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>' +
        '      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );

    function link(scope, elem, attrs, ctrl) {
      var inputField = elem.find('input');
      var minlength = MIN_LENGTH;
      var searchTimer = null;
      var hideTimer;
      var requiredClassName = REQUIRED_CLASS;
      var responseFormatter;
      var validState = null;
      var httpCanceller = null;
      var dd = elem[0].querySelector('.angucomplete-dropdown');
      var isScrollOn = false;
      var mousedownOn = null;
      var unbindInitialValue;
      var displaySearching;
      var displayNoResults;

      elem.on('mousedown', function(event) {
        if (event.target.id) {
          mousedownOn = event.target.id;
          if (mousedownOn === scope.id + '_dropdown') {
            document.body.addEventListener('click', clickoutHandlerForDropdown);
          }
        }
        else {
          mousedownOn = event.target.className;
        }
      });

      scope.currentIndex = scope.focusFirst ? 0 : null;
      scope.searching = false;
      unbindInitialValue = scope.$watch('initialValue', function(newval) {
        if (newval) {
          // remove scope listener
          unbindInitialValue();
          // change input
          handleInputChange(newval, true);
        }
      });

      if(attrs.fieldRequired!==undefined){
        scope.$watch('fieldRequired', function(newval, oldval) {
          if (!newval || newval==={}) {
            ctrl[scope.inputName].$setValidity('required', false);
          }
          else if (newval && newval!=={}){
            ctrl[scope.inputName].$setValidity('required', true);
          }
        });
      }

      scope.$on('angucomplete-alt:changeInput', function (event, elementId, newval) {
        if (!!elementId && elementId === scope.id) {
          handleInputChange(newval);
        }
      });

      function handleInputChange(newval, initial) {
        if (newval) {
          if (typeof newval === 'object') {
            scope.searchStr = extractTitle(newval);
            callOrAssign({originalObject: newval});
          } else if (typeof newval === 'string' && newval.length > 0) {
            scope.searchStr = newval;
          } else {
            if (console && console.error) {
              console.error('Tried to set ' + (!!initial ? 'initial' : '') + ' value of angucomplete to', newval, 'which is an invalid value');
            }
          }

          handleRequired(true);
        }
      }

      // #194 dropdown list not consistent in collapsing (bug).
      function clickoutHandlerForDropdown(event) {
        mousedownOn = null;
        scope.hideResults(event);
        document.body.removeEventListener('click', clickoutHandlerForDropdown);
      }

      // for IE8 quirkiness about event.which
      function ie8EventNormalizer(event) {
        return event.which ? event.which : event.keyCode;
      }

      function callOrAssign(value) {
        if (typeof scope.selectedObject === 'function') {
          scope.selectedObject(value);
        }
        else {
          scope.selectedObject = value;
        }

        if (value) {
          handleRequired(true);
        }
        else {
          handleRequired(false);
        }
      }

      function callFunctionOrIdentity(fn) {
        return function(data) {
          return scope[fn] ? scope[fn](data) : data;
        };
      }

      function setInputString(str) {
        callOrAssign({originalObject: str});

        if (scope.clearSelected) {
          scope.searchStr = null;
        }
        clearResults();
      }

      function extractTitle(data) {
        // split title fields and run extractValue for each and join with ' '
        return scope.titleField.split(',')
          .map(function(field) {
            return extractValue(data, field);
          })
          .join(' ');
      }

      function extractValue(obj, key) {
        var keys, result;
        if (key) {
          keys= key.split('.');
          result = obj;
          for (var i = 0; i < keys.length; i++) {
            result = result[keys[i]];
          }
        }
        else {
          result = obj;
        }
        return result;
      }

      function findMatchString(target, str) {
        var result, matches, re;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        // Escape user input to be treated as a literal string within a regular expression
        re = new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (!target) { return; }
        if (!target.match || !target.replace) { target = target.toString(); }
        matches = target.match(re);
        if (matches) {
          result = target.replace(re,
              '<span class="'+ scope.matchClass +'">'+ matches[0] +'</span>');
        }
        else {
          result = target;
        }
        return $sce.trustAsHtml(result);
      }

      function handleRequired(valid) {
        scope.notEmpty = valid;
        validState = scope.searchStr;
      }

      function keyupHandler(event) {
        var which = ie8EventNormalizer(event);
        if (which === KEY_LF || which === KEY_RT) {
          // do nothing
          return;
        }

        if (which === KEY_UP || which === KEY_EN) {
          event.preventDefault();
        }
        else if (which === KEY_DW) {
          event.preventDefault();
          if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
            initResults();
            scope.searching = true;
            searchTimerComplete(scope.searchStr);
          }
        }
        else if (which === KEY_ES) {
          clearResults();
          scope.$apply(function() {
            inputField.val(scope.searchStr);
          });
        }
        else {
          if (minlength === 0 && !scope.searchStr) {
            return;
          }

          if (!scope.searchStr || scope.searchStr === '') {
            scope.showDropdown = false;
          } else if (scope.searchStr.length >= minlength) {
            initResults();

            if (searchTimer) {
              $timeout.cancel(searchTimer);
            }

            scope.searching = true;

            searchTimer = $timeout(function() {
              searchTimerComplete(scope.searchStr);
            }, scope.pause);
          }

          if (validState && validState !== scope.searchStr && !scope.clearSelected) {
            scope.$apply(function() {
              callOrAssign();
            });
          }
        }
      }

      function handleOverrideSuggestions(event) {
        if (scope.overrideSuggestions &&
            !(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
          if (event) {
            event.preventDefault();
          }

          // cancel search timer
          $timeout.cancel(searchTimer);
          // cancel http request
          cancelHttpRequest();

          setInputString(scope.searchStr);
        }
      }

      function dropdownRowOffsetHeight(row) {
        var css = getComputedStyle(row);
        return row.offsetHeight +
          parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
      }

      function dropdownHeight() {
        return dd.getBoundingClientRect().top +
          parseInt(getComputedStyle(dd).maxHeight, 10);
      }

      function dropdownRow() {
        return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
      }

      function dropdownRowTop() {
        return dropdownRow().getBoundingClientRect().top -
          (dd.getBoundingClientRect().top +
           parseInt(getComputedStyle(dd).paddingTop, 10));
      }

      function dropdownScrollTopTo(offset) {
        dd.scrollTop = dd.scrollTop + offset;
      }

      function updateInputField(){
        var current = scope.results[scope.currentIndex];
        if (scope.matchClass) {
          inputField.val(extractTitle(current.originalObject));
        }
        else {
          inputField.val(current.title);
        }
      }

      function keydownHandler(event) {
        var which = ie8EventNormalizer(event);
        var row = null;
        var rowTop = null;

        if (which === KEY_EN && scope.results) {
          if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
            event.preventDefault();
            scope.selectResult(scope.results[scope.currentIndex]);
          } else {
            handleOverrideSuggestions(event);
            clearResults();
          }
          scope.$apply();
        } else if (which === KEY_DW && scope.results) {
          event.preventDefault();
          if ((scope.currentIndex + 1) < scope.results.length && scope.showDropdown) {
            scope.$apply(function() {
              scope.currentIndex ++;
              updateInputField();
            });

            if (isScrollOn) {
              row = dropdownRow();
              if (dropdownHeight() < row.getBoundingClientRect().bottom) {
                dropdownScrollTopTo(dropdownRowOffsetHeight(row));
              }
            }
          }
        } else if (which === KEY_UP && scope.results) {
          event.preventDefault();
          if (scope.currentIndex >= 1) {
            scope.$apply(function() {
              scope.currentIndex --;
              updateInputField();
            });

            if (isScrollOn) {
              rowTop = dropdownRowTop();
              if (rowTop < 0) {
                dropdownScrollTopTo(rowTop - 1);
              }
            }
          }
          else if (scope.currentIndex === 0) {
            scope.$apply(function() {
              scope.currentIndex = -1;
              inputField.val(scope.searchStr);
            });
          }
        } else if (which === KEY_TAB) {
          if (scope.results && scope.results.length > 0 && scope.showDropdown) {
            if (scope.currentIndex === -1 && scope.overrideSuggestions) {
              // intentionally not sending event so that it does not
              // prevent default tab behavior
              handleOverrideSuggestions();
            }
            else {
              if (scope.currentIndex === -1) {
                scope.currentIndex = 0;
              }
              scope.selectResult(scope.results[scope.currentIndex]);
              scope.$digest();
            }
          }
          else {
            // no results
            // intentionally not sending event so that it does not
            // prevent default tab behavior
            if (scope.searchStr && scope.searchStr.length > 0) {
              handleOverrideSuggestions();
            }
          }
        } else if (which === KEY_ES) {
          // This is very specific to IE10/11 #272
          // without this, IE clears the input text
          event.preventDefault();
        }
      }

      function httpSuccessCallbackGen(str) {
        return function(responseData, status, headers, config) {
          // normalize return obejct from promise
          if (!status && !headers && !config && responseData.data) {
            responseData = responseData.data;
          }
          scope.searching = false;
          processResults(
            extractValue(responseFormatter(responseData), scope.remoteUrlDataField),
            str);
        };
      }

      function httpErrorCallback(errorRes, status, headers, config) {
        // cancelled/aborted
        if (status === 0 || status === -1) { return; }

        // normalize return obejct from promise
        if (!status && !headers && !config) {
          status = errorRes.status;
        }
        if (scope.remoteUrlErrorCallback) {
          scope.remoteUrlErrorCallback(errorRes, status, headers, config);
        }
        else {
          if (console && console.error) {
            console.error('http error');
          }
        }
      }

      function cancelHttpRequest() {
        if (httpCanceller) {
          httpCanceller.resolve();
        }
      }

      function getRemoteResults(str) {
        var params = {},
            url = scope.remoteUrl + encodeURIComponent(str);
        if (scope.remoteUrlRequestFormatter) {
          params = {params: scope.remoteUrlRequestFormatter(str)};
          url = scope.remoteUrl;
        }
        if (!!scope.remoteUrlRequestWithCredentials) {
          params.withCredentials = true;
        }
        cancelHttpRequest();
        httpCanceller = $q.defer();
        params.timeout = httpCanceller.promise;
        $http.get(url, params)
          .success(httpSuccessCallbackGen(str))
          .error(httpErrorCallback);
      }

      function getRemoteResultsWithCustomHandler(str) {
        cancelHttpRequest();

        httpCanceller = $q.defer();

        scope.remoteApiHandler(str, httpCanceller.promise)
          .then(httpSuccessCallbackGen(str))
          .catch(httpErrorCallback);

        /* IE8 compatible
        scope.remoteApiHandler(str, httpCanceller.promise)
          ['then'](httpSuccessCallbackGen(str))
          ['catch'](httpErrorCallback);
        */
      }

      function clearResults() {
        scope.showDropdown = false;
        scope.results = [];
        if (dd) {
          dd.scrollTop = 0;
        }
      }

      function initResults() {
        scope.showDropdown = displaySearching;
        scope.currentIndex = scope.focusFirst ? 0 : -1;
        scope.results = [];
      }

      function getLocalResults(str) {
        var i, match, s, value,
            searchFields = scope.searchFields.split(','),
            matches = [];
        if (typeof scope.parseInput() !== 'undefined') {
          str = scope.parseInput()(str);
        }
        for (i = 0; i < scope.localData.length; i++) {
          match = false;

          for (s = 0; s < searchFields.length; s++) {
            value = extractValue(scope.localData[i], searchFields[s]) || '';
            match = match || (value.toString().toLowerCase().indexOf(str.toString().toLowerCase()) >= 0);
          }

          if (match) {
            matches[matches.length] = scope.localData[i];
          }
        }

        scope.searching = false;
        processResults(matches, str);
      }

      function checkExactMatch(result, obj, str){
        if (!str) { return false; }
        for(var key in obj){
          if(obj[key].toLowerCase() === str.toLowerCase()){
            scope.selectResult(result);
            return true;
          }
        }
        return false;
      }

      function searchTimerComplete(str) {
        // Begin the search
        if (!str || str.length < minlength) {
          return;
        }
        if (scope.localData) {
          scope.$apply(function() {
            getLocalResults(str);
          });
        }
        else if (scope.remoteApiHandler) {
          getRemoteResultsWithCustomHandler(str);
        } else {
          getRemoteResults(str);
        }
      }

      function processResults(responseData, str) {
        var i, description, image, text, formattedText, formattedDesc;

        if (responseData && responseData.length > 0) {
          scope.results = [];

          for (i = 0; i < responseData.length; i++) {
            if (scope.titleField && scope.titleField !== '') {
              text = formattedText = extractTitle(responseData[i]);
            }

            description = '';
            if (scope.descriptionField) {
              description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
            }

            image = '';
            if (scope.imageField) {
              image = extractValue(responseData[i], scope.imageField);
            }

            if (scope.matchClass) {
              formattedText = findMatchString(text, str);
              formattedDesc = findMatchString(description, str);
            }

            scope.results[scope.results.length] = {
              title: formattedText,
              description: formattedDesc,
              image: image,
              originalObject: responseData[i]
            };
          }

        } else {
          scope.results = [];
        }

        if (scope.autoMatch && scope.results.length === 1 &&
            checkExactMatch(scope.results[0],
              {title: text, desc: description || ''}, scope.searchStr)) {
          scope.showDropdown = false;
        } else if (scope.results.length === 0 && !displayNoResults) {
          scope.showDropdown = false;
        } else {
          scope.showDropdown = true;
        }
      }

      function showAll() {
        if (scope.localData) {
          processResults(scope.localData, '');
        }
        else if (scope.remoteApiHandler) {
          getRemoteResultsWithCustomHandler('');
        }
        else {
          getRemoteResults('');
        }
      }

      scope.onFocusHandler = function() {
        if (scope.focusIn) {
          scope.focusIn();
        }
        if (minlength === 0 && (!scope.searchStr || scope.searchStr.length === 0)) {
          scope.currentIndex = scope.focusFirst ? 0 : scope.currentIndex;
          scope.showDropdown = true;
          showAll();
        }
      };

      scope.hideResults = function() {
        if (mousedownOn &&
            (mousedownOn === scope.id + '_dropdown' ||
             mousedownOn.indexOf('angucomplete') >= 0)) {
          mousedownOn = null;
        }
        else {
          hideTimer = $timeout(function() {
            clearResults();
            scope.$apply(function() {
              if (scope.searchStr && scope.searchStr.length > 0) {
                inputField.val(scope.searchStr);
              }
            });
          }, BLUR_TIMEOUT);
          cancelHttpRequest();

          if (scope.focusOut) {
            scope.focusOut();
          }

          if (scope.overrideSuggestions) {
            if (scope.searchStr && scope.searchStr.length > 0 && scope.currentIndex === -1) {
              handleOverrideSuggestions();
            }
          }
        }
      };

      scope.resetHideResults = function() {
        if (hideTimer) {
          $timeout.cancel(hideTimer);
        }
      };

      scope.hoverRow = function(index) {
        scope.currentIndex = index;
      };

      scope.selectResult = function(result) {
        // Restore original values
        if (scope.matchClass) {
          result.title = extractTitle(result.originalObject);
          result.description = extractValue(result.originalObject, scope.descriptionField);
        }

        if (scope.clearSelected) {
          scope.searchStr = null;
        }
        else {
          scope.searchStr = result.title;
        }
        callOrAssign(result);
        clearResults();
      };

      scope.inputChangeHandler = function(str) {
        if (str.length < minlength) {
          cancelHttpRequest();
          clearResults();
        }
        else if (str.length === 0 && minlength === 0) {
          scope.searching = false;
          showAll();
        }

        if (scope.inputChanged) {
          str = scope.inputChanged(str);
        }
        return str;
      };

      // check required
      if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
        requiredClassName = scope.fieldRequiredClass;
      }

      // check min length
      if (scope.minlength && scope.minlength !== '') {
        minlength = parseInt(scope.minlength, 10);
      }

      // check pause time
      if (!scope.pause) {
        scope.pause = PAUSE;
      }

      // check clearSelected
      if (!scope.clearSelected) {
        scope.clearSelected = false;
      }

      // check override suggestions
      if (!scope.overrideSuggestions) {
        scope.overrideSuggestions = false;
      }

      // check required field
      if (scope.fieldRequired && ctrl) {
        // check initial value, if given, set validitity to true
        if (scope.initialValue) {
          handleRequired(true);
        }
        else {
          handleRequired(false);
        }
      }

      scope.inputType = attrs.type ? attrs.type : 'text';

      // set strings for "Searching..." and "No results"
      scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
      scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
      displaySearching = scope.textSearching === 'false' ? false : true;
      displayNoResults = scope.textNoResults === 'false' ? false : true;

      // set max length (default to maxlength deault from html
      scope.maxlength = attrs.maxlength ? attrs.maxlength : MAX_LENGTH;

      // register events
      inputField.on('keydown', keydownHandler);
      inputField.on('keyup', keyupHandler);

      // set response formatter
      responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

      // set isScrollOn
      $timeout(function() {
        var css = getComputedStyle(dd);
        isScrollOn = css.maxHeight && css.overflowY === 'auto';
      });
    }

    return {
      restrict: 'EA',
      require: '^?form',
      scope: {
        selectedObject: '=',
        disableInput: '=',
        initialValue: '=',
        localData: '=',
        remoteUrlRequestFormatter: '=',
        remoteUrlRequestWithCredentials: '@',
        remoteUrlResponseFormatter: '=',
        remoteUrlErrorCallback: '=',
        remoteApiHandler: '=',
        id: '@',
        type: '@',
        placeholder: '@',
        remoteUrl: '@',
        remoteUrlDataField: '@',
        titleField: '@',
        descriptionField: '@',
        imageField: '@',
        inputClass: '@',
        pause: '@',
        searchFields: '@',
        minlength: '@',
        matchClass: '@',
        clearSelected: '@',
        overrideSuggestions: '@',
        fieldRequired: '=',
        fieldRequiredClass: '@',
        inputChanged: '=',
        autoMatch: '@',
        focusOut: '&',
        focusIn: '&',
        inputName: '@',
        focusFirst: '@',
        parseInput: '&'
      },
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || TEMPLATE_URL;
      },
      compile: function(tElement) {
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        if (!(startSym === '{{' && endSym === '}}')) {
          var interpolatedHtml = tElement.html()
            .replace(/\{\{/g, startSym)
            .replace(/\}\}/g, endSym);
          tElement.html(interpolatedHtml);
        }
        return link;
      }
    };
}]);





angular.module('cui-ng')
.directive('classToggle',[function(){
    return{
        restrict:'EAC',
        scope: true,
        link:function(scope,elem,attrs){
            var toggledClass=attrs.toggledClass,
                elementClass=function(){
                    return elem.attr('class');
                },
                checkIfToggled=function(elementClass){
                    if(elementClass.indexOf(toggledClass)>-1) scope.toggled=true;
                    else scope.toggled=false;
                };

            scope.toggleClass=function(){
                elem.toggleClass(toggledClass);
            };
            scope.toggleOn=function(){
                if(!scope.toggled) scope.toggleClass();
            };
            scope.toggleOff=function(){
                if(scope.toggled) scope.toggleClass();
            };

            scope.$watch(elementClass, checkIfToggled);
        }
    };
}]);


angular.module('cui-ng')
.directive('cuiAvatar',['$timeout','$http',function($timeout,$http){
    return{
        restrict: 'A',
        scope:{
            cuiAvatar:'=',
            cuiAvatarNames:'=',
            cuiAvatarEmail:'='
        },
        link:function(scope,elem,attrs){
            var self;
            var cuiAvatar={
                initScope:function(){
                    self=this;
                },
                selectors:{
                    $elem:angular.element(elem[0])
                },
                config:{
                    colorClassPrefix:attrs.cuiAvatarColorClassPrefix || false,
                    colorCount:attrs.cuiAvatarColorCount || 0
                },
                watchers:function(){
                    scope.$watch('cuiAvatar',function(newAvatar){
                        if(newAvatar){
                            self.update();
                        }
                    });
                     scope.$watch('cuiAvatarNames',function(newNameArray){
                        if(newNameArray){
                            self.update();
                        }
                    });
                },
                render:{
                    nameBackground:function(){
                        if(self.config.colorClassPrefix) {
                            if(self.config.colorCount===0) throw 'For cui-avatar if you specify color class prefix you must specify the attribute cui-avatar-color-count';
                            if(_.find(self.selectors.$elem[0].classList,function(className){
                                return className.indexOf(self.config.colorClassPrefix)>-1;
                            }) !==undefined ) return; // if there's already a class that looks like the one specified in cuiAvatarColorClassPrefix
                            var classNumberToApply=Math.floor(Math.random()*self.config.colorCount + 1);
                            self.selectors.$elem[0].classList.add(self.config.colorClassPrefix+classNumberToApply);
                        }
                    },
                    initials:function(){
                        if (!scope.cuiAvatarNames) return;
                        var name=function(){
                            var nameToDisplay='';
                            scope.cuiAvatarNames.forEach(function(name){
                                nameToDisplay+=name[0];
                            });
                            return nameToDisplay;
                        };
                        self.selectors.$elem[0].innerHTML='<div class="cui-avatar__initials"></div>';
                        self.selectors.$initials=angular.element(elem[0].querySelector('.cui-avatar__initials'));
                        self.selectors.$initials[0].innerHTML=name();
                    },
                    image:function(){
                        function applyImage(imgSrc){
                            $timeout(function(){
                                self.selectors.$elem[0].innerHTML='<div class="cui-avatar__image-container"></div>';
                                self.selectors.$image=angular.element(elem[0].querySelector('.cui-avatar__image-container'));
                                self.selectors.$image[0].style.backgroundImage=String.prototype.concat('url("',imgSrc,'")');
                            });
                        };
                        var img=new Image();
                        if(scope.cuiAvatar){
                            img.src=scope.cuiAvatar;
                            img.onload=applyImage(img.src);
                        }
                        else if (scope.cuiAvatarEmail){
                            // This is giving back "No access control allow origin"
                            // var hashedEmail=md5(scope.cuiAvatarEmail);
                            // $http.get('https://www.gravatar.com/'+hashedEmail+'.json')
                            // .then(function(res){
                            //     console.log(res);
                            // })
                            // img.src='https://www.gravatar.com/avatar/'+hashedEmail;
                            // img.onload=applyImage(img.src);
                        }
                        else return;
                    }
                },
                update:function(){
                    self.render.nameBackground();
                    self.render.initials();
                    self.render.image();
                }
            };

            cuiAvatar.initScope();
            cuiAvatar.render.nameBackground();
            cuiAvatar.render.initials();
            cuiAvatar.render.image();
            cuiAvatar.watchers();
        }
    };
}]);


angular.module('cui-ng')
.directive('cuiExpandable',[function(){
    return{
        restrict:'E',
        scope:true,
        link:function(scope,elem,attrs){
            var expandableBody=angular.element(elem[0].querySelector('cui-expandable-body'));
            expandableBody.hide(); // hide the body by default
            var toggleClass=function(){
                elem.toggleClass('expanded');
            };
            var toggleBody=function(){
                expandableBody.animate({'height':'toggle'}, parseInt(elem.attr('transition-speed')||300) ,'linear');
            };

            scope.toggleExpand=function(){
                toggleClass();
            };
            scope.expand=function(){
                if(!scope.expanded) toggleClass();
            };
            scope.collapse=function(){
            	if(scope.expanded) toggleClass();
            };
            scope.$watch(function() {return elem.attr('class'); }, function(newValue,oldValue){
                if(oldValue===newValue && newValue.indexOf('expanded')>-1 ){ // if the element the expanded class put in by default
                    scope.expanded=true;
                    toggleBody();
                }
                else if(newValue.indexOf('expanded')===-1){
                    if(scope.expanded===true) toggleBody();
                    scope.expanded=false;
                }
                else{
                    if(scope.expanded===false) toggleBody();
                    scope.expanded=true;
                }
            });
        }
    };
}]);


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

angular.module('cui-ng')
.directive('cuiIcon',['$cuiIcon',function($cuiIcon){
    return {
        restrict:'E',
        scope:{},
        link:function(scope,elem,attrs){
            var icon=attrs.cuiSvgIcon,
                viewBox,
                preserveAspectRatio,
                svgClass,
                path;

            attrs.preserveAspectRatio ? preserveAspectRatio=' preserveAspectRatio="' + attrs.preserveAspectRatio + '" ' : preserveAspectRatio='';
            attrs.svgClass? svgClass=' class="' + attrs.svgClass + '" ' : svgClass='';
            attrs.viewBox? viewBox=' viewBox="' + attrs.viewBox + '" ' : viewBox='';

            if(icon && icon.indexOf('.svg')>-1){ // if the path is directly specified
                path=icon;
            }
            else if(icon){ // if the icon is pointing at a namespace put into the provider
                var iconId=icon.split(':')[1];
                var iconNamespace=icon.split(':')[0];
                path=$cuiIcon.getIconSet(iconNamespace).path + '#' + iconId;
                if(viewBox==='' && $cuiIcon.getIconSet(iconNamespace).viewBox){
                    viewBox=' viewBox="' + $cuiIcon.getIconSet(iconNamespace).viewBox + '" ';
                }
            }
            else console.log('You need to define a cui-svg-icon attribute for cui-icon');
            var newSvg=$(
                String.prototype.concat(
                    '<svg xmlns="http://www.w3.org/2000/svg" ', preserveAspectRatio , svgClass, viewBox,'>',
                        '<use xlink:href="', path ,'"></use>',
                    '</svg>'
                )
            );

            angular.element(elem).append(newSvg);
        }
    };
}]);

angular.module('cui-ng')
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope','$document',
    function($timeout,$compile,$window,$rootScope,$document){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            var numberOfSteps,invalidForm,mobileStack,$steps,bar,$indicatorContainer,clickableIndicators,minimumPadding,
                snap,$body,$mobileSteps,$cuiExpandableTitle,$stepIndicatorContainer;

            var init = function(){
                invalidForm=[];
                mobileStack=attrs.mobileStack!==undefined;
                $steps=angular.element(elem[0].querySelectorAll('step'));
                numberOfSteps=$steps.length;
                bar=(attrs.bar!==undefined && numberOfSteps!==1);
                $indicatorContainer=angular.element(elem[0].querySelector('indicator-container'));
                $indicatorContainer.append('<div class="cui-steps"></div>');
                $stepIndicatorContainer=angular.element($indicatorContainer[0].querySelector('.cui-steps'));
                $window=angular.element($window);
                scope.currentStep=Number(elem[0].attributes.step.value);
                clickableIndicators=attrs.clickableIndicators;
                minimumPadding=attrs.minimumPadding;
                snap=angular.element(document.querySelector('snap-content'));
                $body=angular.element('body');
                scope.wizardFinished=false;
                scope.next=function(state){
                    if(state) scope.goToState(state);
                    else {
                        scope.currentStep++;
                        updateIndicators();
                        updateBar();
                        updateStep();
                    }
                    if(!scope.wizardFinished && scope.currentStep===numberOfSteps) scope.wizardFinished=true;
                    calculateWhereToScroll();
                };
                scope.previous=function(state){
                    if(state){
                        scope.goToState(state);
                    }
                    else{
                        scope.currentStep--;
                        updateIndicators();
                        updateBar();
                        updateStep();
                    }
                    calculateWhereToScroll();
                };
                scope.goToStep=function(step){
                    if(step===scope.currentStep) return;
                    scope.currentStep=step;
                    updateIndicators();
                    updateBar();
                    updateStep();
                    calculateWhereToScroll();
                    if(!scope.wizardFinished && scope.currentStep===numberOfSteps) scope.wizardFinished=true;
                };
                scope.goToState=function(state){
                    if(state==='default') return;
                    $rootScope.$broadcast('stepChange',{state:state});
                };
                scope.nextWithErrorChecking=function(form,nextState){
                    if(!form.$valid){
                        angular.forEach(form.$error, function (field) {
                            angular.forEach(field, function(errorField){
                                errorField.$setTouched();
                            });
                        });
                        invalidForm[scope.currentStep]=true;
                    }
                    else{
                        invalidForm[scope.currentStep]=false;
                        calculateWhereToScroll();
                        if(nextState){
                            scope.goToState(nextState);
                        }
                        else{scope.next();}
                    }
                };
                if(isNaN(scope.currentStep)) scope.currentStep=1; // check if step is not a number, only runs once
                else if(scope.currentStep>numberOfSteps) scope.currentStep=numberOfSteps;
                else if(scope.currentStep<1) scope.currentStep=1;
                createIndicators();
                createBar();
                if(mobileStack) createMobileStack();
                if(bar) updateBar();
                updateIndicators();
                makeSureTheresRoom();
                watchForWindowResize();
                listenForLanguageChange();
                observeStepAttr();
            },
            // creates indicators inside of <indicator-container>
            createIndicators = function(){
                var stepTitles=[],
                    stepIcons=[];
                scope.defaultString='default';
                scope.stepStates=[];
                for(var i=0;i < numberOfSteps;i++){
                    stepTitles[i]=$steps[i].attributes.title.value;
                    if($steps[i].attributes.state){
                        scope.stepStates[i]='' + $steps[i].attributes.state.value + '';
                    }
                    if($steps[i].attributes.icon){
                        stepIcons[i]='' + $steps[i].attributes.icon.value + '';
                    }
                }
                scope.icons=[];
                stepTitles.forEach(function(e,i){
                    var div;
                    if(stepIcons[i]!==undefined){
                        if(stepIcons[i].indexOf('.')>-1){
                            scope.icons[i]='<div class="icon-container"><div class="icon"><img src="' +  stepIcons[i] + '" class="cui-icon-rotate"/></div></div>';
                        }
                        else{
                            scope.icons[i]='<div class="icon-container"><div class="icon"><cui-icon cui-svg-icon="' + stepIcons[i] + '" svg-class="cui-icon-rotate"></cui-icon></div></div>'; // adding svg-class for now until new wizard is out.
                        }
                    }
                    if(clickableIndicators!==undefined && scope.icons[i]!==undefined){
                        div=angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-'+ i + '" ng-click="goToStep(' +
                            (i+1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' +
                        stepTitles[i] + scope.icons[i] + '</span>');
                        div[0].style.cursor='pointer';
                    }
                    else if(clickableIndicators!==undefined && !scope.icons[i]){
                        div=angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-'+ i + '" ng-click="goToStep(' +
                            (i+1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' +
                        stepTitles[i] + '</span>');
                        div[0].style.cursor='pointer';
                    }
                    else{
                        div=angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-'+ i + '">' + stepTitles[i] +
                        (scope.icons[i]? (scope.icons[i]) : ('')) +
                        '</span>');
                    }
                    var compiled=$compile(div)(scope);
                    $stepIndicatorContainer.append(compiled);
                });
                scope.$indicators=angular.element(elem[0].querySelectorAll('.step-indicator'));
            },
            createBar = function(){
                //create a bar
                if(bar){
                    angular.element($indicatorContainer).append('<div class="steps-bar"></div>');
                    scope.$bar=$('.steps-bar');
                    scope.$bar[0].innerHTML='<div class="steps-bar-fill"></div>';
                    scope.$barFill=$('.steps-bar-fill');
                }
            },
            // updates the current active indicator. Removes active class from other elements.
            updateIndicators = function(){
                $timeout(function(){
                    for(var i=0; i<$steps.length ; i++){
                        $steps[i].classList.remove('active');
                        scope.$indicators[i].classList.remove('active');
                        if(mobileStack){ $mobileSteps[i].classList.remove('expanded'); }
                        if(i<(scope.currentStep-1)){
                            scope.$indicators[i].classList.add('visited');
                            if(mobileStack){ $mobileSteps[i].classList.add('visited'); }
                        }
                        else{
                            scope.$indicators[i].classList.remove('visited');
                            if(mobileStack){ $mobileSteps[i].classList.remove('visited'); }
                        }
                    }
                    $steps[scope.currentStep-1].classList.add('active');
                    scope.$indicators[scope.currentStep-1].classList.add('active');
                    if(mobileStack){ $mobileSteps[scope.currentStep-1].classList.add('expanded'); }
                });
            },
            updateBar = function(){
                if(!bar) return;
                $timeout(function(){
                    scope.$bar[0].style.left=scope.$indicators[0].scrollWidth/2+'px';
                    scope.$bar[0].style.right=scope.$indicators[scope.$indicators.length-1].scrollWidth/2+'px';
                    if(scope.currentStep==1){
                        scope.$barFill[0].style.width='0px';
                    }
                    else{
                        scope.$barFill[0].style.width=scope.$indicators[scope.currentStep-1].offsetLeft-(scope.$indicators[0].scrollWidth/2) +
                        (scope.$indicators[scope.currentStep-1].scrollWidth/2)+'px';
                    }
                });
            },
            createMobileStack = function(){
                angular.forEach($steps,function(step,i){
                    var ngIncludeSrc;
                    if(step.innerHTML.indexOf('<!-- ngInclude:')>-1){
                      ngIncludeSrc=step.innerHTML.split('<!-- ngInclude:')[1].split(' -->')[0];
                    }
                    step.classList.add('desktop-element');
                    var newElement=$compile(
                        '<cui-expandable class="cui-expandable mobile-element">' +
                        '<cui-expandable-title class="cui-expandable__title"' +
                        (clickableIndicators!==undefined? 'ng-click="goToStep(' +
                        (i+1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' : '>') +
                        (scope.icons[i]? scope.icons[i] : '') + '<span>' + step.title + '</span></cui-expandable-title>' +
                        '<cui-expandable-body class="cui-expandable__body">' +
                        (ngIncludeSrc? '<div ng-include="' + ngIncludeSrc + '"></div>' : step.innerHTML) + '</cui-expandable-body>' +
                        '</cui-expandable>')(scope);
                    angular.element(elem[0]).append(newElement);
                });
                $mobileSteps=angular.element(elem[0].querySelectorAll('cui-expandable.mobile-element'));
            },
            debounce = function(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) {func.apply(context, args);}
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            },
            getIndicatorsWidth = function(){
                var totalWidth=0;
                for(var i=0 ; i<numberOfSteps ; i++){
                    totalWidth += scope.$indicators[i].scrollWidth;
                }
                //adds the minimum padding between the steps.
                return totalWidth+((Number(minimumPadding) || 0)*(numberOfSteps-1));
            },
            getIndicatorContainerWidth = function(){
                return $indicatorContainer[0].clientWidth;
            },
            onlyShowCurrentIndicator = function(){
                $indicatorContainer[0].classList.add('small');
                updateBar();
            },
            showAllIndicators = function(){
                $indicatorContainer[0].classList.remove('small');
                updateBar();
            },
            //makes sure there's still room for the step indicators, has a debounce on it so it
            //doesn't fire too often.
            makeSureTheresRoom = debounce(function(){
                updateBar();
                var indicatorsWidth=getIndicatorsWidth();
                var indicatorContainerWidth=getIndicatorContainerWidth();
                if((indicatorContainerWidth < indicatorsWidth) &&
                        (indicatorContainerWidth < (Math.max((scope.indicatorsWidth || 0),indicatorsWidth)))){
                    scope.indicatorsWidth=indicatorsWidth;
                    onlyShowCurrentIndicator();
                }
                else if(indicatorContainerWidth > scope.indicatorsWidth){
                    showAllIndicators();
                }
            }, 40),
            watchForWindowResize = function(){
                $window.bind('resize',function(){
                    makeSureTheresRoom();
                });
            },
            listenForLanguageChange = function(){
                scope.$on('languageChange',function(){
                    showAllIndicators();
                    makeSureTheresRoom();
                });
            },
            calculateWhereToScroll = function(){
                var wizardOffset;
                $cuiExpandableTitle=angular.element(elem[0].querySelector('cui-expandable.mobile-element>cui-expandable-title'))
                if($cuiExpandableTitle.length!==0) {
                    var titleHeight=$cuiExpandableTitle[0].clientHeight;
                }
                else var titleHeight=0;
                if(snap.length!==0){
                    var snapOffset=snap.scrollTop();
                    wizardOffset=elem[0].getBoundingClientRect().top;
                    scrollTo(snapOffset+wizardOffset+(titleHeight*(scope.currentStep-1)));
                }
                else{
                    var bodyOffset=$body.scrollTop();
                    wizardOffset=elem[0].getBoundingClientRect().top;
                    scrollTo(bodyOffset+wizardOffset+(titleHeight*(scope.currentStep-1)));
                }
            },
            scrollTo = function(position){
                if(snap.length!==0) snap.animate({scrollTop:position},300,'linear');
                else $body.animate({scrollTop:position},300,'linear');
            },
            updateStep = function(){
                attrs.$set('step',scope.currentStep);
            },
            observeStepAttr = function(){
                attrs.$observe('step',function(newStep){
                    if(isNaN(newStep)){
                        scope.currentStep=1;
                    }
                    else if(newStep>numberOfSteps){
                        scope.currentStep=numberOfSteps;
                    }
                    else if(newStep<1){
                        scope.currentStep=1;
                    }
                    else{
                        scope.currentStep=newStep;
                    }
                    updateIndicators();
                });
            };
            init();
        }
    };
}]);

angular.module('cui-ng')
.directive('cuiWizardProto',['$timeout','$compile','$window','$rootScope',function($timeout,$compile,$window,$rootScope){
    return{
        restrict: 'E',
        scope: true,
        link:function(scope,elem,attrs){
            var self;
            var cuiWizard={
                initScope:function(){
                    self=this;
                    Object.keys(self.scope).forEach(function(property){
                        scope[property]=self.scope[property];
                    });
                },
                config:{
                    mobileStack:attrs.mobileStack!==undefined,
                    mobileStackBreakingPoint:parseInt(attrs.mobileStack),
                    clickableIndicators:attrs.clickableIndicators!==undefined,
                    minimumPadding:attrs.minimumPadding || 0,
                    bar:attrs.bar!==undefined
                },
                selectors:{
                    $wizard:angular.element(elem[0]),
                    $steps:angular.element(elem[0].querySelectorAll('step')),
                    $bar:function(){ return (attrs.bar!==undefined && self.selectors.$steps.length > 0) },
                    $indicatorContainer:angular.element(elem[0].querySelectorAll('indicator-container')),
                    $window:angular.element($window),
                    $body:angular.element('body')
                },
                helpers:{
                    isFormValid:function(form){
                        if(!form.$valid){
                            self.helpers.setErrorFieldsToTouched(form);
                            return false;
                        }
                        return true;
                    },
                    setErrorFieldsToTouched:function(form){
                        angular.forEach(form.$error, function (field) {
                            angular.forEach(field, function(errorField){
                                errorField.$setTouched();
                            });
                        });
                    },
                    getStepInfo:function(step){ // step goes from 0 to numberOfSteps
                        var $step=self.selectors.$steps[step];
                        return {
                            title: $step.attributes.title.value,
                            icon: $step.attributes.icon ? $step.attributes.icon.value : false,
                            state: $step.attributes.state ? $step.attributes.state.value: false
                        }
                    },
                    getIconMarkup:function(icon){
                        if(!icon) return '';
                        if(icon.indexOf('.')>-1){ // if it's not an svg
                            return String.prototype.concat(
                                '<div class="icon-container">',
                                    '<div class="icon">',
                                        '<img src="',icon,'" class="cui-icon-rotate"/>',
                                    '</div>',
                                '</div>');
                        }
                        else return String.prototype.concat(
                            '<div class="icon-container">',
                                '<div class="icon">',
                                    '<cui-icon cui-svg-icon="',icon,'"></cui-icon>',
                                '</div>',
                            '</div>');
                    },
                    getNgClickForIndicator:function(stepNumber,stepState){ // stepNUmber from 0 to numberOfSteps
                        if(!self.config.clickableIndicators) return '';
                        else return String.prototype.concat('ng-click="goToStep(', stepNumber+1 , (stepState? ','+ stepState : '') , ')" ');
                    },
                    getIndicatorMarkup:function(stepNumber){ // stepNUmber from 0 to numberOfSteps
                        var step = self.helpers.getStepInfo(stepNumber),
                            indicatorClass;
                        stepNumber+1===self.scope.currentStep ? indicatorClass='active' : stepNumber+1 < self.scope.currentStep ? indicatorClass='visited' : indicatorClass='';
                        return String.prototype.concat(
                            '<span class="step-indicator ', indicatorClass,'"',self.helpers.getNgClickForIndicator(stepNumber,step.state),'>',
                                step.title,self.helpers.getIconMarkup(step.icon),
                            '</span>');
                    },
                    getIndicatorsWidth:function(){
                        var totalWidth=0;
                        self.selectors.$indicators.each(function(i,indicator){
                            totalWidth += $(this).width();
                        });
                        return totalWidth;
                    },
                    thereIsRoomForIndicators:function(){
                        if((self.helpers.getIndicatorsWidth() + (self.config.minimumPadding * ( self.config.numberOfSteps-1 ))) <
                            self.selectors.$indicatorContainer.width()) return true;
                        return false;
                    },
                    debounce:function(func, wait, immediate){
                        var timeout;
                        return function() {
                            var context = this, args = arguments;
                            var later = function() {
                                timeout = null;
                                if (!immediate) {func.apply(context, args);}
                            };
                            var callNow = immediate && !timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                            if (callNow) func.apply(context, args);
                        };
                    },
                    resizeHandler:function(){
                        self.helpers.debounce(function(){
                            self.reRender.bar(self.scope.currentStep);
                            if(self.helpers.thereIsRoomForIndicators() && self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=false;
                                self.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!self.helpers.thereIsRoomForIndicators() && !self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=true;
                                self.selectors.$indicatorContainer.addClass('small');
                            }
                            if(self.config.mobileStack && (self.selectors.$window.width()<=self.config.mobileStackBreakingPoint) && !self.config.mobileMode){
                                self.selectors.$expandables.forEach(function(expandable,e){
                                    expandable.attr('transition-speed',300);
                                });
                                self.config.mobileMode=true;
                            }
                            else if(self.config.mobileStack && (self.selectors.$window.width()>self.config.mobileStackBreakingPoint) && self.config.mobileMode){
                                self.selectors.$expandables.forEach(function(expandable,e){
                                    expandable.attr('transition-speed',0);
                                });
                                self.config.mobileMode=false;
                            }
                        },200)();
                    },
                    scrollToStep:function(newStep){
                        var firstExpandableTitle=angular.element(self.selectors.$expandables[0].children()[0]);
                        var firstExpandableOffset=firstExpandableTitle.offset();
                        var titleHeight=firstExpandableTitle[0].scrollHeight;
                        self.selectors.$body.animate({ scrollTop: firstExpandableOffset.top + (titleHeight*(newStep-1)) } ,300,'linear');
                    }
                },
                scope:{
                    currentStep:Number(elem[0].attributes.step.value),
                    wizardFinished:false,
                    next:function(state){ // state is optional
                        if(state) self.scope.goToState(state);
                        else self.update(self.scope.currentStep+1);
                    },
                    nextWithErrorChecking:function(form,state){
                        if(self.helpers.isFormValid(form)) self.scope.next(state);
                    },
                    previous:function(state){
                        if(state) self.scope.goToSate(state);
                        else self.update(self.scope.currentStep-1);
                    },
                    goToStep:function(newStep,state){
                        if(newStep===self.scope.currentStep) return;
                        if(state) self.scope.goToState(state);
                        self.update(newStep);
                    },
                    goToState:function(state){
                        $rootScope.$broadcast('stepChange',{ state:state,element:elem });
                    }
                },
                watchers:{
                    init:function(){
                        this.windowResize();
                        this.languageChange();
                    },
                    windowResize:function(){
                        self.selectors.$window.bind('resize',self.helpers.resizeHandler);
                    },
                    languageChange:function(){
                        scope.$on('languageChange',function(){
                            if(self.helpers.thereIsRoomForIndicators() && self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=false;
                                self.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!self.helpers.thereIsRoomForIndicators() && !self.config.stepsCollapsed) {
                                self.config.stepsCollapsed=true;
                                self.selectors.$indicatorContainer.addClass('small');
                            }
                            self.reRender.bar(self.scope.currentStep);
                        })
                    }
                },
                render:{
                    indicators:function(){
                        self.selectors.$indicatorContainer.append('<div class="cui-steps"></div>');
                        self.selectors.$stepIndicatorContainer=angular.element(self.selectors.$indicatorContainer[0].querySelector('.cui-steps'));
                        self.selectors.$steps.each(function(i,step){
                            var indicator = angular.element(self.helpers.getIndicatorMarkup(i)),
                                compiledIndicator = $compile(indicator)(scope);
                            self.selectors.$stepIndicatorContainer.append(compiledIndicator);
                        });
                        self.selectors.$indicators=angular.element(self.selectors.$stepIndicatorContainer[0].querySelectorAll('.step-indicator'));
                        self.config.numberOfSteps=self.selectors.$indicators.length;
                    },
                    bar:function(){
                      console.log(self.selectors.$indicators);
                      $timeout(function(){
                        self.selectors.$indicatorContainer.append('<div class="steps-bar"><div class="steps-bar-fill"></div></div>');
                        self.selectors.$bar=angular.element(self.selectors.$indicatorContainer[0].querySelector('.steps-bar'));
                        self.selectors.$barFill=angular.element(self.selectors.$indicatorContainer[0].querySelector('.steps-bar-fill'));
                        self.selectors.$bar[0].style.left=self.selectors.$indicators[0].scrollWidth/2+'px'; // bar starts at the center point of the 1st inicator
                        self.selectors.$bar[0].style.right=self.selectors.$indicators[self.config.numberOfSteps-1].scrollWidth/2+'px'; // ends at center of last indicator
                        if(self.scope.currentStep===1) self.selectors.$barFill[0].style.width='0px';
                        else {
                            self.selectors.$barFill[0].style.width=self.selectors.$indicators[self.scope.currentStep-1].offsetLeft - (self.selectors.$indicators[0]. scrollWidth/2) + (self.selectors.$indicators[self.scope.currentStep-1].scrollWidth/2) + 'px';
                        }
                      })
                    },
                    steps:function(){
                        if(!self.config.mobileStack) return;
                        self.selectors.$expandables=[];
                        self.selectors.$steps.each(function(i,step){
                            var stepInfo=self.helpers.getStepInfo(i);
                            var expandableClass='';
                            if(self.scope.currentStep===i+1) {
                                $(this).addClass('active');
                                expandableClass=' expanded';
                            }
                            var expandable=$($compile( // compile a new expandable
                                String.prototype.concat(
                                    '<cui-expandable class="cui-expandable cui-expandable--wizard',expandableClass,'" transition-speed="0">',
                                        '<cui-expandable-title class="cui-expandable__title cui-expandable__title--wizard">',
                                        self.helpers.getIndicatorMarkup(i),'</cui-expandable-title>',
                                        '<cui-expandable-body class="cui-expandable__body cui-expandable__body--wizard"></cui-expandable-body>',
                                    '</cui-expandable>'
                                )
                            )(scope));
                            expandable.insertBefore($(this));
                            $(this).detach().appendTo(expandable.children()[1]);
                            self.selectors.$expandables.push($(this).parent().parent());
                        });
                    }
                },
                reRender:{
                    indicators:function(newStep,oldStep){ // newStep goes from 1 to numberOfSteps+1
                        self.selectors.$indicators.each(function(i,indicator){
                            if((i+1) < newStep) $(this).addClass('visited');
                            else $(this).removeClass('visited');
                        });
                        self.selectors.$indicators[oldStep-1].classList.remove('active');
                        self.selectors.$indicators[newStep-1].classList.add('active');
                    },
                    steps:function(newStep,oldStep){
                        self.selectors.$expandables.forEach(function(expandable,i){
                            if((i+1) < newStep) $(this).addClass('visited');
                            else $(this).removeClass('visited');
                        });
                        self.selectors.$steps[oldStep-1].classList.remove('active');
                        self.selectors.$steps[newStep-1].classList.add('active');
                        self.selectors.$expandables[oldStep-1].removeClass('expanded');
                        self.selectors.$expandables[newStep-1].addClass('expanded');
                    },
                    indicatorContainer:function(){
                        if(self.helpers.thereIsRoomForIndicators() && self.config.stepsCollapsed) {
                            self.config.stepsCollapsed=false;
                            self.selectors.$indicatorContainer.addClass('small');
                        }
                        else if(!self.helpers.thereIsRoomForIndicators() && !self.config.stepsCollapsed) {
                            self.config.stepsCollapsed=true;
                            self.selectors.$indicatorContainer.addClass('small');
                        }
                    },
                    bar:function(newStep){
                        if(newStep===1) self.selectors.$barFill[0].style.width='0px';
                        else {
                            self.selectors.$barFill[0].style.width=self.selectors.$indicators[newStep-1].offsetLeft - (self.selectors.$indicators[0]. scrollWidth/2) + (self.selectors.$indicators[newStep-1].scrollWidth/2) + 'px';
                        }
                    }
                },
                update:function(newStep,oldStep){
                    if(self.config.mobileMode) self.helpers.scrollToStep(newStep);
                    self.reRender.indicators(newStep,self.scope.currentStep);
                    if(self.config.mobileStack) self.reRender.steps(newStep,self.scope.currentStep);
                    if(self.config.bar) self.reRender.bar(newStep);
                    scope.currentStep=self.scope.currentStep=newStep;
                    if(newStep===self.config.numberOfSteps) scope.wizardFinished=self.scope.wizardFinished=true;
                    attrs.$set('step',newStep);
                }
            };
            cuiWizard.initScope();
            cuiWizard.render.indicators();
            cuiWizard.render.bar();
            cuiWizard.render.steps();
            cuiWizard.watchers.init();
            cuiWizard.selectors.$window.resize();
        }
    };
}]);

angular.module('cui-ng')
.directive('customError', [function(){
  return {
    restrict: 'A',
    require:'ngModel',
    scope:{
      customError: '=customError'
    },
    link: function(scope,ele,attrs,ctrl){
      angular.forEach(scope.customError,function(error,i){
        scope.$watch(scope.customError[i].check,function(isValid){
          ctrl.$setValidity(scope.customError[i].name,isValid);
        });
      });
    }
  };
}]);

angular.module('cui-ng')
.directive('focusIf', ['$timeout',function($timeout){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var dom = $element[0];
            if ($attrs.focusIf) {
                $scope.$watch($attrs.focusIf, focus);
            } else {
                focus(true);
            }
            function focus(condition) {
                if (condition) {
                    $timeout(function() {
                        dom.focus();
                    }, $scope.$eval($attrs.focusDelay) || 0);
                }
            }
        }
    };
}]);

angular.module('cui-ng')
.directive('inlineEdit', ['$compile', '$timeout','$filter', function($compile, $timeout, $filter){
  return {
    restrict: 'E',
    scope:{
      model: '=',
      type: '@',
      options: '=',
      display: '=',
      localData: '=',
      saveCallback: '=onSave',
      tempEditCallback: '=onEdit',
      hideSaveButton: '=hideSaveIf'
    },
    link: function(scope,ele,attrs){
      var inlineEdit={
        init: function(){
          this.scope.init.bind(this)();
          this.scope.watchers.bind(this)();
          this.scope.functions.bind(this)();
          this.render.bind(this)();
        },

        config:{
          valueClass:attrs.valueClass || "cui-field-val__val",
          inputClass:attrs.inputClass || "cui-field-val__val",
          labelClass:attrs.labelClass || "cui-field-val__field",
          wrapperClass:attrs.wrapperClass || "cui-field-val"
        },

        scope:{
          init:function(){
            scope.edit=false;
            scope.focus=false;
          },
          functions:function(){
            scope.toggleEdit=function(){
              scope.focus=scope.edit=!scope.edit;
              if(scope.tempEditCallback) scope.editChangeCallback(scope.edit);
            };
            scope.matchModels=function(){
              scope.editInput=scope.model;
            };
            scope.saveInput=function(){
              scope.model=scope.editInput;
              if(scope.saveCallback) {
                $timeout(function() {
                  scope.saveCallback();
                });
              }
              this.helpers.getDisplayValue();
            }.bind(this);
            scope.parseKeyCode=function(e){
              if(e.keyCode===13) { // if enter is pressed save input and toggle eddit.
                scope.toggleEdit();
                scope.saveInput();
              }
              if(e.keyCode===27) { // if escape is pressed toggle edit and don't save.
                scope.toggleEdit();
              }
            };
            scope.editChangeCallback=function(editMode){
              if(editMode===false) {
                scope.tempEditCallback(undefined);
                return;
              }
              if(scope.tempEditCallback) scope.tempEditCallback(scope.editInput);
            };
          },
          watchers:function(){
            scope.$watch('display',this.helpers.getDisplayValue);
            scope.$watch('model',this.helpers.getDisplayValue);
          }
        },

        helpers:{
          getLabel:function(){
            var label='';
            if(attrs.label!==undefined) return label.concat('{{"', attrs.label,'"| translate}}');
            else if(attrs.name!==undefined) return attrs.name;
            else console.log('Inline-edit needs 1 of the following attributes: label or name.');
          },
          getInput:function(){
            attrs.type=attrs.type || 'text';
            if(attrs.type==='dropdown') return String.prototype.concat(
              '<select ng-model="$parent.editInput" class="',this.config.inputClass,'"',
              'ng-init="matchModels()" ng-options="',attrs.optionsExpression,'" ng-if="edit" ng-change="editChangeCallback()"></select>');
            else if(attrs.type==='auto-complete') return String.prototype.concat('<div auto-complete selected-object="$parent.editInput" local-data="localData"',
              ' search-fields="',attrs.searchFields,'" title-field="',attrs.titleField,'" input-class="',this.config.inputClass,'" ',
              ' match-class="highlight" ng-init="matchModels()" auto-match="true"',
              ' ng-if="edit" ng-keypress="parseKeyCode($event)" initial-value="$parent.editInput.title" input-changed="editChangeCallback()"></div>');
            return String.prototype.concat('<input type="',attrs.type,'" ng-model="$parent.editInput" class="',this.config.inputClass,'" ',
              'ng-init="matchModels()" ng-if="edit" ng-keyup="parseKeyCode($event)" focus-if="focus" ng-change="editChangeCallback()"/>');
          },
          getDisplayValue:function(){
            if(attrs.type==="password") {
              scope.displayValue=Array(scope.model? scope.model.length+1 : 0).join('•');
            }
            else scope.displayValue = scope.display || scope.model;
          }
        },

        render:function(){
          var element= $compile(
            String.prototype.concat(
            '<div class="',this.config.wrapperClass,'">',
                '<span class="',this.config.labelClass,'">',this.helpers.getLabel.call(this),':</span>',
                '<span ng-if="!edit" class="',this.config.valueClass,'">','{{displayValue}}','</span>',this.helpers.getInput.call(this) ,
            '</div>',
            '<span class="cui-link" ng-click="toggleEdit()" ng-if="!edit">',$filter('translate')('cui-edit'),'</span>',
            '<span class="cui-link" ng-if="edit && !hideSaveButton" ng-click="saveInput();toggleEdit();">',$filter('translate')('cui-update'),'</span>',
            '<span class="cui-link" ng-if="edit" ng-click="toggleEdit()">',$filter('translate')('cui-cancel'),'</span>')
          )(scope);
          angular.element(ele[0]).html(element);
        }
      };

      inlineEdit.init();
    }
  };
}]);



angular.module('cui-ng')
.directive('match', ['$parse', matchDirective]);
function matchDirective($parse) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      var checkIfMatch=function(values){
        ctrl.$setValidity('match', values[0] === (values[1] || ''));
      };

      scope.$watch(function () {
        return [scope.$eval(attrs.match), ctrl.$viewValue];
      }, checkIfMatch,true);
    }
  };
}

angular.module('cui-ng')
.directive('offClick', ['$rootScope', '$parse', function ($rootScope, $parse) {
    var id = 0;
    var listeners = {};
    // add variable to detect touch users moving..
    var touchMove = false;

    // Add event listeners to handle various events. Destop will ignore touch events
    document.addEventListener("touchmove", offClickEventHandler, true);
    document.addEventListener("touchend", offClickEventHandler, true);
    document.addEventListener('click', offClickEventHandler, true);

    function targetInFilter(target, elms) {
        if (!target || !elms) return false;
        var elmsLen = elms.length;
        for (var i = 0; i < elmsLen; ++i) {
            var currentElem = elms[i];
            var containsTarget = false;
            try {
                containsTarget = currentElem.contains(target);
            } catch (e) {
                // If the node is not an Element (e.g., an SVGElement) node.contains() throws Exception in IE,
                // see https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
                // In this case we use compareDocumentPosition() instead.
                if (typeof currentElem.compareDocumentPosition !== 'undefined') {
                    containsTarget = currentElem === target || Boolean(currentElem.compareDocumentPosition(target) & 16);
                }
            }

            if (containsTarget) {
                return true;
            }
        }
        return false;
    }

    function offClickEventHandler(event) {
        // If event is a touchmove adjust touchMove state
        if( event.type === 'touchmove' ){
            touchMove = true;
            // And end function
            return false;
        }
        // This will always fire on the touchend after the touchmove runs...
        if( touchMove ){
            // Reset touchmove to false
            touchMove = false;
            // And end function
            return false;
        }
        var target = event.target || event.srcElement;
        angular.forEach(listeners, function (listener, i) {
            if (!(listener.elm.contains(target) || targetInFilter(target, listener.offClickFilter))) {
                $rootScope.$evalAsync(function () {
                    listener.cb(listener.scope, {
                        $event: event
                    });
                });
            }

        });
    }

    return {
        restrict: 'A',
        compile: function ($element, attr) {
            var fn = $parse(attr.offClick);
            return function (scope, element) {
                var elmId = id++;
                var offClickFilter;
                var removeWatcher;

                offClickFilter = document.querySelectorAll(scope.$eval(attr.offClickFilter));

                if (attr.offClickIf) {
                    removeWatcher = $rootScope.$watch(function () {
                        return $parse(attr.offClickIf)(scope);
                    }, function (newVal) {
                        if (newVal) {
                            on();
                        } else if (!newVal) {
                            off();
                        }
                    });
                } else {
                    on();
                }

                attr.$observe('offClickFilter', function (value) {
                    offClickFilter = document.querySelectorAll(scope.$eval(value));
                });

                scope.$on('$destroy', function () {
                    off();
                    if (removeWatcher) {
                        removeWatcher();
                    }
                    element = null;
                });

                function on() {
                    listeners[elmId] = {
                        elm: element[0],
                        cb: fn,
                        scope: scope,
                        offClickFilter: offClickFilter
                    };
                }

                function off() {
                    listeners[elmId] = null;
                    delete listeners[elmId];
                }
            };
        }
    };
}]);


angular.module('cui-ng')
.factory('CuiPasswordInfo',[function(){
    var info={};
    return info;
}])
.factory('CuiPasswordValidators',['CuiPasswordInfo',function(CuiPasswordInfo){
    RegExp.escape = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    var policies={};
    var complex=function(modelValue,viewValue){
        if(!modelValue) return false;
        var numberOfUsedClasses=0;
        if(policies.allowLowerChars){
            if (/.*[a-z].*/.test(viewValue)) numberOfUsedClasses++;
        }
        if(policies.allowUpperChars){
            if (/.*[A-Z].*/.test(viewValue)) numberOfUsedClasses++;
        }
        if(policies.allowSpecialChars){
            if (!(/^[a-z0-9]+$/i.test(viewValue))) numberOfUsedClasses++;
        }
        if(policies.allowNumChars){
            if (/.*[0-9].*/.test(viewValue)) numberOfUsedClasses++;
        }
        return numberOfUsedClasses>=policies.requiredNumberOfCharClasses;
    };
    var validators={
        setPolicies: function(newPolicies){
            policies=newPolicies;
        },
        lowercase: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return /.*[a-z].*/.test(viewValue);
        },
        uppercase: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return /.*[A-Z].*/.test(viewValue);
        },
        number: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return /.*[0-9].*/.test(viewValue);
        },
        special: function(modelValue,viewValue){
            if(!modelValue) return false;
            if(complex(modelValue,viewValue)) return true;
            return !(/^[a-z0-9]+$/i.test(viewValue));
        },
        complex: complex,
        lowercaseNotAllowed: function(modelValue,viewValue){
            return !(/.*[a-z].*/.test(viewValue));
        },
        uppercaseNotAllowed: function(modelValue,viewValue){
            return !(/.*[A-Z].*/.test(viewValue));
        },
        numberNotAllowed: function(modelValue,viewValue){
            return !(/.*[0-9].*/.test(viewValue));
        },
        specialNotAllowed: function(modelValue,viewValue){
            return !(/^[a-z0-9]+$/i.test(viewValue));
        },
        disallowedChars: function(modelValue,viewValue){
            if(!viewValue) return true;
            var valid=true;
            var disallowedChars=[];
            policies.disallowedChars.split('').forEach(function(disallowedChar){
                if(viewValue.indexOf(disallowedChar)>-1){
                    if(valid) valid=false;
                    disallowedChars.push(disallowedChar);
                }
            });
            CuiPasswordInfo.disallowedChars=disallowedChars.join(', ');
            return valid;
        },
        disallowedWords: function(modelValue,viewValue){
            // var regExpString='';
            if(!viewValue) return true;
            var valid=true;
            var disallowedWords=[];
            policies.disallowedWords.forEach(function(word){
                if(viewValue.toUpperCase().indexOf(word.toUpperCase())>-1){
                    if(valid) valid=false;
                    disallowedWords.push(word);
                }
            });
            CuiPasswordInfo.disallowedWords=disallowedWords.join(', ');
            return valid;
        },
        length: function(modelValue,viewValue){
            if(!modelValue) return false;
            return ((viewValue.length<=policies.max) && (viewValue.length>=policies.min));
        }
    };
    return validators;
}])
.factory('CuiPasswordPolicies',['CuiPasswordValidators','CuiPasswordInfo',function(CuiPasswordValidators,CuiPasswordInfo){
    var policies;
    var parsedPolicies={};
    var policy={
        set: function(policies){
            policies=policies;
            this.parse(policies);
        },
        get: function(){
            return parsedPolicies;
        },
        parse: function(policies){
            if(policies.length){ // if we received an array
                policies.forEach(function(policyRulesObject){
                    Object.keys(policyRulesObject).forEach(function(policyKey){
                        parsedPolicies[policyKey]=policyRulesObject[policyKey];
                    });
                });
            }
            else angular.copy(policies,parsedPolicies);
            CuiPasswordInfo.policies=parsedPolicies;
        },
        getValidators: function(){
            var validators={};
            validators.complex=CuiPasswordValidators.complex;

            // if lower chars are not allowed add a check to see if there's a lowercase in the input
            if (parsedPolicies.allowLowerChars) {
                validators.lowercase=CuiPasswordValidators.lowercase;
                validators.lowercaseNotAllowed=function(){ return true ;};
            }
            else {
                validators.lowercase=function() { return true ;};
                validators.lowercaseNotAllowed=CuiPasswordValidators.lowercaseNotAllowed;
            }

            if (parsedPolicies.allowUpperChars) {
                validators.uppercase=CuiPasswordValidators.uppercase;
                validators.uppercaseNotAllowed=function(){ return true ;};
            }
            else {
                validators.uppercase=function(){ return true ;};
                validators.uppercaseNotAllowed=CuiPasswordValidators.uppercaseNotAllowed;
            }

            if (parsedPolicies.allowNumChars){
                validators.number=CuiPasswordValidators.number;
                validators.numberNotAllowed=function(){ return true ;};
            }
            else{
                validators.number=function(){ return true ;};
                validators.numberNotAllowed=CuiPasswordValidators.numberNotAllowed;
            }

            if(parsedPolicies.allowSpecialChars){
                validators.special=CuiPasswordValidators.special;
                validators.specialNotAllowed=function(){ return true ;};
            }
            else{
                validators.special=function(){ return true ;};
                validators.specialNotAllowed=CuiPasswordValidators.specialNotAllowed;
            }

            if(parsedPolicies.disallowedChars){
                validators.disallowedChars=CuiPasswordValidators.disallowedChars;
            }

            if(parsedPolicies.disallowedWords){
                validators.disallowedWords=CuiPasswordValidators.disallowedWords;
            }

            if(parsedPolicies.min || parsedPolicies.max){
                validators.length=CuiPasswordValidators.length;
            }

            return validators;
        }
    };
    return policy;
}])
.directive('passwordValidation', ['CuiPasswordPolicies','CuiPasswordValidators','CuiPasswordInfo','$rootScope',function(CuiPasswordPolicies,CuiPasswordValidators,CuiPasswordInfo,$rootScope){
    return {
        require: 'ngModel',
        scope: {},
        restrict: 'A',
        link: function(scope, elem, attrs, ctrl){
            function getCurrentPasswordPolicies(){ return CuiPasswordInfo.policies };

            scope.$watch(getCurrentPasswordPolicies,function(newPasswordValidationRules){
                if(newPasswordValidationRules) {
                    CuiPasswordValidators.setPolicies(newPasswordValidationRules);
                    angular.forEach(CuiPasswordPolicies.getValidators(),function(checkFunction,validationName){
                      ctrl.$validators[validationName]=checkFunction;
                    });
                    ctrl.$validate();
                    CuiPasswordInfo.errors=ctrl.$error;
                }
            },function(newObj,oldObj){
                return Object.keys(newObj).length!==Object.keys(oldObj).length;
            });
        }
    };
}])
.directive('passwordPopover',['CuiPasswordInfo',function(CuiPasswordInfo){
    return {
        scope:true,
        restrict: 'A',
        link:function(scope,elem,attrs){
            function getCurrentPasswordInfo(){ return CuiPasswordInfo };

            scope.$watch(getCurrentPasswordInfo,function(newPasswordInfo){
                if(newPasswordInfo){
                    Object.keys(newPasswordInfo).forEach(function(key){
                        scope[key]=newPasswordInfo[key];
                    });
                }
            },function(newObj,oldObj){
                return !angular.equals(newObj,oldObj);
            });
        }
    };
}]);

var KEYS = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    delete: 46,
    comma: 188
};

var MAX_SAFE_INTEGER = 9007199254740991;
var SUPPORTED_INPUT_TYPES = ['text', 'email', 'url'];

angular.module('cui-ng')
.directive('tagsInput', ["$timeout", "$document", "$window", "tagsInputConfig", "tiUtil", function($timeout, $document, $window, tagsInputConfig, tiUtil) {
    function TagList(options, events, onTagAdding, onTagRemoving) {
        var self = {}, getTagText, setTagText, tagIsValid;

        getTagText = function(tag) {
            return tiUtil.safeToString(tag[options.displayProperty]);
        };

        setTagText = function(tag, text) {
            tag[options.displayProperty] = text;
        };

        tagIsValid = function(tag) {
            var tagText = getTagText(tag);

            return tagText &&
                   tagText.length >= options.minLength &&
                   tagText.length <= options.maxLength &&
                   options.allowedTagsPattern.test(tagText) &&
                   !tiUtil.findInObjectArray(self.items, tag, options.keyProperty || options.displayProperty) &&
                   onTagAdding({ $tag: tag });
        };

        self.items = [];

        self.addText = function(text) {
            var tag = {};
            setTagText(tag, text);
            return self.add(tag);
        };

        self.add = function(tag) {
            var tagText = getTagText(tag);

            if (options.replaceSpacesWithDashes) {
                tagText = tiUtil.replaceSpacesWithDashes(tagText);
            }

            setTagText(tag, tagText);

            if (tagIsValid(tag)) {
                self.items.push(tag);
                events.trigger('tag-added', { $tag: tag });
            }
            else if (tagText) {
                events.trigger('invalid-tag', { $tag: tag });
            }

            return tag;
        };

        self.remove = function(index) {
            var tag = self.items[index];

            if (onTagRemoving({ $tag: tag }))  {
                self.items.splice(index, 1);
                self.clearSelection();
                events.trigger('tag-removed', { $tag: tag });
                return tag;
            }
        };

        self.select = function(index) {
            if (index < 0) {
                index = self.items.length - 1;
            }
            else if (index >= self.items.length) {
                index = 0;
            }

            self.index = index;
            self.selected = self.items[index];
        };

        self.selectPrior = function() {
            self.select(--self.index);
        };

        self.selectNext = function() {
            self.select(++self.index);
        };

        self.removeSelected = function() {
            return self.remove(self.index);
        };

        self.clearSelection = function() {
            self.selected = null;
            self.index = -1;
        };

        self.clearSelection();

        return self;
    }

    function validateType(type) {
        return SUPPORTED_INPUT_TYPES.indexOf(type) !== -1;
    }

    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            tags: '=ngModel',
            text: '=?',
            onTagAdding: '&',
            onTagAdded: '&',
            onInvalidTag: '&',
            onTagRemoving: '&',
            onTagRemoved: '&',
            onTagClicked: '&'
        },
        replace: false,
        transclude: true,
        templateUrl: 'ngTagsInput/tags-input.html',
        controller: ["$scope", "$attrs", "$element", function($scope, $attrs, $element) {
            $scope.events = tiUtil.simplePubSub();

            tagsInputConfig.load('tagsInput', $scope, $attrs, {
                template: [String, 'ngTagsInput/tag-item.html'],
                type: [String, 'text', validateType],
                placeholder: [String, ''],
                tabindex: [Number, null],
                removeTagSymbol: [String, String.fromCharCode(215)],
                replaceSpacesWithDashes: [Boolean, true],
                minLength: [Number, 3],
                maxLength: [Number, MAX_SAFE_INTEGER],
                addOnEnter: [Boolean, true],
                addOnSpace: [Boolean, false],
                addOnComma: [Boolean, true],
                addOnBlur: [Boolean, true],
                addOnPaste: [Boolean, false],
                pasteSplitPattern: [RegExp, /,/],
                allowedTagsPattern: [RegExp, /.+/],
                enableEditingLastTag: [Boolean, false],
                minTags: [Number, 0],
                maxTags: [Number, MAX_SAFE_INTEGER],
                displayProperty: [String, 'text'],
                keyProperty: [String, ''],
                allowLeftoverText: [Boolean, false],
                addFromAutocompleteOnly: [Boolean, false],
                spellcheck: [Boolean, true]
            });

            $scope.tagList = new TagList($scope.options, $scope.events,
                tiUtil.handleUndefinedResult($scope.onTagAdding, true),
                tiUtil.handleUndefinedResult($scope.onTagRemoving, true));

            this.registerAutocomplete = function() {
                var input = $element.find('input');

                return {
                    addTag: function(tag) {
                        return $scope.tagList.add(tag);
                    },
                    focusInput: function() {
                        input[0].focus();
                    },
                    getTags: function() {
                        return $scope.tagList.items;
                    },
                    getCurrentTagText: function() {
                        return $scope.newTag.text();
                    },
                    getOptions: function() {
                        return $scope.options;
                    },
                    on: function(name, handler) {
                        $scope.events.on(name, handler);
                        return this;
                    }
                };
            };

            this.registerTagItem = function() {
                return {
                    getOptions: function() {
                        return $scope.options;
                    },
                    removeTag: function(index) {
                        if ($scope.disabled) {
                            return;
                        }
                        $scope.tagList.remove(index);
                    }
                };
            };
        }],
        link: function(scope, element, attrs, ngModelCtrl) {
            var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace, KEYS.delete, KEYS.left, KEYS.right],
                tagList = scope.tagList,
                events = scope.events,
                options = scope.options,
                input = element.find('input'),
                validationOptions = ['minTags', 'maxTags', 'allowLeftoverText'],
                setElementValidity;

            setElementValidity = function() {
                ngModelCtrl.$setValidity('maxTags', tagList.items.length <= options.maxTags);
                ngModelCtrl.$setValidity('minTags', tagList.items.length >= options.minTags);
                ngModelCtrl.$setValidity('leftoverText', scope.hasFocus || options.allowLeftoverText ? true : !scope.newTag.text());
            };

            ngModelCtrl.$isEmpty = function(value) {
                return !value || !value.length;
            };

            scope.newTag = {
                text: function(value) {
                    if (angular.isDefined(value)) {
                        scope.text = value;
                        events.trigger('input-change', value);
                    }
                    else {
                        return scope.text || '';
                    }
                },
                invalid: null
            };

            scope.track = function(tag) {
                return tag[options.keyProperty || options.displayProperty];
            };

            scope.$watch('tags', function(value) {
                if (value) {
                    tagList.items = tiUtil.makeObjectArray(value, options.displayProperty);
                    scope.tags = tagList.items;
                }
                else {
                    tagList.items = [];
                }
            });

            scope.$watch('tags.length', function() {
                setElementValidity();

                // ngModelController won't trigger validators when the model changes (because it's an array),
                // so we need to do it ourselves. Unfortunately this won't trigger any registered formatter.
                ngModelCtrl.$validate();
            });

            attrs.$observe('disabled', function(value) {
                scope.disabled = value;
            });

            scope.eventHandlers = {
                input: {
                    keydown: function($event) {
                        events.trigger('input-keydown', $event);
                    },
                    focus: function() {
                        if (scope.hasFocus) {
                            return;
                        }

                        scope.hasFocus = true;
                        events.trigger('input-focus');
                    },
                    blur: function() {
                        $timeout(function() {
                            var activeElement = $document.prop('activeElement'),
                                lostFocusToBrowserWindow = activeElement === input[0],
                                lostFocusToChildElement = element[0].contains(activeElement);

                            if (lostFocusToBrowserWindow || !lostFocusToChildElement) {
                                scope.hasFocus = false;
                                events.trigger('input-blur');
                            }
                        });
                    },
                    paste: function($event) {
                        $event.getTextData = function() {
                            var clipboardData = $event.clipboardData || ($event.originalEvent && $event.originalEvent.clipboardData);
                            return clipboardData ? clipboardData.getData('text/plain') : $window.clipboardData.getData('Text');
                        };
                        events.trigger('input-paste', $event);
                    }
                },
                host: {
                    click: function() {
                        if (scope.disabled) {
                            return;
                        }
                        input[0].focus();
                    }
                },
                tag: {
                    click: function(tag) {
                        events.trigger('tag-clicked', { $tag: tag });
                    }
                }
            };

            events
                .on('tag-added', scope.onTagAdded)
                .on('invalid-tag', scope.onInvalidTag)
                .on('tag-removed', scope.onTagRemoved)
                .on('tag-clicked', scope.onTagClicked)
                .on('tag-added', function() {
                    scope.newTag.text('');
                })
                .on('tag-added tag-removed', function() {
                    scope.tags = tagList.items;
                    // Ideally we should be able call $setViewValue here and let it in turn call $setDirty and $validate
                    // automatically, but since the model is an array, $setViewValue does nothing and it's up to us to do it.
                    // Unfortunately this won't trigger any registered $parser and there's no safe way to do it.
                    ngModelCtrl.$setDirty();
                })
                .on('invalid-tag', function() {
                    scope.newTag.invalid = true;
                })
                .on('option-change', function(e) {
                    if (validationOptions.indexOf(e.name) !== -1) {
                        setElementValidity();
                    }
                })
                .on('input-change', function() {
                    tagList.clearSelection();
                    scope.newTag.invalid = null;
                })
                .on('input-focus', function() {
                    element.triggerHandler('focus');
                    ngModelCtrl.$setValidity('leftoverText', true);
                })
                .on('input-blur', function() {
                    if (options.addOnBlur && !options.addFromAutocompleteOnly) {
                        tagList.addText(scope.newTag.text());
                    }
                    element.triggerHandler('blur');
                    setElementValidity();
                })
                .on('input-keydown', function(event) {
                    var key = event.keyCode,
                        addKeys = {},
                        shouldAdd, shouldRemove, shouldSelect, shouldEditLastTag;

                    if (tiUtil.isModifierOn(event) || hotkeys.indexOf(key) === -1) {
                        return;
                    }

                    addKeys[KEYS.enter] = options.addOnEnter;
                    addKeys[KEYS.comma] = options.addOnComma;
                    addKeys[KEYS.space] = options.addOnSpace;

                    shouldAdd = !options.addFromAutocompleteOnly && addKeys[key];
                    shouldRemove = (key === KEYS.backspace || key === KEYS.delete) && tagList.selected;
                    shouldEditLastTag = key === KEYS.backspace && scope.newTag.text().length === 0 && options.enableEditingLastTag;
                    shouldSelect = (key === KEYS.backspace || key === KEYS.left || key === KEYS.right) && scope.newTag.text().length === 0 && !options.enableEditingLastTag;

                    if (shouldAdd) {
                        tagList.addText(scope.newTag.text());
                    }
                    else if (shouldEditLastTag) {
                        var tag;

                        tagList.selectPrior();
                        tag = tagList.removeSelected();

                        if (tag) {
                            scope.newTag.text(tag[options.displayProperty]);
                        }
                    }
                    else if (shouldRemove) {
                        tagList.removeSelected();
                    }
                    else if (shouldSelect) {
                        if (key === KEYS.left || key === KEYS.backspace) {
                            tagList.selectPrior();
                        }
                        else if (key === KEYS.right) {
                            tagList.selectNext();
                        }
                    }

                    if (shouldAdd || shouldSelect || shouldRemove || shouldEditLastTag) {
                        event.preventDefault();
                    }
                })
                .on('input-paste', function(event) {
                    if (options.addOnPaste) {
                        var data = event.getTextData();
                        var tags = data.split(options.pasteSplitPattern);

                        if (tags.length > 1) {
                            tags.forEach(function(tag) {
                                tagList.addText(tag);
                            });
                            event.preventDefault();
                        }
                    }
                });
        }
    };
}])


/**
 * @ngdoc directive
 * @name tiTagItem
 * @module ngTagsInput
 *
 * @description
 * Represents a tag item. Used internally by the tagsInput directive.
 */
.directive('tiTagItem', ["tiUtil", function(tiUtil) {
    return {
        restrict: 'E',
        require: '^tagsInput',
        template: '<ng-include src="$$template"></ng-include>',
        scope: { data: '=' },
        link: function(scope, element, attrs, tagsInputCtrl) {
            var tagsInput = tagsInputCtrl.registerTagItem(),
                options = tagsInput.getOptions();

            scope.$$template = options.template;
            scope.$$removeTagSymbol = options.removeTagSymbol;

            scope.$getDisplayText = function() {
                return tiUtil.safeToString(scope.data[options.displayProperty]);
            };
            scope.$removeTag = function() {
                tagsInput.removeTag(scope.$index);
            };

            scope.$watch('$parent.$index', function(value) {
                scope.$index = value;
            });
        }
    };
}])


/**
 * @ngdoc directive
 * @name autoComplete
 * @module ngTagsInput
 *
 * @description
 * Provides autocomplete support for the tagsInput directive.
 *
 * @param {expression} source Expression to evaluate upon changing the input content. The input value is available as
 *    $query. The result of the expression must be a promise that eventually resolves to an array of strings.
 * @param {string=} [template=NA] URL or id of a custom template for rendering each element of the autocomplete list.
 * @param {string=} [displayProperty=tagsInput.displayText] Property to be rendered as the autocomplete label.
 * @param {number=} [debounceDelay=100] Amount of time, in milliseconds, to wait before evaluating the expression in
 *    the source option after the last keystroke.
 * @param {number=} [minLength=3] Minimum number of characters that must be entered before evaluating the expression
 *    in the source option.
 * @param {boolean=} [highlightMatchedText=true] Flag indicating that the matched text will be highlighted in the
 *    suggestions list.
 * @param {number=} [maxResultsToShow=10] Maximum number of results to be displayed at a time.
 * @param {boolean=} [loadOnDownArrow=false] Flag indicating that the source option will be evaluated when the down arrow
 *    key is pressed and the suggestion list is closed. The current input value is available as $query.
 * @param {boolean=} [loadOnEmpty=false] Flag indicating that the source option will be evaluated when the input content
 *    becomes empty. The $query variable will be passed to the expression as an empty string.
 * @param {boolean=} [loadOnFocus=false] Flag indicating that the source option will be evaluated when the input element
 *    gains focus. The current input value is available as $query.
 * @param {boolean=} [selectFirstMatch=true] Flag indicating that the first match will be automatically selected once
 *    the suggestion list is shown.
 */
.directive('autoComplete', ["$document", "$timeout", "$sce", "$q", "tagsInputConfig", "tiUtil", function($document, $timeout, $sce, $q, tagsInputConfig, tiUtil) {
    function SuggestionList(loadFn, options, events) {
        var self = {}, getDifference, lastPromise, getTagId;

        getTagId = function() {
            return options.tagsInput.keyProperty || options.tagsInput.displayProperty;
        };

        getDifference = function(array1, array2) {
            return array1.filter(function(item) {
                return !tiUtil.findInObjectArray(array2, item, getTagId(), function(a, b) {
                    if (options.tagsInput.replaceSpacesWithDashes) {
                        a = tiUtil.replaceSpacesWithDashes(a);
                        b = tiUtil.replaceSpacesWithDashes(b);
                    }
                    return tiUtil.defaultComparer(a, b);
                });
            });
        };

        self.reset = function() {
            lastPromise = null;

            self.items = [];
            self.visible = false;
            self.index = -1;
            self.selected = null;
            self.query = null;
        };
        self.show = function() {
            if (options.selectFirstMatch) {
                self.select(0);
            }
            else {
                self.selected = null;
            }
            self.visible = true;
        };
        self.load = tiUtil.debounce(function(query, tags) {
            self.query = query;

            var promise = $q.when(loadFn({ $query: query }));
            lastPromise = promise;

            promise.then(function(items) {
                if (promise !== lastPromise) {
                    return;
                }

                items = tiUtil.makeObjectArray(items.data || items, getTagId());
                items = getDifference(items, tags);
                self.items = items.slice(0, options.maxResultsToShow);

                if (self.items.length > 0) {
                    self.show();
                }
                else {
                    self.reset();
                }
            });
        }, options.debounceDelay);

        self.selectNext = function() {
            self.select(++self.index);
        };
        self.selectPrior = function() {
            self.select(--self.index);
        };
        self.select = function(index) {
            if (index < 0) {
                index = self.items.length - 1;
            }
            else if (index >= self.items.length) {
                index = 0;
            }
            self.index = index;
            self.selected = self.items[index];
            events.trigger('suggestion-selected', index);
        };

        self.reset();

        return self;
    }

    function scrollToElement(root, index) {
        var element = root.find('li').eq(index),
            parent = element.parent(),
            elementTop = element.prop('offsetTop'),
            elementHeight = element.prop('offsetHeight'),
            parentHeight = parent.prop('clientHeight'),
            parentScrollTop = parent.prop('scrollTop');

        if (elementTop < parentScrollTop) {
            parent.prop('scrollTop', elementTop);
        }
        else if (elementTop + elementHeight > parentHeight + parentScrollTop) {
            parent.prop('scrollTop', elementTop + elementHeight - parentHeight);
        }
    }

    return {
        restrict: 'E',
        require: '^tagsInput',
        scope: { source: '&' },
        templateUrl: 'ngTagsInput/auto-complete.html',
        controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
            $scope.events = tiUtil.simplePubSub();

            tagsInputConfig.load('autoComplete', $scope, $attrs, {
                template: [String, 'ngTagsInput/auto-complete-match.html'],
                debounceDelay: [Number, 100],
                minLength: [Number, 3],
                highlightMatchedText: [Boolean, true],
                maxResultsToShow: [Number, 10],
                loadOnDownArrow: [Boolean, false],
                loadOnEmpty: [Boolean, false],
                loadOnFocus: [Boolean, false],
                selectFirstMatch: [Boolean, true],
                displayProperty: [String, '']
            });

            $scope.suggestionList = new SuggestionList($scope.source, $scope.options, $scope.events);

            this.registerAutocompleteMatch = function() {
                return {
                    getOptions: function() {
                        return $scope.options;
                    },
                    getQuery: function() {
                        return $scope.suggestionList.query;
                    }
                };
            };
        }],
        link: function(scope, element, attrs, tagsInputCtrl) {
            var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down],
                suggestionList = scope.suggestionList,
                tagsInput = tagsInputCtrl.registerAutocomplete(),
                options = scope.options,
                events = scope.events,
                shouldLoadSuggestions;

            options.tagsInput = tagsInput.getOptions();

            shouldLoadSuggestions = function(value) {
                return value && value.length >= options.minLength || !value && options.loadOnEmpty;
            };

            scope.addSuggestionByIndex = function(index) {
                suggestionList.select(index);
                scope.addSuggestion();
            };

            scope.addSuggestion = function() {
                var added = false;

                if (suggestionList.selected) {
                    tagsInput.addTag(angular.copy(suggestionList.selected));
                    suggestionList.reset();
                    tagsInput.focusInput();

                    added = true;
                }
                return added;
            };

            scope.track = function(item) {
                return item[options.tagsInput.keyProperty || options.tagsInput.displayProperty];
            };

            tagsInput
                .on('tag-added tag-removed invalid-tag input-blur', function() {
                    suggestionList.reset();
                })
                .on('input-change', function(value) {
                    if (shouldLoadSuggestions(value)) {
                        suggestionList.load(value, tagsInput.getTags());
                    }
                    else {
                        suggestionList.reset();
                    }
                })
                .on('input-focus', function() {
                    var value = tagsInput.getCurrentTagText();
                    if (options.loadOnFocus && shouldLoadSuggestions(value)) {
                        suggestionList.load(value, tagsInput.getTags());
                    }
                })
                .on('input-keydown', function(event) {
                    var key = event.keyCode,
                        handled = false;

                    if (tiUtil.isModifierOn(event) || hotkeys.indexOf(key) === -1) {
                        return;
                    }

                    if (suggestionList.visible) {

                        if (key === KEYS.down) {
                            suggestionList.selectNext();
                            handled = true;
                        }
                        else if (key === KEYS.up) {
                            suggestionList.selectPrior();
                            handled = true;
                        }
                        else if (key === KEYS.escape) {
                            suggestionList.reset();
                            handled = true;
                        }
                        else if (key === KEYS.enter || key === KEYS.tab) {
                            handled = scope.addSuggestion();
                        }
                    }
                    else {
                        if (key === KEYS.down && scope.options.loadOnDownArrow) {
                            suggestionList.load(tagsInput.getCurrentTagText(), tagsInput.getTags());
                            handled = true;
                        }
                    }

                    if (handled) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        return false;
                    }
                });

            events.on('suggestion-selected', function(index) {
                scrollToElement(element, index);
            });
        }
    };
}])


.directive('tiAutocompleteMatch', ["$sce", "tiUtil", function($sce, tiUtil) {
    return {
        restrict: 'E',
        require: '^autoComplete',
        template: '<ng-include src="$$template"></ng-include>',
        scope: { data: '=' },
        link: function(scope, element, attrs, autoCompleteCtrl) {
            var autoComplete = autoCompleteCtrl.registerAutocompleteMatch(),
                options = autoComplete.getOptions();

            scope.$$template = options.template;
            scope.$index = scope.$parent.$index;

            scope.$highlight = function(text) {
                if (options.highlightMatchedText) {
                    text = tiUtil.safeHighlight(text, autoComplete.getQuery());
                }
                return $sce.trustAsHtml(text);
            };
            scope.$getDisplayText =  function() {
                return tiUtil.safeToString(scope.data[options.displayProperty || options.tagsInput.displayProperty]);
            };
        }
    };
}])

.directive('tiTranscludeAppend', function() {
    return function(scope, element, attrs, ctrl, transcludeFn) {
        transcludeFn(function(clone) {
            element.append(clone);
        });
    };
})

.directive('tiAutosize', ["tagsInputConfig", function(tagsInputConfig) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            var threshold = tagsInputConfig.getTextAutosizeThreshold(),
                span, resize;

            span = angular.element('<span class="cui-tags__registered-tag"></span>');
            span.css('display', 'none')
                .css('visibility', 'hidden')
                .css('width', 'auto')
                .css('white-space', 'pre');

            element.parent().append(span);

            resize = function(originalValue) {
                var value = originalValue, width;

                if (angular.isString(value) && value.length === 0) {
                    value = attrs.placeholder;
                }

                if (value) {
                    span.text(value);
                    span.css('display', '');
                    width = span.prop('offsetWidth');
                    span.css('display', 'none');
                }

                element.css('width', width ? width + threshold + 'px' : '');

                return originalValue;
            };

            ctrl.$parsers.unshift(resize);
            ctrl.$formatters.unshift(resize);

            attrs.$observe('placeholder', function(value) {
                if (!ctrl.$modelValue) {
                    resize(value);
                }
            });
        }
    };
}])

.directive('tiBindAttrs', function() {
    return function(scope, element, attrs) {
        scope.$watch(attrs.tiBindAttrs, function(value) {
            angular.forEach(value, function(value, key) {
                attrs.$set(key, value);
            });
        }, true);
    };
})

.provider('tagsInputConfig', function() {
    var globalDefaults = {},
        interpolationStatus = {},
        autosizeThreshold = 3;

    /**
     * @ngdoc method
     * @name tagsInputConfig#setDefaults
     * @description Sets the default configuration option for a directive.
     *
     * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
     * @param {object} defaults Object containing options and their values.
     *
     * @returns {object} The service itself for chaining purposes.
     */
    this.setDefaults = function(directive, defaults) {
        globalDefaults[directive] = defaults;
        return this;
    };

    /**
     * @ngdoc method
     * @name tagsInputConfig#setActiveInterpolation
     * @description Sets active interpolation for a set of options.
     *
     * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
     * @param {object} options Object containing which options should have interpolation turned on at all times.
     *
     * @returns {object} The service itself for chaining purposes.
     */
    this.setActiveInterpolation = function(directive, options) {
        interpolationStatus[directive] = options;
        return this;
    };

    /**
     * @ngdoc method
     * @name tagsInputConfig#setTextAutosizeThreshold
     * @description Sets the threshold used by the tagsInput directive to re-size the inner input field element based on its contents.
     *
     * @param {number} threshold Threshold value, in pixels.
     *
     * @returns {object} The service itself for chaining purposes.
     */
    this.setTextAutosizeThreshold = function(threshold) {
        autosizeThreshold = threshold;
        return this;
    };

    this.$get = ["$interpolate", function($interpolate) {
        var converters = {};
        converters[String] = function(value) { return value; };
        converters[Number] = function(value) { return parseInt(value, 10); };
        converters[Boolean] = function(value) { return value.toLowerCase() === 'true'; };
        converters[RegExp] = function(value) { return new RegExp(value); };

        return {
            load: function(directive, scope, attrs, options) {
                var defaultValidator = function() { return true; };

                scope.options = {};

                angular.forEach(options, function(value, key) {
                    var type, localDefault, validator, converter, getDefault, updateValue;

                    type = value[0];
                    localDefault = value[1];
                    validator = value[2] || defaultValidator;
                    converter = converters[type];

                    getDefault = function() {
                        var globalValue = globalDefaults[directive] && globalDefaults[directive][key];
                        return angular.isDefined(globalValue) ? globalValue : localDefault;
                    };

                    updateValue = function(value) {
                        scope.options[key] = value && validator(value) ? converter(value) : getDefault();
                    };

                    if (interpolationStatus[directive] && interpolationStatus[directive][key]) {
                        attrs.$observe(key, function(value) {
                            updateValue(value);
                            scope.events.trigger('option-change', { name: key, newValue: value });
                        });
                    }
                    else {
                        updateValue(attrs[key] && $interpolate(attrs[key])(scope.$parent));
                    }
                });
            },
            getTextAutosizeThreshold: function() {
                return autosizeThreshold;
            }
        };
    }];
})

.factory('tiUtil', ["$timeout", function($timeout) {
    var self = {};

    self.debounce = function(fn, delay) {
        var timeoutId;
        return function() {
            var args = arguments;
            $timeout.cancel(timeoutId);
            timeoutId = $timeout(function() { fn.apply(null, args); }, delay);
        };
    };

    self.makeObjectArray = function(array, key) {
        if (!angular.isArray(array) || array.length === 0 || angular.isObject(array[0])) {
            return array;
        }

        var newArray = [];
        array.forEach(function(item) {
            var obj = {};
            obj[key] = item;
            newArray.push(obj);
        });
        return newArray;
    };

    self.findInObjectArray = function(array, obj, key, comparer) {
        var item = null;
        comparer = comparer || self.defaultComparer;

        array.some(function(element) {
            if (comparer(element[key], obj[key])) {
                item = element;
                return true;
            }
        });

        return item;
    };

    self.defaultComparer = function(a, b) {
        // I'm aware of the internationalization issues regarding toLowerCase()
        // but I couldn't come up with a better solution right now
        return self.safeToString(a).toLowerCase() === self.safeToString(b).toLowerCase();
    };

    self.safeHighlight = function(str, value) {
        if (!value) {
            return str;
        }

        function escapeRegexChars(str) {
            return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
        }

        str = self.encodeHTML(str);
        value = self.encodeHTML(value);

        var expression = new RegExp('&[^;]+;|' + escapeRegexChars(value), 'gi');
        return str.replace(expression, function(match) {
            return match.toLowerCase() === value.toLowerCase() ? '<em>' + match + '</em>' : match;
        });
    };

    self.safeToString = function(value) {
        return angular.isUndefined(value) || value === null ? '' : value.toString().trim();
    };

    self.encodeHTML = function(value) {
        return self.safeToString(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    self.handleUndefinedResult = function(fn, valueIfUndefined) {
        return function() {
            var result = fn.apply(null, arguments);
            return angular.isUndefined(result) ? valueIfUndefined : result;
        };
    };

    self.replaceSpacesWithDashes = function(str) {
        return self.safeToString(str).replace(/\s/g, '-');
    };

    self.isModifierOn = function(event) {
        return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
    };

    self.simplePubSub = function() {
        var events = {};
        return {
            on: function(names, handler) {
                names.split(' ').forEach(function(name) {
                    if (!events[name]) {
                        events[name] = [];
                    }
                    events[name].push(handler);
                });
                return this;
            },
            trigger: function(name, args) {
                var handlers = events[name] || [];
                handlers.every(function(handler) {
                    return self.handleUndefinedResult(handler, true)(args);
                });
                return this;
            }
        };
    };

    return self;
}])

.run(["$templateCache", function($templateCache) {
    $templateCache.put('ngTagsInput/tags-input.html',
    "<div class=\"cui-tags__host\" tabindex=\"-1\" ng-click=\"eventHandlers.host.click()\" ti-transclude-append><div class=\"cui-tags__container\" ng-class=\"{'cui-tags__container--focused': hasFocus}\"><ul class=\"cui-tags__tag-list\"><li class=\"cui-tags__tag\" ng-repeat=\"tag in tagList.items track by track(tag)\" ng-class=\"{'cui-tags__tag--selected': tag == tagList.selected }\" ng-click=\"eventHandlers.tag.click(tag)\"><ti-tag-item data=\"::tag\"></ti-tag-item></li></ul><input class=\"cui-tags__input\" autocomplete=\"off\" ng-model=\"newTag.text\" ng-model-options=\"{getterSetter: true}\" ng-keydown=\"eventHandlers.input.keydown($event)\" ng-focus=\"eventHandlers.input.focus($event)\" ng-blur=\"eventHandlers.input.blur($event)\" ng-paste=\"eventHandlers.input.paste($event)\" ng-trim=\"false\" ng-class=\"{'cui-tags__input--invalid': newTag.invalid}\" ng-disabled=\"disabled\" ti-bind-attrs=\"{type: options.type, placeholder: options.placeholder, tabindex: options.tabindex, spellcheck: options.spellcheck}\" ti-autosize></div></div>"
  );

  $templateCache.put('ngTagsInput/tag-item.html',
    "<span ng-bind=\"$getDisplayText()\"></span> <a class=\"cui-tags__remove\" ng-click=\"$removeTag()\" ng-bind=\"::$$removeTagSymbol\"></a>"
  );

  $templateCache.put('ngTagsInput/auto-complete.html',
    "<div class=\"autocomplete\" ng-if=\"suggestionList.visible\"><ul class=\"suggestion-list\"><li class=\"suggestion-item\" ng-repeat=\"item in suggestionList.items track by track(item)\" ng-class=\"{selected: item == suggestionList.selected}\" ng-click=\"addSuggestionByIndex($index)\" ng-mouseenter=\"suggestionList.select($index)\"><ti-autocomplete-match data=\"::item\"></ti-autocomplete-match></li></ul></div>"
  );

  $templateCache.put('ngTagsInput/auto-complete-match.html',
    "<span ng-bind-html=\"$highlight($getDisplayText())\"></span>"
  );
}]);

angular.module('cui-ng')
.directive('tether',['$timeout','$parse',function($timeout,$parse){
  return {
    restrict:'A',
    scope:false,
    link : function(scope,elem,attrs){
      elem[0].classList.add('hide--opacity'); // this fixes the incorrect positioning when it first renders
      $timeout(function(){
        new Tether({
          element: elem,
          target: attrs.target,
          attachment: attrs.attachment || 'top center',
          targetAttachment: attrs.targetAttachment || 'bottom center',
          offset: attrs.offset || '0 0',
          targetOffset: attrs.targetOffset || '0 0',
          targetModifier: attrs.targetModifier || undefined,
          constrains: $parse(attrs.constrains) || undefined
        });
      }).
      then(function(){
        elem[0].classList.remove('hide--opacity');
      });
    }
  };
}]);

angular.module('cui-ng')
.directive('uiSrefActiveNested',['$state',function($state){
    return{
        restrict:'A',
        scope:{},
        link:function(scope,elem,attrs){
            if(!attrs.uiSref) {
                throw 'ui-sref-active-nested can only be used on elements with a ui-sref attribute';
                return;
            }

            // if this element is a link to a state that is nested
            if(attrs.uiSref.indexOf('.')>-1){
                var parentState=attrs.uiSref.split('.')[0];
            }
            // else if it's a parent state
            else var parentState=attrs.uiSref;
            scope.$on('$stateChangeStart',applyActiveClassIfNestedState);

            function applyActiveClassIfNestedState(e,toState){
                if(toState.name.indexOf('.')>-1 && toState.name.split('.')[0]===parentState){
                    elem[0].classList.add(attrs.uiSrefActiveNested);
                }
                else if(toState.name.indexOf('.')===-1 && toState.name===parentState){
                    elem[0].classList.add(attrs.uiSrefActiveNested);
                }
                else elem[0].classList.remove(attrs.uiSrefActiveNested);
            };
        }
    };
}]);

// how to use:
// .run(['$rootScope', '$state', 'cui.authorization.routing' function($rootScope,$state){
//   $rootScope.$on('$stateChangeStart', function(event, toState){
//     cui.authorization.routing($state,toState,userEntitlements);
//   })
// }])
//
// userEntitlements must be an array of entitlements.
// It will redirect to a state called 'login' if no user is defined
// It will redirect to a state called 'notAuthorized' if the user doesn't have permission
angular.module('cui.authorization',[])
.factory('cui.authorization.routing', ['cui.authorization.authorize', '$timeout',
function (authorize,$timeout){
  var routing = function($rootScope, $state, toState, toParams, fromState, fromParams, userEntitlements){
    var authorized;
    if (toState.access !== undefined) {
      // console.log('Access rules for this route: \n' +
      // 'loginRequired: ' + toState.access.loginRequired + '\n' +
      // 'requiredEntitlements: ' + toState.access.requiredEntitlements);
        authorized = authorize.authorize(toState.access.loginRequired,
             toState.access.requiredEntitlements, toState.access.entitlementType, userEntitlements);
        // console.log('authorized: ' + authorized);
        if (authorized === 'login required') {
            $timeout(function(){
              $state.go('login',toParams).then(function() {
                $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
            });
        } else if (authorized === 'not authorized') {
            $timeout(function(){
              $state.go('notAuthorized',toParams).then(function() {
                  $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
            });
        }
        else if(authorized === 'authorized'){
          $timeout(function(){
            $state.go(toState.name,toParams,{notify:false}).then(function() {
                $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
            });
          });
        }
    }
    else {
      $state.go(toState.name,toParams,{notify:false}).then(function() {
          $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
      });
    }
  };

  return routing;
}])


.factory('cui.authorization.authorize', [
function () {
 var authorize = function (loginRequired, requiredEntitlements, entitlementType, userEntitlements) {
    var loweredPermissions = [],
        hasPermission = true,
        permission, i,
        result='not authorized';
    entitlementType = entitlementType || 'atLeastOne';
    if (loginRequired === true && userEntitlements.length===0) {
        result = 'login required';
    } else if ((loginRequired === true && userEntitlements !== undefined) &&
        (requiredEntitlements === undefined || requiredEntitlements.length === 0)) {
        // Login is required but no specific permissions are specified.
        result = 'authorized';
    } else if (requiredEntitlements) {
        angular.forEach(userEntitlements, function (permission) {
            loweredPermissions.push(permission.toLowerCase());
        });
        for (i = 0; i < requiredEntitlements.length; i++) {
            permission = requiredEntitlements[i].toLowerCase();

            if (entitlementType === 'all') {
                hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                // if all the permissions are required and hasPermission is false there is no point carrying on
                if (hasPermission === false) {
                    break;
                }
            } else if (entitlementType === 'atLeastOne') {
                hasPermission = loweredPermissions.indexOf(permission) > -1;
                // if we only need one of the permissions and we have it there is no point carrying on
                if (hasPermission) {
                    break;
                }
            }
        }
        result = hasPermission ?
                 'authorized' :
                 'not authorized';
    }
    return result;
};

    return {
        authorize: authorize
    };
}])

.directive('cuiAccess',['cui.authorization.authorize',function(authorize){
    return{
        restrict:'A',
        scope: {
            userEntitlements:'=',
            cuiAccess:'='
        },
        link: function(scope,elem,attrs){
            scope.loginRequired= true;
            scope.requiredEntitlements= scope.cuiAccess.requiredEntitlements || [];
            scope.entitlementType= scope.cuiAccess.entitlementType || 'atLeastOne';
            elem=angular.element(elem);
            scope.$watch('userEntitlements',function(){
                var authorized=authorize.authorize(scope.loginRequired, scope.requiredEntitlements, scope.entitlementType, scope.userEntitlements);
                if(authorized!=='authorized'){
                  elem.addClass('hide');
                }
                else{
                    elem.removeClass('hide');
                }
            });
        }
    };
}]);

})(angular);