

// cui-ng build Tue Jun 14 2016 16:16:10

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

angular.module('cui-ng')
.factory('PubSub', ['$timeout', function ($timeout) {
    /**
     * Alias a method while keeping the context correct,
     * to allow for overwriting of target method.
     *
     * @param {String} fn The name of the target method.
     * @returns {Function} The aliased method.
     */
    function alias(fn) {
        return function closure () {
            return this[fn].apply(this, arguments);
        };
    }

    var PubSub = {
        topics: {},    // Storage for topics that can be broadcast or listened to.
        subUid: -1     // A topic identifier.
    };

    /**
     * Subscribe to events of interest with a specific topic name and a
     * callback function, to be executed when the topic/event is observed.
     *
     * @param topic {String} The topic name.
     * @param callback {Function} Callback function to execute on event.
     * @param once {Boolean} Checks if event will be triggered only one time (optional).
     * @returns number token
     */
    PubSub.subscribe = function (topic, callback, once) {
        var token = (this.subUid += 1),
            obj = {};

        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }

        obj.token = token;
        obj.callback = callback;
        obj.once = !!once;

        this.topics[topic].push(obj);

        return token;
    };

    /**
     * Subscribe to events of interest setting a flag
     * indicating the event will be published only one time.
     *
     * @param topic {String} The topic name.
     * @param callback {Function} Callback function to execute on event.
     */
    PubSub.subscribeOnce = function (topic, callback) {
        return this.subscribe(topic, callback, true);
    };

    /**
     * Publish or broadcast events of interest with a specific
     * topic name and arguments such as the data to pass along.
     *
     * @param topic {String} The topic name.
     * @param args {Object || Array} The data to be passed.
     * @return bool false if topic does not exist.
     * @returns bool true if topic exists and event is published.
     */
    PubSub.publish = function (topic, args) {
        var that = this,
            subscribers,
            len;

        if (!this.topics[topic]) {
            return false;
        }

        $timeout(function () {
            subscribers = that.topics[topic];
            len = subscribers ? subscribers.length : 0;

            while (len) {
                len -= 1;
                subscribers[len].callback(topic, args);

                // Unsubscribe from event based on tokenized reference,
                // if subscriber's property once is set to true.
                if (subscribers[len].once === true) {
                    that.unsubscribe(subscribers[len].token);
                }
            }
        }, 0);

        return true;
    };

    /**
     * Unsubscribe from a specific topic, based on  the topic name,
     * or based on a tokenized reference to the subscription.
     *
     * @param t {String || Object} Topic name or subscription referenece.
     * @returns {*} bool false if argument passed does not match a subscribed event.
     */
    PubSub.unsubscribe = function (t) {
        var prop,
            len,
            tf = false;

        for (prop in this.topics) {
            if (this.topics.hasOwnProperty(prop)) {
                if (this.topics[prop]) {
                    len = this.topics[prop].length;

                    while (len) {
                        len -= 1;

                        // If t is a tokenized reference to the subscription.
                        // Removes one subscription from the array.
                        if (this.topics[prop][len].token === t) {
                            this.topics[prop].splice(len, 1);
                            return t;
                        }

                        // If t is the event type.
                        // Removes all the subscriptions that match the event type.
                        if (prop === t) {
                            this.topics[prop].splice(len, 1);
                            tf = true;
                        }
                    }

                    if (tf === true) {
                        return t;
                    }
                }
            }
        }

        return false;
    };

    /**
     * Alias for public methods.
     * subscribe     -> on
     * subscribeOnce -> once
     * publish       -> trigger
     * unsubscribe   -> off
     */
    PubSub.on = alias('subscribe');
    PubSub.once = alias('subscribeOnce');
    PubSub.trigger = alias('publish');
    PubSub.off = alias('unsubscribe');

    return PubSub;
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
.directive('classToggle',[() => {
    return{
        restrict:'EAC',
        scope: true,
        link:(scope,elem,attrs) => {
            const toggledClass=attrs.toggledClass || 'class-toggle-' + scope.$id,
                elementClass = () => elem.attr('class') || '',
                checkIfToggled = (elementClass) => {
                    scope.toggled = elementClass.indexOf(toggledClass) >= 0
                };

            scope.toggleClass = () => {
                elem.toggleClass(toggledClass);
            };
            scope.toggleOn = () => {
                if(!scope.toggled) scope.toggleClass();
            };
            scope.toggleOff = () => {
                if(scope.toggled) scope.toggleClass();
            };

            scope.$watch(elementClass, checkIfToggled);
        }
    };
}]);


angular.module('cui-ng')
.directive('cuiAvatar',['$http','$filter',($http,$filter) => {
    return{
        restrict: 'A',
        scope:{
            cuiAvatar:'=',
            cuiAvatarNames:'=',
            cuiAvatarEmail:'='
        },
        compile: () => {
            return {
                pre: (scope,elem,attrs) => {
                    const cuiAvatar = {
                        selectors:{
                            $elem:angular.element(elem[0])
                        },
                        config:{
                            colorClassPrefix:attrs.cuiAvatarColorClassPrefix || false,
                            colorCount:attrs.cuiAvatarColorCount || 0,
                            cuiI18nFilter:angular.isDefined(attrs.cuiAvatarCuii18nFilter) || false,
                            maxNumberOfInitials: attrs.cuiAvatarMaxNumInitials || 2
                        },
                        watchers:() => {
                           scope.$watch('cuiAvatar',(newAvatar) => {
                               if(newAvatar) cuiAvatar.update();
                           });
                            scope.$watch('cuiAvatarNames',(newNameArray) => {
                               if(newNameArray) cuiAvatar.update();
                           });
                           scope.$watch('cuiAvatarEmail',(newEmail) => {
                                if(newEmail) cuiAvatar.update();
                           });
                        },
                        render:{
                            nameBackground:() => {
                                if(cuiAvatar.config.colorClassPrefix) {
                                    if(cuiAvatar.config.colorCount===0) throw 'For cui-avatar if you specify color class prefix you must specify the attribute cui-avatar-color-count';

                                    let colorClassAlreadyApplied = _.find(cuiAvatar.selectors.$elem[0].classList,(className) => className.indexOf(cuiAvatar.config.colorClassPrefix)>-1 );
                                    if(colorClassAlreadyApplied) return;

                                    let classNumberToApply = Math.floor(Math.random()*cuiAvatar.config.colorCount + 1);
                                    cuiAvatar.selectors.$elem[0].classList.add(cuiAvatar.config.colorClassPrefix + classNumberToApply);
                                    cuiAvatar.config.colorClassAdded = cuiAvatar.config.colorClassPrefix + classNumberToApply;
                                }
                            },

                            initials:() => {
                                if (!scope.cuiAvatarNames) return;
                                const name = () => {
                                    let internationalizedName, nameToDisplay = '';
                                    if (cuiAvatar.config.cuiI18nFilter) {
                                        internationalizedName = $filter('cuiI18n')(scope.cuiAvatarNames).split(' ');
                                    }
                                    (internationalizedName || scope.cuiAvatarNames).forEach((nameSection, i) => {
                                        if (i < cuiAvatar.config.maxNumberOfInitials) {
                                            if (!nameSection) return;
                                            nameToDisplay += nameSection[0].toUpperCase();
                                        }
                                    });
                                    return nameToDisplay;
                                };
                                cuiAvatar.selectors.$elem[0].innerHTML = `<div class="cui-avatar__initials"></div>`;
                                cuiAvatar.selectors.$initials = angular.element(cuiAvatar.selectors.$elem[0].childNodes[0]);
                                cuiAvatar.selectors.$initials[0].innerHTML = name();
                            },

                            image:() =>{
                                const applyImage = (imgSrc) => {
                                    if(cuiAvatar.config.colorClassAdded) cuiAvatar.selectors.$elem[0].classList.remove(cuiAvatar.config.colorClassAdded); // remove the random color class added before applying an image
                                    cuiAvatar.selectors.$elem[0].innerHTML = `<div class="cui-avatar__image-container"></div>`;
                                    cuiAvatar.selectors.$image = angular.element(cuiAvatar.selectors.$elem[0].childNodes[0]);
                                    cuiAvatar.selectors.$image[0].style.backgroundImage = `url("${imgSrc}")`;
                                };
                                let img = new Image();
                                if(scope.cuiAvatar && scope.cuiAvatar!==''){
                                    img.src = scope.cuiAvatar;
                                    img.onload = applyImage(img.src);
                                }
                                else if (scope.cuiAvatarEmail){
                                    const hashedEmail = md5(scope.cuiAvatarEmail);
                                    $http.get(`https://www.gravatar.com/avatar/${hashedEmail}?d=404`) // ?d=404 tells gravatar not to give me a default gravatar
                                    .then((res)=> { // If the user has a gravatar account and has set a picture
                                        img.src = `https://www.gravatar.com/avatar/${hashedEmail}`;
                                        img.onload = applyImage(img.src);
                                    });
                                }
                                else return;
                            }
                        },
                        update:() => {
                            cuiAvatar.render.nameBackground();
                            cuiAvatar.render.initials();
                            cuiAvatar.render.image();
                        }
                    };
                    cuiAvatar.render.nameBackground();
                    cuiAvatar.render.initials();
                    cuiAvatar.render.image();
                    cuiAvatar.watchers();
                }
            };
        }
    };
}]);

angular.module('cui-ng')
.directive('cuiDropdown', ['$compile',($compile) => {
    return {
        require:'ngModel',
        restrict: 'E',
        scope: {
            ngModel:'=',
            options:'&',
            constraints: '&'
        },
        link: (scope, elem, attrs, ctrl) => {
            const id=scope.$id, inputName=(`cuiDropdown${id}`);
            let self, newScope, dropdownScope, formName, currentIndex;

            const cuiDropdown = {
                initScope: () => {
                    if(attrs.ngRequired || attrs.required){
                        ctrl.$validators['required'] = () => ctrl.$viewValue!==null;
                    }
                    angular.forEach(cuiDropdown.watchers,(initWatcher) => {
                        initWatcher();
                    });
                    angular.forEach(cuiDropdown.scope,(value,key) => {
                        scope[key]=value;
                    });
                },
                config: {
                    inputClass: attrs.class || 'cui-dropdown',
                    dropdownWrapperClass: attrs.dropdownClass || 'cui-dropdown__wrapper',
                    dropdownItemClass: attrs.dropdownItemClass || 'cui-dropdown__item',
                    attachment: attrs.attachment || 'top left',
                    targetAttachment: attrs.targetAttachment || 'top left',
                    offset: attrs.offset || '0 0',
                    defaultConstraints: [{ to: 'window', attachment: 'together none'}],
                    returnValue: attrs.returnValue,
                    displayValue: attrs.displayValue,
                    required: attrs.ngRequired || attrs.required || false,
                    defaultOption: angular.isDefined(attrs.defaultOption),
                    defaultOptionValue: attrs.defaultOption || '("select-one" | translate)'
                },
                selectors: {
                    $cuiDropdown: angular.element(elem),
                    $body: angular.element(document.body)
                },
                watchers:{
                    dropdownClick:() => {
                        scope.$on(id.toString(),cuiDropdown.helpers.reassignModel); // each dropdown item broadcasts the cui-dropdown scope id and passes the index of the choice
                    },
                    languageChange:() => {
                        scope.$on('languageChange',cuiDropdown.helpers.handleLanguageChange)
                    },
                    options:() => {
                        scope.$watch(scope.options,(newOptions,oldOptions) => {
                            if(newOptions) {
                                cuiDropdown.helpers.setInitialInputValue();
                                cuiDropdown.render.currentValueBox();
                            }
                        },(newOptions,oldOptions) => !angular.equals(newOptions,oldOptions));
                    }
                },
                scope:{
                    toggleDropdown:() => {
                        if(!cuiDropdown.selectors.$dropdown){
                            cuiDropdown.render.dropdown();
                        }
                        else cuiDropdown.scope.destroyDropdown();
                    },
                    destroyDropdown:function(){
                        if(cuiDropdown.selectors.$dropdown) {
                            dropdownScope.$destroy();
                            cuiDropdown.selectors.$dropdown.detach();
                            cuiDropdown.selectors.$dropdown=null;
                        }
                    }
                },
                helpers: {
                    getOptionDisplayValues:() => {
                        let displayValues = [];
                        const { defaultOption, defaultOptionValue, displayValue } = cuiDropdown.config;
                        if(defaultOption) displayValues.push(scope.$eval(defaultOptionValue)); // push an empty return option for error handling
                        angular.forEach(scope.options(),(value,key) => {
                            if(!displayValue) displayValues.push(value);

                            else {
                                const displayScope = {
                                    object : value,
                                    value,
                                    key
                                };
                                displayValues.push(scope.$eval(displayValue,displayScope));
                            }
                        });
                        return displayValues;
                    },
                    getOptionReturnValues:() => {
                        let returnValues=[];
                        const { defaultOption, returnValue } = cuiDropdown.config;
                        if(defaultOption) returnValues.push(null); // if there's a default option it won't have any return value
                        angular.forEach(scope.options(),(value,key) => {
                            if(!returnValue) returnValues.push(value);

                            else {
                                const returnScope = {
                                    object : value,
                                    value,
                                    key
                                };
                                returnValues.push(scope.$eval(returnValue,returnScope));
                            }
                        });
                        return returnValues;
                    },
                    getDropdownItem:(index,displayValue) => {
                        let ngClick=`$root.$broadcast('${id}',${index})`;
                        return $compile(
                            `<div class="${cuiDropdown.config.dropdownItemClass}" ng-click="${ngClick}">
                                ${displayValue}
                            </div>`
                        )(scope);
                    },
                    setInitialInputValue:() => {
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                        const returnValues = cuiDropdown.helpers.getOptionReturnValues();
                        if(!scope.ngModel) {
                            scope.displayValue = displayValues[0];
                            scope.ngModel = returnValues[0];
                            currentIndex = 0;
                            return;
                        }
                        let index = _.findIndex(returnValues, (value) => angular.equals(value,scope.ngModel))
                        if(index > -1){
                            scope.displayValue = displayValues[index];
                            currentIndex = index;
                        }
                        else {
                            scope.displayValue = displayValues[0];
                            scope.ngModel = returnValues[0];
                            currentIndex = 0;
                        }
                    },
                    reassignModel:(e,index) => {
                        if(typeof index === 'number'){
                          currentIndex = index;
                        }
                        else {
                          index = currentIndex;
                        }
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                        const returnValues=cuiDropdown.helpers.getOptionReturnValues();
                        scope.displayValue = displayValues[index];
                        scope.ngModel = returnValues[index];
                        cuiDropdown.scope.destroyDropdown();
                    },
                    handleLanguageChange:() => {
                        cuiDropdown.helpers.reassignModel();
                    }
                },
                render: {
                    currentValueBox: () => {
                        if(newScope) newScope.$destroy(); // this makes sure that if the input has been rendered once the off click handler is removed
                        newScope = scope.$new();
                        const element = $compile(
                            `<div class="${cuiDropdown.config.inputClass}" ng-click="toggleDropdown()" off-click="destroyDropdown()" id="cui-dropdown-${id}">
                                {{displayValue}}
                            </div>`
                        )(newScope);
                        cuiDropdown.selectors.$cuiDropdown.replaceWith(element);
                        cuiDropdown.selectors.$cuiDropdown=element;
                    },
                    dropdown: () => {
                        if(dropdownScope) dropdownScope.$destroy();
                        dropdownScope = scope.$new();
                        const dropdown = $compile(`<div class="${cuiDropdown.config.dropdownWrapperClass}" off-click-filter="'#cui-dropdown-${id}'"></div>`)(dropdownScope);
                        const displayValues=cuiDropdown.helpers.getOptionDisplayValues();
                        displayValues.forEach((value,i) => {
                            dropdown.append(cuiDropdown.helpers.getDropdownItem(i,value));
                        });
                        dropdown.width(cuiDropdown.selectors.$cuiDropdown.outerWidth() * 0.9);
                        cuiDropdown.selectors.$dropdown = dropdown;
                        cuiDropdown.selectors.$body.append(dropdown);
                        new Tether({
                            element:cuiDropdown.selectors.$dropdown[0],
                            target:cuiDropdown.selectors.$cuiDropdown[0],
                            attachment:cuiDropdown.config.attachment,
                            targetAttachment:cuiDropdown.config.targetAttachment,
                            constraints:scope.constraints() || cuiDropdown.config.defaultConstraints
                        });
                    }
                }
            };
            cuiDropdown.initScope();
        }
    };

}]);

angular.module('cui-ng')
.directive('cuiExpandable',['$compile',($compile) => {
    return{
        restrict:'E',
        transclude: true,
        link: (scope, elem, attrs, ctrl, transclude) => {
            const newScope = scope.$parent.$new()
            scope.$on('$destroy',() => newScope.$destroy())

            transclude(newScope, (clone, innerScope) => {
                elem.append(clone)
            })

            const expandableBody = angular.element(elem[0].querySelector('cui-expandable-body'))
            expandableBody.hide() // hide the body by default

            const toggleClass = () => {
                elem.toggleClass('expanded')
            }
            const toggleBody = () => {
                expandableBody.animate({'height':'toggle'}, parseInt(elem.attr('transition-speed') || 300) ,'linear')
            }

            newScope.toggleExpand = (event) => {
                // this way labels won't toggle expand twice
                if(event && event.target.tagName==='INPUT' && event.target.labels && event.target.labels.length > 0 ) return;
                toggleClass();
            }
            newScope.expand = () => {
                if(!newScope.expanded) toggleClass();
            }
            newScope.collapse = () => {
                if(newScope.expanded) toggleClass()
            }
            newScope.$watch(() => elem.attr('class') || '' , (newValue,oldValue) => {
                if(oldValue === newValue && newValue.indexOf('expanded') > -1 ){ // if the element the expanded class put in by default
                    newScope.expanded = true
                    toggleBody()
                }
                else if(newValue.indexOf('expanded') === -1){
                    if(newScope.expanded===true) toggleBody()
                    newScope.expanded=false
                }
                else{
                    if(newScope.expanded===false) toggleBody()
                    newScope.expanded=true
                }
            })
        }
    }
}])

angular.module('cui-ng')
.provider('$cuiIcon', [function(){
    let iconSets={};

    this.iconSet = (namespace,path,viewBox) => {
        iconSets[namespace]={path,viewBox};
    };

    this.getIconSets = () => iconSets;

    this.getIconSet = (namespace) => {
        if(!iconSets[namespace]) {
            throw new Error(`The icon collection with the namespace ${namespace} is not yet defined in the $cuiIcon provider.`);
        }
        return iconSets[namespace];
    };

    this.$get = function(){
        return this;
    };
}]);

angular.module('cui-ng')
.directive('cuiIcon',['$cuiIcon',($cuiIcon) => {
    return {
        restrict:'E',
        scope:{},
        link:(scope,elem,attrs) => {
            const icon = attrs.cuiSvgIcon;

            let viewBox, preserveaspectratio, svgClass, path;

            attrs.preserveaspectratio ? preserveaspectratio = `preserveAspectRatio="${attrs.preserveaspectratio}"` : preserveaspectratio = '';
            attrs.svgClass? svgClass = `class="${attrs.svgClass}"` : svgClass = '';
            attrs.viewbox? viewBox=`viewBox="${attrs.viewbox}"` : viewBox='';

            if(icon && icon.indexOf('.svg')>-1){ // if the path is directly specified
                path = icon;
            }
            else if(icon){ // if the icon is pointing at a namespace put into the provider
                const [ iconNamespace, iconId] = icon.split(':');
                path = $cuiIcon.getIconSet(iconNamespace).path + '#' + iconId;
                if(viewBox==='' && $cuiIcon.getIconSet(iconNamespace).viewBox){
                    viewBox=' viewBox="' + $cuiIcon.getIconSet(iconNamespace).viewBox + '" ';
                }
            }
            else throw new Error('You need to define a cui-svg-icon attribute for cui-icon');
            const newSvg = $(
                `<svg xmlns="http://www.w3.org/2000/svg" ${preserveaspectratio} ${svgClass} ${viewBox}>
                    <use xlink:href="${path}"></use>
                </svg>`
            );

            angular.element(elem).replaceWith(newSvg);
        }
    };
}]);

angular.module('cui-ng')
.factory('CuiPopoverHelpers',[()=>{
    const cuiPopoverHelpers = {
        getResetStyles : () => {
            return {
                'margin-right':'',
                'margin-left':'',
                'margin-bottom':'',
                'margin-top':'',
                'left':'',
                'top':'',
                'bottom':'',
                'right':''
            };
        },
        getAttachmentFromPosition : (position) => {
            switch(position) {
                case 'top':
                    return 'bottom center';
                case 'bottom':
                    return 'top center';
                case 'right':
                    return 'middle left';
                case 'left':
                    return 'middle right';
            };
        },
        invertAttachmentPartial : (partial) => {
            switch (partial) {
                case 'top':
                    return 'bottom';
                case 'bottom':
                    return 'top';
                case 'left':
                    return 'right';
                case 'right':
                    return 'left';
            };
        },
        parsePositionArray : (positionArray) => {
            const genericPositions = [{position:'bottom'},
                                    {position:'top'},
                                    {position:'right'},
                                    {position:'left'}]; // these are objects to facilitate the reposition function
            let positions=[];
            if(typeof positionArray==='undefined'){
                positions.push.apply(positions,genericPositions);
            }
            else {
                positionArray.forEach((position,i) => {
                    switch(position){
                        case 'any':
                            positions.push.apply(positions,genericPositions);
                            break;
                        case 'invert':
                            positions.push(Object.assign({},positionArray[i-1],{position:cuiPopoverHelpers.invertAttachmentPartial(positionArray[i-1].position)}));
                            break;
                        default:
                            positions.push(position);
                    };
                });
            }
            return positions;
        },
        parseOffset : (offset) => {
            const splitOffset = offset.split(' ');
            const verticalOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(splitOffset[0]);
            const horizontalOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(splitOffset[1]);

            return { verticalOffset, horizontalOffset };
        },
        parseAttachment : (attachment) => {
            const [ verticalAttachment , horizontalAttachment ] = attachment.split(' ');
            return { verticalAttachment, horizontalAttachment };
        },
        getTetherOffset: (position, offset) => {
            const { verticalOffset , horizontalOffset } = cuiPopoverHelpers.parseOffset(offset);

            switch (position){
                case 'top':
                case 'bottom':
                    return '0 ' + (horizontalOffset.amount * -1) + horizontalOffset.units;
                default:
                    return (verticalOffset.amount * -1) + verticalOffset.units + ' 0';
            };
        },
        invertAttachment: (attachment) => {
            const { verticalAttachment, horizontalAttachment } = cuiPopoverHelpers.parseAttachment(attachment);
            return invertAttachmentPartial(verticalAttachment) + ' ' + invertAttachmentPartial(horizontalAttachment);
        },
        getOffsetAndUnitsOfOffset: (offsetPartial) => {
            let amount,units;
            switch (offsetPartial.indexOf('%')){
                case -1 :
                    amount  = window.parseInt(offsetPartial.split('px')[0]);
                    units = 'px';
                    break;
                default :
                    amount = window.parseInt(offsetPartial.split('%')[0]);
                    units = '%';
            };
            return { amount, units };
        },
        getPointerOffset:(opts) => {
            const { position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover } = opts;
            const contentOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(offsetBetweenPointerAndContent);
            const contentOffsetCompensation = () => {
                switch (position) {
                    case 'top':
                    case 'bottom':
                        return {'margin-left':'50%', 'left': (contentOffset.amount * -1) + contentOffset.units};
                    case 'left':
                    case 'right':
                        switch (contentOffset.amount){
                            case 0:
                                return {'top':'50%'};
                            default:
                                let topMargin;
                                contentOffset.units === '%'? topMargin = containerHeight * ((contentOffset.amount * -1) /100) : topMargin = contentOffset.amount + contentOffset.units;
                                return { 'top':'50%', 'margin-top': topMargin };
                        };
                };
            }

            const containerPadding = cuiPopoverHelpers.getContainerPaddings(opts);
            const pointerOffset = () => {
                switch (position) {
                    case 'top':
                        return {
                            bottom:'1px',
                            transform:'translate(-50%,' + (-Math.ceil(parseFloat(containerPadding['padding-bottom'])) + pointerHeight) + 'px)'
                        };
                    case 'bottom':
                        return {
                            top:'1px',
                            transform: 'translate(-50%,' + (Math.ceil(parseFloat(containerPadding['padding-top'])) - pointerHeight) + 'px)'
                        };
                    case 'left':
                        return {
                            right: (parseFloat(containerPadding['padding-right']) - pointerHeight) + 'px',
                            transform: 'translate(-1px,-50%)'
                        };
                    case 'right':
                        return {
                            left: (parseFloat(containerPadding['padding-left']) - pointerHeight) + 'px',
                            transform: 'translate(1px,-50%)'
                        };
                };
            };

            return Object.assign({}, cuiPopoverHelpers.getResetStyles(), pointerOffset(), contentOffsetCompensation());
        },
        getPointerBorderStyles: (opts) => {
            const { position,pointerHeight,pointerWidth } = opts;
            const transparentHorizontalBorder = pointerWidth + 'px solid transparent';
            const transparentVerticalBorder = pointerHeight + 'px solid transparent';
            if(position === 'top' || position === 'bottom'){
                return {
                    'border-right':transparentHorizontalBorder,
                    'border-left':transparentHorizontalBorder,
                    'border-bottom':transparentVerticalBorder,
                    'border-top':transparentVerticalBorder
                }
            }
            else return {
                'border-right':transparentVerticalBorder,
                'border-left':transparentVerticalBorder,
                'border-bottom':transparentHorizontalBorder,
                'border-top':transparentHorizontalBorder
            }
        },
        getPointerStyles: (opts) => {
            const { element, position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, pointerWidth, containerHeight, containerWidth, distanceBetweenTargetAndPopover } = opts;
            const colorOfPopoverBackground = element.css('backgroundColor'),
                stylesOfVisibleBorder = pointerHeight + 'px solid ' + colorOfPopoverBackground;

            return Object.assign({position:'absolute'},
                    cuiPopoverHelpers.getPointerOffset(opts),
                    cuiPopoverHelpers.getPointerBorderStyles(opts),
                    {['border-' + position] : stylesOfVisibleBorder}
                );
        },
        getPointer:(opts) => {
            const $pointer = $('<span class="cui-popover__pointer"></span>');
            $pointer.css(cuiPopoverHelpers.getPointerStyles(opts));
            return $pointer;
        },
        getPopoverMargins: (position, pointerHeight) => {
            const margin = pointerHeight + 'px';
            return {
                'margin-top': position === 'bottom' ? margin : '',
                'margin-right': position === 'left' ? margin : '',
                'margin-bottom': position === 'top' ? margin : '',
                'margin-left': position === 'right' ? margin : ''
            };
        },
        getContainerPaddings: (opts) => {
            const { position, offsetBetweenPointerAndContent, popoverHeight, popoverWidth, pointerHeight, distanceBetweenTargetAndPopover } = opts;
            const padding = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(distanceBetweenTargetAndPopover);

            let [ paddingTop, paddingBottom, paddingRight, paddingLeft ] = ['','','',''];

            if( position === 'top' || position === 'bottom') {
               let verticalPadding;
               switch(padding.units) {
                   default: // 'px' or ''
                       verticalPadding = padding.amount + padding.units;
                       break;
                   case '%':
                       const heightOfContainer = popoverHeight + pointerHeight;
                       verticalPadding = heightOfContainer * (padding.amount / 100) + 'px';
                };
                position === 'top' ? paddingBottom = verticalPadding : paddingTop = verticalPadding;
            }
            else {
                let horizontalPadding;
                switch(padding.units) {
                    default: // 'px' or ''
                        horizontalPadding = padding.amount + padding.units;
                        break;
                    case '%':
                        const widthOfContainer = popoverWidth + pointerHeight;
                        horizontalPadding = widthOfContainer * (padding.amount / 100) + 'px';
                };
                position === 'left' ? paddingRight = horizontalPadding : paddingLeft = horizontalPadding;
            }

            return {
                'padding-top': paddingTop || '',
                'padding-right': paddingRight || '',
                'padding-bottom': paddingBottom || '',
                'padding-left': paddingLeft || '',
            };
        }
    };

    return cuiPopoverHelpers;

}]);


angular.module('cui-ng')
.directive('cuiPopover', ['CuiPopoverHelpers','$compile','$timeout','$interval', (CuiPopoverHelpers,$compile,$timeout,$interval) => {
    return {
        restrict: 'EA',
        compile: () => {
            return {
                pre: (scope, elem, attrs) =>{
                    let self, popoverTether=[], repositionedTether, tetherAttachmentInterval, targetElementPositionInterval, elementHtmlInterval, elementHtml, cuiPopoverConfig = {}, positions, positionInUse, trialPosition;

                    const cuiPopover = {
                        init:function(){
                            elem.css({opacity:'0', 'pointer-events':'none', position:'fixed', right:'0'}); // hide the original element.

                            self=this;
                            positionInUse = 0; // using the default position when we init
                            if(!attrs.popoverPositions) throw new Error('You must define popover-positions for the cui-popover directive.');
                            positions = scope.$eval(attrs.popoverPositions);
                            positions = CuiPopoverHelpers.parsePositionArray(positions);
                            self.config(positions[positionInUse]);
                            self.selectors[positionInUse]={};
                            $timeout(()=> self.render.popoverContainer(positionInUse));

                            angular.forEach(self.watchers, (initWatcher) => {
                                initWatcher();
                            });
                        },
                        config:(opts) => {
                                const _this = cuiPopoverConfig;
                                _this.element = elem;
                                _this.target = attrs.target;
                                _this.targetModifier = attrs.targetModifier || undefined;

                                _this.pointerHeight = attrs.pointerHeight && window.parseInt(attrs.pointerHeight) || 14;
                                _this.pointerWidth = attrs.pointerWidth && window.parseInt(attrs.pointerWidth) || 9;

                                _this.popoverWidth = elem.outerWidth();
                                _this.popoverHeight = elem.outerHeight();

                                _this.position = opts.position;
                                const popoverOffsetAttribute = (opts && opts.popoverOffset || attrs.popoverOffset || '0 0').split(' ');
                                const offsetBetweenPointerAndContent = (opts && opts.contentOffset || attrs.contentOffset || '0');

                                let offset, targetOffset, targetAndPopoverOffset, pointerOffset, containerWidth, containerHeight;

                                if(_this.position === 'top' || _this.position === 'bottom'){
                                    [ targetAndPopoverOffset, pointerOffset ] = popoverOffsetAttribute;
                                    offset = ['0', offsetBetweenPointerAndContent].join(' ');
                                    targetOffset = ['0', pointerOffset].join(' ');
                                    containerWidth = _this.popoverWidth;
                                    containerHeight = _this.popoverHeight + _this.pointerHeight;
                                }
                                else {
                                    [ pointerOffset, targetAndPopoverOffset ] = popoverOffsetAttribute;
                                    offset = [offsetBetweenPointerAndContent, '0'].join(' ');
                                    targetOffset = [pointerOffset,'0'].join(' ');
                                    containerWidth = _this.popoverWidth + _this.pointerHeight;
                                    containerHeight = _this.popoverHeight;
                                }

                                _this.distanceBetweenTargetAndPopover = targetAndPopoverOffset;
                                _this.offsetBetweenPointerAndContent = offsetBetweenPointerAndContent;
                                _this.offset = offset;
                                _this.targetOffset = targetOffset;
                                _this.containerHeight = containerHeight;
                                _this.containerWidth = containerWidth;

                                _this.attachment = CuiPopoverHelpers.getAttachmentFromPosition(_this.position);
                                _this.targetAttachment = CuiPopoverHelpers.getAttachmentFromPosition(CuiPopoverHelpers.invertAttachmentPartial(_this.position));
                        },
                        helpers: {
                            getTetherOptions:( element = self.selectors.$container[0], opts ) => {
                                const { target, position, offset, targetOffset, targetModifier, attachment, targetAttachment } = opts;
                                return {
                                    target,
                                    targetModifier,
                                    attachment,
                                    targetAttachment,
                                    targetOffset,
                                    offset : CuiPopoverHelpers.getTetherOffset(position,offset),
                                    element : element,
                                    constraints:  [{ to: 'window', attachment: 'none none' }]
                                };
                            }
                        },
                        watchers:{
                            position:() => {
                                tetherAttachmentInterval = $interval(() => {
                                    if(!popoverTether[positionInUse] || !popoverTether[positionInUse].element) return;
                                    if(positions.length === 1) self.newMode('normal');
                                    else {
                                        if(popoverTether[positionInUse].element.classList.contains('tether-out-of-bounds')) self.newMode('try-another');
                                        else self.newMode('normal');
                                    }
                                }, 100);
                            },


                            elementHtml:() => {
                                elementHtmlInterval=$interval(()=>{
                                    let elemHtml = elem.html();
                                    if(elemHtml !== elementHtml) { // if the element html is different than what we have cached
                                        elementHtml = elemHtml;
                                        cuiPopover.render.newHtml(elementHtml);
                                    }
                                }, 100)
                            },

                            targetElementPosition:() => {
                                targetElementPositionInterval=$interval(() => {
                                    scope.targetPosition = self.selectors.$target.offset();
                                }, 50);

                                scope.$watch('targetPosition',(newPosition) => {
                                    newPosition && popoverTether[positionInUse].position();
                                },(newPosition,oldPosition) => newPosition.top !== oldPosition.top || newPosition.left !== oldPosition.left );
                            },

                            scopeDestroy:() => {
                                scope.$on('$destroy',() => {
                                    $interval.cancel(tetherAttachmentInterval);
                                    $interval.cancel(targetElementPositionInterval);
                                    $interval.cancel(elementHtmlInterval);
                                    popoverTether[positionInUse].destroy();
                                    self.selectors[positionInUse].$contentBox && self.selectors[positionInUse].$contentBox.detach();
                                    self.selectors[positionInUse].$container && self.selectors[positionInUse].$container.detach();
                                    self.selectors[positionInUse].$pointer && self.selectors[positionInUse].$pointer.detach();
                                })
                            }
                        },
                        selectors:{
                            $target:angular.element(document.querySelector(attrs.target))
                        },
                        render:{
                            popoverContainer:(positionIndex) => {
                                const { getPointer, getPopoverMargins, getContainerPaddings } = CuiPopoverHelpers;
                                const opts = cuiPopoverConfig;
                                const $container = $('<div class="cui-popover__container"></div>');
                                const $pointer = getPointer(opts);

                                // apply stylings to the container
                                $container.css(getContainerPaddings(opts));
                                self.selectors[positionIndex].$container = $container;
                                self.selectors[positionIndex].$container[0].style.opacity = '0';

                                // append the pointer to the container
                                $container.append($pointer);
                                self.selectors[positionIndex].$pointer = $pointer;

                                const cloneElem = angular.element(elem).clone(true,true);

                                cloneElem.css({opacity:'','pointer-events':'',position:'',right:''});
                                // append the cui-popover to the container and apply the margins to make room for the pointer
                                cloneElem.css(getPopoverMargins(opts.position, opts.pointerHeight));
                                self.selectors[positionIndex].$container.append(cloneElem);
                                self.selectors[positionIndex].$contentBox = cloneElem;



                                angular.element(document.body).append($container);
                                popoverTether[positionIndex] = new Tether(self.helpers.getTetherOptions($container,opts));

                            },
                            newHtml:(newHtml) => {
                                self.selectors[positionInUse].$contentBox = elem.clone(true,true);
                            }
                        },
                        newMode:(newMode) => {
                            const { getPointer, getPopoverMargins, getContainerPaddings } = CuiPopoverHelpers;
                            const opts = cuiPopoverConfig;
                            switch(newMode){
                                case 'normal': // if we can show the popover in the current position
                                    if(self.selectors[positionInUse].$container[0].style.opacity === '0'){
                                        $timeout(()=>{
                                            popoverTether[positionInUse].position();
                                            self.selectors[positionInUse].$container[0].style.opacity = '1';
                                        });
                                    }
                                    break;
                                case 'try-another':
                                    self.tryAnotherPosition();
                                    break;
                            }
                        },
                        tryAnotherPosition:() => {
                            if(typeof trialPosition === 'undefined' && positionInUse===0) trialPosition = 1;
                            else if(typeof trialPosition === 'undefined') trialPosition = 0;
                            else trialPosition ++;

                            if(trialPosition === positionInUse) return;
                            if(trialPosition === positions.length) {
                                trialPosition = undefined; // next tryAnotherPosition will try the first position in the array of positions provided
                                return;
                            }

                            if(trialPosition === positions.length-1){ // if we reached the last position
                                if(positions[trialPosition] === 'hide') { // and none of them were able to show and 'hide' was passed as last fallback, hide element.
                                    if(self.selectors[positionInUse].$container[0].style.opacity === '0') self.selectors[positionInUse].$container[0].style.opacity = '1';
                                    trialPosition = undefined;
                                    return;
                                }
                            }

                            if(typeof self.selectors[trialPosition]!=='undefined') delete self.selectors[trialPosition];
                            self.selectors[trialPosition]={};
                            const opts = positions[trialPosition];
                            self.config(opts);
                            self.render.popoverContainer(trialPosition);


                            if(!popoverTether[trialPosition].element.classList.contains('tether-out-of-bounds')){ // if the new element isn't OOB then use it.
                                self.selectors[positionInUse].$container.detach()
                                popoverTether[positionInUse].destroy();
                                delete self.selectors[positionInUse];
                                positionInUse = trialPosition;
                                trialPosition = undefined;
                                if(self.selectors[positionInUse].$container[0].style.opacity === '0') self.selectors[positionInUse].$container[0].style.opacity = '1';
                            }
                            else { // else just remove all references to it and this function will run again by itself
                                self.selectors[trialPosition].$container.detach()
                                popoverTether[trialPosition].destroy();
                                delete self.selectors[trialPosition];
                            }

                        }
                    };
                    cuiPopover.init();
                }
            };
        }
    };
}]);

const defaults = {
    cuiTreeNest0Class : 'cui-tree--nesting-0',
    cuiTreeNestXClass : 'cui-tree--nested',
    cuiTreeLeafWrapper: '<div class="cui-tree__leaf"></div>',
    cuiTreeLastLeafClass : 'cui-tree__leaf--last',
    cuiTreeBranchWrapper: '<div class="cui-tree__branch"></div>',
    cuiTreeLastBranchClass : 'cui-tree__branch--last',
    cuiTreeNestPrefix : 'cui-tree--nesting-'
};

const cuiTreeHelpers = {
    getDisplayValue:(scope, opts, object) => {
        const { cuiTreeLeafDisplay } = opts;
        let propertiesToDisplay = cuiTreeLeafDisplay.split('+');

        return scope.$eval(cuiTreeLeafDisplay, { object });
    },
    getClassListForNestingLevel: (opts,nesting) => {
        const { cuiTreeNestPrefix, cuiTreeNest0Class, cuiTreeNestXClass } = opts;
        let classList = [];
        switch (nesting){
            case 0:
                classList.push( cuiTreeNest0Class || defaults.cuiTreeNest0Class );
                break;
            default:
                classList.push((cuiTreeNestPrefix || defaults.cuiTreeNestPrefix) + nesting);
                classList.push( cuiTreeNestXClass || defaults.cuiTreeNestXClass );
        };
        return classList;
    },
    getElements : (scope, opts, objects, leafClickCallback, nesting=0) => {
        const { getElements, getDisplayValue, getClassListForNestingLevel } = cuiTreeHelpers;
        const { cuiTreeBranchWrapper, cuiTreeLeafWrapper, cuiTreeLastLeafClass, cuiTreeLastBranchClass } = opts;
        let $node = $(`<div></div>`);
        getClassListForNestingLevel(opts,nesting).forEach(className => $node[0].classList.add(className));
        objects.forEach((object,i) => {
            const $leafInner = $(`<span>${ getDisplayValue(scope, opts, object) }</span>`);
            const $leafWrapper = $(cuiTreeLeafWrapper || defaults.cuiTreeLeafWrapper);
            if(leafClickCallback) $leafWrapper[0].addEventListener("click",function(e){ leafClickCallback(object,this,e) },true);
            $leafWrapper.append($leafInner);
            if(i === objects.length-1) $leafWrapper[0].classList.add(cuiTreeLastLeafClass || defaults.cuiTreeLastLeafClass); // add class to last leaf of each indent level.
            if(object.children) { // if it has children creat a new branch for the leaf and it's children
                const $branchWrapper = $(cuiTreeBranchWrapper || defaults.cuiTreeBranchWrapper).append($leafWrapper);
                if(i === objects.length-1) $branchWrapper[0].classList.add(cuiTreeLastBranchClass || defaults.cuiTreeLastBranchClass);
                $branchWrapper.append(getElements(scope, opts, object.children, leafClickCallback, nesting + 1)); // recursively gets the child nodes
                $node.append($branchWrapper);
            }
            else {
                $node.append($leafWrapper);
            }
        });
        return $node;
    }
};

const cuiTree = {
    pre: (scope,elem,attrs) => {
        let $tree;
        const leafClickCallback = scope.$eval(attrs.cuiTreeLeafClickCallback);

        const renderTree = (tree) => {
            if($tree) {
                $tree.detach();
                $tree.children().unbind();
            }
            $tree = cuiTreeHelpers.getElements(scope, attrs, tree, leafClickCallback);
            elem.append($tree);
        };

        scope.$watch(()=>scope.$eval(attrs.cuiTree),(newTree)=>{
            if(newTree) renderTree(newTree);
        },true);

        scope.$on('$destroy',()=>{
            $tree.children().unbind();
        });
    }
};

angular.module('cui-ng')
.directive('cuiTree',[()=>{
    return {
        restrict:'A',
        scope: true,
        compile: ()=>{
            return cuiTree;
        }
    }
}]);

angular.module('cui-ng')
.directive('cuiWizardProto',['$timeout','$compile','$window','$rootScope','$document',
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
.directive('cuiWizard',['$timeout','$compile','$window','$rootScope',($timeout,$compile,$window,$rootScope) => {
    return{
        restrict: 'E',
        scope: true,
        link:(scope,elem,attrs) => {
            const cuiWizard={
                initScope:() => {
                    Object.keys(cuiWizard.scope).forEach(function(property){
                        scope[property]=cuiWizard.scope[property];
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
                    $indicatorContainer:angular.element(elem[0].querySelectorAll('indicator-container')),
                    $window:angular.element($window),
                    $body:angular.element('body')
                },
                helpers:{
                    isFormValid:(form) => {
                        if(!form.$valid){
                            cuiWizard.helpers.setErrorFieldsToTouched(form);
                            return false;
                        }
                        return true;
                    },
                    setErrorFieldsToTouched:(form)=>{
                        angular.forEach(form.$error, (field) => {
                            angular.forEach(field, (errorField) => {
                                errorField.$setTouched();
                            });
                        });
                    },
                    getStepInfo:(step) => { // step goes from 0 to numberOfSteps
                        const $step = cuiWizard.selectors.$steps[step];
                        return {
                            stepTitle: $step.attributes['step-title'].value,
                            icon: $step.attributes.icon ? $step.attributes.icon.value : false,
                            state: $step.attributes.state ? $step.attributes.state.value : false
                        };
                    },
                    getIconMarkup:(icon) => {
                        if(!icon) return '';
                        let iconMarkup;
                        switch (icon.indexOf('.')){
                            case -1:
                                iconMarkup = `<cui-icon cui-svg-icon="${icon}" svg-class="icon-svg"></cui-icon>`;
                                break;
                            default:
                                iconMarkup = `<img src="${icon}" class="cui-icon-rotate"/>`;
                        };

                        return `<div class="icon-container">
                                    <div class="icon">
                                        ${iconMarkup}
                                    </div>
                                </div>`
                    },
                    getNgClickForIndicator:(stepNumber,stepState) => { // stepNUmber from 0 to numberOfSteps
                        if(!cuiWizard.config.clickableIndicators) return '';
                        else return `ng-click="goToStep(${stepNumber+1}${',' + stepState || ''})"`;
                    },
                    getIndicatorMarkup:(stepNumber) => { // stepNUmber from 0 to numberOfSteps
                        const step = cuiWizard.helpers.getStepInfo(stepNumber);
                        let indicatorClass;
                        stepNumber+1 === cuiWizard.scope.currentStep ? indicatorClass='active' : stepNumber+1 < cuiWizard.scope.currentStep ? indicatorClass='visited' : indicatorClass='';
                        return `<span class="step-indicator ${indicatorClass}" ${cuiWizard.helpers.getNgClickForIndicator(stepNumber,step.state)}>
                                    <span class="step-indicator__title">${step.stepTitle}</span> ${cuiWizard.helpers.getIconMarkup(step.icon)}
                                </span>`;
                    },
                    getIndicatorsWidth:() => {
                        let totalWidth = 0;
                        cuiWizard.selectors.$indicators.each((i,indicator) => {
                            totalWidth += $(indicator).width();
                        });
                        return totalWidth;
                    },
                    thereIsRoomForIndicators:() => {
                        if((cuiWizard.helpers.getIndicatorsWidth() + (cuiWizard.config.minimumPadding * ( cuiWizard.config.numberOfSteps-1 ))) <
                            cuiWizard.selectors.$indicatorContainer.width()) return true;
                        return false;
                    },
                    debounce:function(func, wait, immediate){
                        let timeout;
                        return function() {
                            const context = this, args = arguments;
                            const later = () => {
                                timeout = null;
                                if (!immediate) {func.apply(context, args);}
                            };
                            const callNow = immediate && !timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                            if (callNow) func.apply(context, args);
                        };
                    },
                    resizeHandler:() => {
                        cuiWizard.helpers.debounce(() => {
                            if(cuiWizard.config.bar) cuiWizard.reRender.bar(cuiWizard.scope.currentStep);
                            if(cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed = false;
                                cuiWizard.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed = true;
                                cuiWizard.selectors.$indicatorContainer.addClass('small');
                            }
                            if(cuiWizard.config.mobileStack && (cuiWizard.selectors.$window.width() <= cuiWizard.config.mobileStackBreakingPoint) && !cuiWizard.config.mobileMode){
                                cuiWizard.selectors.$expandables.forEach((expandable,e) => {
                                    expandable.attr('transition-speed',300);
                                    expandable.addClass('mobile-element');
                                });
                                cuiWizard.config.mobileMode = true;
                            }
                            else if(cuiWizard.config.mobileStack && (cuiWizard.selectors.$window.width() > cuiWizard.config.mobileStackBreakingPoint) && cuiWizard.config.mobileMode){
                                cuiWizard.selectors.$expandables.forEach((expandable,e) => {
                                    expandable.attr('transition-speed',0);
                                    expandable.removeClass('mobile-element');
                                });
                                cuiWizard.config.mobileMode = false;
                            }
                        },200)();
                    },
                    scrollToStep:(newStep) => {
                        const firstExpandableTitle = angular.element(cuiWizard.selectors.$expandables[0].children()[0]);
                        const firstExpandableOffset = firstExpandableTitle.offset();
                        const titleHeight=firstExpandableTitle[0].scrollHeight;
                        cuiWizard.selectors.$body.animate({ scrollTop: firstExpandableOffset.top + (titleHeight * (newStep-1)) } , 300 , 'linear');
                    }
                },
                scope:{
                    currentStep : Number(elem[0].attributes.step.value),
                    wizardFinished : false,
                    next:(state) => { // state is optional
                        if(state) cuiWizard.scope.goToState(state);
                        else cuiWizard.update(cuiWizard.scope.currentStep + 1);
                    },
                    nextWithErrorChecking:(form,state) => {
                        if(cuiWizard.helpers.isFormValid(form)) cuiWizard.scope.next(state);
                    },
                    previous:(state) => {
                        if(state) cuiWizard.scope.goToSate(state);
                        else cuiWizard.update(cuiWizard.scope.currentStep-1);
                    },
                    goToStep:(newStep,state) => {
                        if(newStep===cuiWizard.scope.currentStep) return;
                        if(state) cuiWizard.scope.goToState(state);
                        cuiWizard.update(newStep);
                    },
                    goToState:(state) => {
                        $rootScope.$broadcast('stepChange',{ state, element:elem });
                    }
                },
                watchers:{
                    init:() => {
                        cuiWizard.watchers.windowResize();
                        cuiWizard.watchers.languageChange();
                    },
                    windowResize:() => {
                        cuiWizard.selectors.$window.bind('resize',cuiWizard.helpers.resizeHandler);
                    },
                    languageChange:() => {
                        scope.$on('languageChange',() => {
                            if(cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed=false;
                                cuiWizard.selectors.$indicatorContainer.removeClass('small');
                            }
                            else if(!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed=true;
                                cuiWizard.selectors.$indicatorContainer.addClass('small');
                            }
                            if(cuiWizard.config.bar) cuiWizard.reRender.bar(cuiWizard.scope.currentStep);
                        });
                    }
                },
                render:{
                    indicators:() => {
                        cuiWizard.selectors.$indicatorContainer.append(`<div class="cui-steps"></div>`);
                        cuiWizard.selectors.$stepIndicatorContainer=angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.cui-steps'));
                        cuiWizard.selectors.$steps.each((i,step) => {
                            const indicator = angular.element(cuiWizard.helpers.getIndicatorMarkup(i)),
                                compiledIndicator = $compile(indicator)(scope);
                            cuiWizard.selectors.$stepIndicatorContainer.append(compiledIndicator);
                        });
                        cuiWizard.selectors.$indicators = angular.element(cuiWizard.selectors.$stepIndicatorContainer[0].querySelectorAll('.step-indicator'));
                        cuiWizard.config.numberOfSteps = cuiWizard.selectors.$indicators.length;
                    },
                    bar:() => {
                      $timeout(() => {
                        cuiWizard.selectors.$indicatorContainer.append(`<div class="steps-bar"><div class="steps-bar-fill"></div></div>`);
                        cuiWizard.selectors.$bar = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.steps-bar'));
                        cuiWizard.selectors.$barFill = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.steps-bar-fill'));
                        cuiWizard.selectors.$bar[0].style.left = cuiWizard.selectors.$indicators[0].scrollWidth/2 + 'px'; // bar starts at the center point of the 1st inicator
                        cuiWizard.selectors.$bar[0].style.right = cuiWizard.selectors.$indicators[cuiWizard.config.numberOfSteps-1].scrollWidth/2 + 'px'; // ends at center of last indicator
                        if(cuiWizard.scope.currentStep===1) cuiWizard.selectors.$barFill[0].style.width = '0px';
                        else {
                            cuiWizard.selectors.$barFill[0].style.width=cuiWizard.selectors.$indicators[cuiWizard.scope.currentStep-1].offsetLeft - (cuiWizard.selectors.$indicators[0]. scrollWidth/2) + (cuiWizard.selectors.$indicators[cuiWizard.scope.currentStep-1].scrollWidth/2) + 'px';
                        }
                      });
                    },
                    steps:() => {
                        if(!cuiWizard.config.mobileStack) return;
                        cuiWizard.selectors.$expandables=[];
                        cuiWizard.selectors.$steps.each((i,step) => {
                            const stepInfo = cuiWizard.helpers.getStepInfo(i);
                            let expandableClass='';
                            if(cuiWizard.scope.currentStep===i+1) {
                                $(step).addClass('active');
                                expandableClass='expanded';
                            }
                            const expandable=$($compile( // compile a new expandable
                                `<cui-expandable class="cui-expandable cui-expandable--wizard ${expandableClass}" transition-speed="0">
                                    <cui-expandable-title class="cui-expandable__title cui-expandable__title--wizard">
                                        ${cuiWizard.helpers.getIndicatorMarkup(i)}
                                    </cui-expandable-title>
                                    <cui-expandable-body class="cui-expandable__body cui-expandable__body--wizard"></cui-expandable-body>
                                </cui-expandable>`
                            )(scope));
                            expandable.insertBefore(step);
                            $(step).detach().appendTo(expandable.children()[1]);
                            cuiWizard.selectors.$expandables.push($(step).parent().parent());
                        });
                    }
                },
                reRender:{
                    indicators:(newStep,oldStep) => { // newStep goes from 1 to numberOfSteps+1
                        cuiWizard.selectors.$indicators.each((i,indicator) => {
                            if((i+1) < newStep) $(indicator).addClass('visited');
                            else $(indicator).removeClass('visited');
                        });
                        cuiWizard.selectors.$indicators[oldStep-1].classList.remove('active');
                        cuiWizard.selectors.$indicators[newStep-1].classList.add('active');
                    },
                    steps:(newStep,oldStep) => {
                        cuiWizard.selectors.$expandables.forEach((expandable,i) => {
                            if((i+1) < newStep) expandable.addClass('visited');
                            else expandable.removeClass('visited');
                        });
                        cuiWizard.selectors.$steps[oldStep-1].classList.remove('active');
                        cuiWizard.selectors.$steps[newStep-1].classList.add('active');
                        cuiWizard.selectors.$expandables[oldStep-1].removeClass('expanded');
                        cuiWizard.selectors.$expandables[newStep-1].addClass('expanded');
                        cuiWizard.selectors.$expandables[oldStep-1][0].querySelector('.step-indicator').classList.remove('active');
                        cuiWizard.selectors.$expandables[newStep-1][0].querySelector('.step-indicator').classList.add('active');
                    },
                    indicatorContainer:() => {
                        if(cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                            cuiWizard.config.stepsCollapsed = false;
                            cuiWizard.selectors.$indicatorContainer.removeClass('small');
                        }
                        else if(!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                            cuiWizard.config.stepsCollapsed = true;
                            cuiWizard.selectors.$indicatorContainer.addClass('small');
                        }
                    },
                    bar:(newStep) => {
                        if(newStep===1) cuiWizard.selectors.$barFill[0].style.width='0px';
                        else {
                            cuiWizard.selectors.$barFill[0].style.width=cuiWizard.selectors.$indicators[newStep-1].offsetLeft - (cuiWizard.selectors.$indicators[0]. scrollWidth/2) + (cuiWizard.selectors.$indicators[newStep-1].scrollWidth/2) + 'px';
                        }
                    }
                },
                update:(newStep,oldStep) => {
                    if(cuiWizard.config.mobileMode) cuiWizard.helpers.scrollToStep(newStep);
                    cuiWizard.reRender.indicators(newStep,cuiWizard.scope.currentStep);
                    if(cuiWizard.config.mobileStack) cuiWizard.reRender.steps(newStep,cuiWizard.scope.currentStep);
                    if(cuiWizard.config.bar) cuiWizard.reRender.bar(newStep);
                    scope.currentStep=cuiWizard.scope.currentStep=newStep;
                    if(newStep===cuiWizard.config.numberOfSteps) scope.wizardFinished=cuiWizard.scope.wizardFinished=true;
                    attrs.$set('step',newStep);
                }
            };
            cuiWizard.initScope();
            cuiWizard.render.indicators();
            if (cuiWizard.config.bar) cuiWizard.render.bar();
            cuiWizard.render.steps();
            cuiWizard.watchers.init();
            cuiWizard.selectors.$window.resize();
        }
    };
}]);

angular.module('cui-ng')
.directive('customError', ['$q', ($q) => {
  return {
    restrict: 'A',
    require:'ngModel',
    link: (scope,ele,attrs,ctrl) => {
      let promises={},isLoading=false,amountOfRequestSent=0;

      const assignValueFromString = (startingObject,string,value) => { // gets nested scope variable from parent , used because we can't have isolate scope on this directive
        const arrayOfProperties = string.split('.');
        arrayOfProperties.forEach((property,i)=> {
          if(i < arrayOfProperties.length-1) startingObject = startingObject[property];
          else startingObject[property] = value;
        });
      };

      const startLoading = () => {
        isLoading=true;
        amountOfRequestSent++;
        if(attrs.customErrorLoading) assignValueFromString(scope.$parent,attrs.customErrorLoading,true);
      };

      const finishLoading = () => {
        isLoading=false;
        if(attrs.customErrorLoading) assignValueFromString(scope.$parent,attrs.customErrorLoading,false);
      };


      scope.$watch(() => ctrl.$modelValue , (newValue,oldValue) => {
        angular.forEach(scope.$eval(attrs.customError),(checkFunction,errorName) => {
          const checkFunctionReturn = checkFunction(newValue);

          if(typeof checkFunctionReturn === "boolean") {
            ctrl.$setValidity(errorName,checkFunctionReturn);
          }
          else {
            startLoading();
            if(!promises[errorName]) promises[errorName]=[checkFunctionReturn.promise];
            else promises[errorName].push(checkFunctionReturn.promise);
            $q.all(promises[errorName]).then( res => {
              ctrl.$setValidity(errorName, checkFunctionReturn.valid(res[promises[errorName].length-1]));
              finishLoading();
            }, err => {
              checkFunctionReturn.catch && checkFunctionReturn.catch(err);
              finishLoading();
            });
          }
        });
      },(newValue,oldValue) => newValue !== oldValue );
    }
  };
}]);

angular.module('cui-ng')
.directive('focusIf', ['$timeout',($timeout) => {
    return {
        restrict: 'A',
        link: (scope, elem, attrs) => {
            const element = elem[0];

            const focus = (condition) => {
                if (condition) {
                    $timeout(() => {
                        element.focus();
                    }, scope.$eval(attrs.focusDelay) || 0);
                }
            };

            if (attrs.focusIf) {
                scope.$watch(attrs.focusIf, focus);
            } else {
                focus(true);
            }
        }
    };
}]);

angular.module('cui-ng')
.directive('inlineEdit', ['$compile', '$timeout','$filter', ($compile, $timeout, $filter) => {
  return {
    restrict: 'E',
    scope:{
      model: '=',
      type: '@',
      options: '=',
      display: '=',
      localData: '=',
      saveCallback: '&onSave',
      tempEditCallback: '&onEdit',
      hideSaveButton: '=hideSaveIf'
    },
    link: (scope,ele,attrs) => {
      const inlineEdit = {
        init: () => {
          angular.forEach(inlineEdit.scope,(initScope)=>{
            initScope();
          });
        },
        config:{
          valueClass:attrs.valueClass || "cui-field-val__val",
          inputClass:attrs.inputClass || "cui-field-val__val",
          labelClass:attrs.labelClass || "cui-field-val__field",
          wrapperClass:attrs.wrapperClass || "cui-field-val"
        },
        scope:{
          init:() => {
            scope.edit=false;
            scope.focus=false;
          },
          functions:() => {
            scope.toggleEdit = () => {
              scope.focus = scope.edit = !scope.edit;
              if(scope.tempEditCallback) scope.editChangeCallback(scope.edit);
            };
            scope.matchModels = () => {
              scope.editInput = scope.model;
            };
            scope.saveInput = () => {
              scope.model = scope.editInput;
              if(scope.saveCallback()) {
                $timeout(() => {
                  scope.saveCallback()();
                });
              }
              inlineEdit.helpers.setDisplayValue();
            };
            scope.parseKeyCode = (e) => {
              switch (event.which){
                case 13:
                  scope.saveInput();
                  scope.toggleEdit();
                  break;
                case 27:
                  scope.toggleEdit();
                  break;
              }
            };
            scope.editChangeCallback = (editMode) => {
              if(editMode === false) {
                scope.tempEditCallback() && scope.tempEditCallback()(undefined);
                return;
              }
              scope.tempEditCallback() && scope.tempEditCallback()(scope.editInput);
            };
          },
          watchers:() => {
            scope.$watch('display',inlineEdit.helpers.setDisplayValue);
            scope.$watch('model',inlineEdit.helpers.setDisplayValue);
          }
        },

        helpers:{
          getLabel:() => {
            let label;
            if(attrs.label!==undefined) return `{{'${attrs.label}'| translate}}`;
            else if(attrs.name!==undefined) return attrs.name;
            else throw new Error('Inline-edit needs 1 of the following attributes: label or name.');
          },
          getInput:() => {
            attrs.type=attrs.type || 'text';
            switch(attrs.type){
              case 'dropdown':
                return `<select ng-model="$parent.editInput" class="${inlineEdit.config.inputClass}" ng-init="matchModels()" ng-options="${attrs.optionsExpression}"
                  ng-if="edit" ng-change="editChangeCallback()"></select>`
              case 'auto-complete':
                return `<div auto-complete selected-object="$parent.editInput" local-data="localData" search-fields="${attrs.searchFields}"
                  title-field="${attrs.titleField}" input-class="${inlineEdit.config.inputClass}" match-class="highlight" ng-init="matchModels()" auto-match="true"
                  ng-if="edit" ng-keypress="parseKeyCode($event)" initial-value="$parent.editInput.title" input-changed="editChangeCallback()"></div>`
              default:
                return `<input type="${attrs.type}" ng-model="$parent.editInput" class="${inlineEdit.config.inputClass}"
                  ng-init="matchModels()" ng-if="edit" ng-keyup="parseKeyCode($event)" focus-if="focus" ng-change="editChangeCallback()"/>`

            }
          },
          setDisplayValue:() => {
            if(attrs.type==="password") {
              scope.displayValue = Array(scope.model? scope.model.length+1 : 0).join('•');
            }
            else scope.displayValue = scope.display || scope.model;
          }
        },
        render:() => {
          const element= $compile(
            `<div class="${inlineEdit.config.wrapperClass}">
                <span class="${inlineEdit.config.labelClass}">${inlineEdit.helpers.getLabel()}</span>
                <span ng-if="!edit" class="${inlineEdit.config.valueClass}">{{displayValue}}</span>${inlineEdit.helpers.getInput()}
            </div>
            <span class="cui-link" ng-click="toggleEdit()" ng-if="!edit">{{"cui-edit" | translate}}</span>
            <span class="cui-link" ng-if="edit && !hideSaveButton" ng-click="saveInput();toggleEdit();">{{"cui-update" | translate}}</span>
            <span class="cui-link" ng-if="edit" ng-click="toggleEdit()">{{"cui-cancel" | translate}}</span>`
          )(scope);
          angular.element(ele[0]).html(element);
        }
      };
      inlineEdit.init();
      inlineEdit.render();
    }
  };
}]);



angular.module('cui-ng')
.directive('match', ['$parse', ($parse) => {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: (scope, element, attrs, ctrl) => {
      const checkIfMatch = (values) => {
        ctrl.$setValidity('match', values[0] === (values[1] || ''));
      };

      scope.$watch(()=> [scope.$eval(attrs.match), ctrl.$viewValue], checkIfMatch, (newValues,oldValues) => !angular.equals(newValues,oldValues));
    }
  };
}]);

angular.module('cui-ng').directive('offClick', ($rootScope, $parse, OffClickFilterCache) => {
    let id = 0;
    let listeners = {};
    // add variable to detect touch users moving..
    let touchMove = false;

    const targetInFilter = (target, elms) => {
        if (!target || !elms) return false;
        const elmsLen = elms.length;
        for (let i = 0; i < elmsLen; ++i) {
            const currentElem = elms[i];
            let containsTarget = false;
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

    const offClickEventHandler = (event) => {
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
        const target = event.target || event.srcElement;
        angular.forEach(listeners, (listener, i) => {
            let filters=[];
            if(listener.elm.id && listener.elm.id !== '') {
                if(OffClickFilterCache['#' + listener.elm.id]) filters = filters.concat(OffClickFilterCache['#'+listener.elm.id]);
            }
            // classList is an object in IE10 and 11 iirc, using angular.forEach to iterate both over an array or object values
            angular.forEach(listener.elm.classList, (className) => {
                if(OffClickFilterCache['.' + className]) filters = filters.concat(OffClickFilterCache['.' + className]);
            });
            if (!(listener.elm.contains(target) || targetInFilter(target, filters))) {
                $rootScope.$evalAsync(() => {
                    listener.cb(listener.scope, {
                        $event: event
                    });
                });
            }

        });
    }


    // Add event listeners to handle various events. Destop will ignore touch events
    document.addEventListener("touchmove", offClickEventHandler, true);
    document.addEventListener("touchend", offClickEventHandler, true);
    document.addEventListener('click', offClickEventHandler, true);


    return {
        restrict: 'A',
        compile: (elem, attrs) => {
            const fn = $parse(attrs.offClick);

            const elmId = id++;
            let removeWatcher;

            return (scope, element) => {
                const on = () => {
                    listeners[elmId] = {
                        elm: element[0],
                        cb: fn,
                        scope: scope
                    };
                };

                const off = () => {
                    listeners[elmId] = null;
                    delete listeners[elmId];
                };

                if (attrs.offClickIf) {
                    removeWatcher = $rootScope.$watch(() => $parse(attrs.offClickIf)(scope), (newVal) => {
                        newVal && on() || !newVal && off()
                    });
                } else on();

                scope.$on('$destroy', () => {
                    off();
                    if (removeWatcher) {
                        removeWatcher();
                    }
                    element = null;
                });
            };
        }
    };
})
.directive('offClickFilter', (OffClickFilterCache, $parse) => {
    let filters;

    return {
        restrict:'A',
        compile : (elem, attrs)  => {
            return (scope, element) => {
                filters = $parse(attrs.offClickFilter)(scope).split(',').map(x => x.trim());

                filters.forEach(filter => {
                    OffClickFilterCache[filter] ? OffClickFilterCache[filter].push(elem[0]) : OffClickFilterCache[filter] = [elem[0]];
                });

                scope.$on('$destroy',()  => {
                    element = null;
                    filters.forEach((filter) => {
                        if(OffClickFilterCache[filter].length > 1)  {
                            OffClickFilterCache[filter].splice(OffClickFilterCache[filter].indexOf(elem[0]), 1);
                        }
                        else {
                            OffClickFilterCache[filter] = null;
                            delete OffClickFilterCache[filter];
                        }
                    });
                });
            };
        }
    };
})
.factory('OffClickFilterCache', () => {
    let filterCache = {};
    return filterCache;
});

angular.module('cui-ng')
.directive('onEnter',['$timeout',($timeout) => {
    return {
        restrict:'A',
        require: 'ngModel',
        link:(scope,element,attrs,ctrl) => {
            element.bind("keydown keypress", (event) => {
                if(event.which === 13) {
                    event.preventDefault();
                    const callback = scope.$eval(attrs.onEnter);
                    $timeout(() => {
                        callback(ctrl.$viewValue);
                    });
                }
            });

            scope.$on('destroy',() => {
                element.unbind();
            });
        }
    };
}]);

angular.module('cui-ng')
.directive('paginate',['$compile','$timeout','$interval',($compile,$timeout,$interval) => {
    return {
        restrict: 'AE',
        scope: {
            resultsPerPage: '&',
            count: '&',
            onPageChange: '&',
            page: '=ngModel',
            attachRerenderTo: '='
        },
        link: (scope, elem, attrs) => {
            let resizeInterval;
            const paginate = {
                initScope:() => {
                    scope.paginate = {
                        currentPage:scope.page? paginate.helpers.normalizePage(scope.page) : 1
                    };
                    paginate.helpers.updateConfig();
                    paginate.render.pageContainer();
                    if(attrs.attachRerenderTo) scope.attachRerenderTo = paginate.scope.updateConfigAndReRender;
                    angular.forEach(paginate.scope,(func,key) => {
                        scope.paginate[key]=func;
                    });
                },
                selectors:{
                    $paginate:angular.element(elem[0])
                },
                config:{
                    pageClass:attrs.pageClass || 'cui-paginate__page',
                    activePageClass:attrs.activePageClass || 'cui-paginate__page--active',
                    ellipsesClass: attrs.ellipsesClass || 'cui-paginate__ellipses',
                    previousClass: attrs.previousNextClass || 'cui-paginate__previous',
                    nextClass: attrs.previousNextClass || 'cui-paginate__next',
                    pageContainerClass: attrs.pageContainerClass || 'cui-paginate__page-container',
                    ellipsesButton: attrs.ellipses || '...',
                    previousButton: attrs.previousButton || '<',
                    nextButton: attrs.nextButton || '>'
                },
                watchers:{
                    resultsPerPage:() => {
                        scope.$watch(scope.resultsPerPage,(newCount,oldCount) => {
                            if(newCount && oldCount && newCount!==oldCount){
                                scope.page = scope.paginate.currentPage = 1;
                                paginate.helpers.updateConfig();
                                paginate.scope.reRender();
                                $timeout(()=>{
                                    if(scope.onPageChange()) scope.onPageChange()(scope.paginate.currentPage);
                                });
                            }
                        });
                    },
                    page:() => {
                        scope.$watch('page',(newPage,oldPage) => {
                            if(newPage && newPage!==scope.paginate.currentPage) {
                                scope.page = scope.paginate.currentPage = paginate.helpers.normalizePage(newPage);
                                paginate.helpers.updateConfig();
                                paginate.scope.reRender();
                            }
                        });
                    },
                    paginateResize:() => {
                        resizeInterval=$interval(paginate.helpers.resizeHandler,50);
                    },
                    scopeDestroy:() => {
                        scope.$on('$destroy',() => {
                            $interval.cancel(resizeInterval); // unbinds the resize interval
                        });
                    }
                },
                helpers:{
                    updateConfig:() => {
                        paginate.config.numberOfPages = paginate.helpers.getNumberOfPages();
                        paginate.config.howManyPagesWeCanShow = paginate.helpers.howManyPagesWeCanShow();
                    },
                    getNumberOfPages:() => Math.ceil(scope.count()/scope.resultsPerPage()),
                    getWidthOfAPage:() => paginate.helpers.getWidthOfElement($(paginate.render.pageNumber(1))),
                    getAvailableSpaceForPages:() => {
                        const paginateWidth = paginate.config.width || paginate.selectors.$paginate.width();
                        const previousWidth = paginate.helpers.getWidthOfElement(paginate.render.previousButton());
                        const nextWidth = paginate.helpers.getWidthOfElement(paginate.render.nextButton());
                        return paginateWidth - ( previousWidth + nextWidth )-1; // - 1 because at certain widths the width() method was off by a pixel
                    },
                    getWidthOfElement:(element) => { // this appends the element to the body, get its width, and removes it. Used for measuring.
                        element.appendTo(document.body);
                        const width=element.outerWidth(true);
                        element.remove();
                        return width;
                    },
                    howManyPagesWeCanShow:() => Math.floor(paginate.helpers.getAvailableSpaceForPages()/paginate.helpers.getWidthOfAPage()),
                    handleStepChange:() => {
                        scope.page = scope.paginate.currentPage = paginate.helpers.normalizePage(scope.paginate.currentPage);
                        $timeout(()=>{
                            if(scope.onPageChange()) scope.onPageChange()(scope.paginate.currentPage);
                            paginate.scope.reRender();
                        });
                    },
                    resizeHandler:() => {
                        if(!paginate.config.width) paginate.config.width = paginate.selectors.$paginate.width();
                        else if(paginate.selectors.$paginate.width() !== paginate.config.width) {
                            paginate.config.width = paginate.selectors.$paginate.width();
                            paginate.helpers.updateConfig();
                        }
                    },
                    whatEllipsesToShow:() => {
                        if(paginate.config.numberOfPages <= paginate.config.howManyPagesWeCanShow) return 'none';
                        else if(scope.paginate.currentPage < ((paginate.config.howManyPagesWeCanShow/2)+1)) return 'right';
                        else if(scope.paginate.currentPage < (paginate.config.numberOfPages -  (paginate.config.howManyPagesWeCanShow/2))) return 'both';
                        else return 'left';
                    },
                    normalizePage:(pageNumber) => {
                        const page = parseInt(pageNumber);
                        if(page <= paginate.config.numberOfPages && page >= 1){
                            return page;
                        }
                        else if(page < 1){
                            return 1;
                        }
                        else return paginate.config.numberOfPages;
                    }
                },
                scope:{
                    previous:() => {
                        if(scope.paginate.currentPage > 1){
                            scope.paginate.currentPage--;
                            paginate.helpers.handleStepChange();
                        }
                    },
                    next:() => {
                        if(scope.paginate.currentPage+1 <= paginate.config.numberOfPages){
                            scope.paginate.currentPage++;
                            paginate.helpers.handleStepChange();
                        }
                    },
                    goToPage:(page) => {
                        if(page === scope.paginate.currentPage) return;
                        scope.paginate.currentPage = paginate.helpers.normalizePage(page);
                        paginate.helpers.handleStepChange();
                    },
                    reRender:() => {
                        paginate.selectors.$pageContainer.replaceWith(paginate.render.pageContainer());
                    },
                    updateConfigAndReRender:() => {
                        paginate.helpers.updateConfig();
                        if(scope.paginate.currentPage > paginate.config.numberOfPages) {
                            scope.page = scope.paginate.currentPage = paginate.helpers.normalizePage(scope.paginate.currentPage);
                            paginate.scope.reRender();
                        }
                        else {
                            paginate.scope.reRender();
                        }
                    }
                },
                render:{
                    init:() => {
                        paginate.selectors.$paginate.append(paginate.render.previousButton());
                        paginate.selectors.$paginate.append(paginate.render.pageContainer());
                        paginate.selectors.$paginate.append(paginate.render.nextButton());
                    },
                    previousButton:() => {
                        const previousButton = $compile(
                            `<span ng-click="paginate.previous()" class="${paginate.config.previousClass}">
                                ${paginate.config.previousButton}
                            </span>`
                        )(scope);
                        return previousButton;
                    },
                    nextButton:() => {
                        const nextButton = $compile(
                            `<span ng-click="paginate.next()" class="${paginate.config.nextClass}">
                                ${paginate.config.nextButton}
                            </span>`
                        )(scope);
                        return nextButton;
                    },
                    ellipses:(page) => {
                        const ngClick=`ng-click="paginate.goToPage(${page})"`;
                        const ellipses = $compile(`<span ${ngClick} class="${paginate.config.ellipsesClass}">${paginate.config.ellipsesButton}</span>`)(scope);
                        return ellipses;
                    },
                    pageNumber:(page,active) => {
                        let activeClass, ngClick;
                        ngClick = `ng-click="paginate.goToPage(${page})"`;
                        active? activeClass=`${paginate.config.activePageClass}` : activeClass='';
                        const button=$compile(`<span ${ngClick} class="${paginate.config.pageClass} ${activeClass}">${page}</span>`)(scope);
                        return button;
                    },
                    pagesXToY:(x,y) => {
                        let pages=[];
                        do {
                            const page = paginate.render.pageNumber(x, x===(scope.paginate.currentPage || scope.page ));
                            pages.push(page);
                            x++;
                        }
                        while(x <= y);
                        return pages;
                    },
                    pageNumbers:() => {
                        const whatEllipsesToShow = paginate.helpers.whatEllipsesToShow();
                        let pages = [];
                        switch (whatEllipsesToShow){
                            case 'none':
                                pages.push(paginate.render.pagesXToY(1, paginate.config.numberOfPages));
                                break;
                            case 'right':
                                const ellipsesPoint = paginate.config.howManyPagesWeCanShow - 1;
                                pages.push(paginate.render.pagesXToY(1,ellipsesPoint-1));
                                pages.push(paginate.render.ellipses(ellipsesPoint));
                                pages.push(paginate.render.pageNumber(paginate.config.numberOfPages));
                                break;
                            case 'left':
                                const ellipsesPointLeft = paginate.config.numberOfPages - (paginate.config.howManyPagesWeCanShow-2);
                                pages.push(paginate.render.pageNumber(1));
                                pages.push(paginate.render.ellipses(ellipsesPointLeft));
                                pages.push(paginate.render.pagesXToY(ellipsesPointLeft+1, paginate.config.numberOfPages));
                                break;
                            case 'both':
                                const firstEllipsesPoint=scope.paginate.currentPage - (Math.ceil(paginate.config.howManyPagesWeCanShow/2)-2);
                                const secondEllipsesPoint=scope.paginate.currentPage + (Math.floor(paginate.config.howManyPagesWeCanShow/2)-1);
                                pages.push(paginate.render.pageNumber(1));
                                pages.push(paginate.render.ellipses(firstEllipsesPoint));
                                pages.push(paginate.render.pagesXToY(firstEllipsesPoint+1, secondEllipsesPoint-1));
                                pages.push(paginate.render.ellipses(secondEllipsesPoint));
                                pages.push(paginate.render.pageNumber(paginate.config.numberOfPages));
                                break;
                        };
                        return pages;
                    },
                    pageContainer:() => {
                        const pageContainer = $(`<span class="${paginate.config.pageContainerClass}"></span>`);
                        paginate.selectors.$pageContainer = pageContainer;
                        paginate.render.pageNumbers().forEach((page) => {
                            pageContainer.append(page);
                        });
                        return pageContainer;
                    }
                }
            };

            $timeout(() => {
                paginate.initScope();
                paginate.render.init();
                angular.forEach(paginate.watchers,(initWatcher) => {
                    initWatcher();
                });
            });
        }
    };
}]);

angular.module('cui-ng')
.factory('CuiPasswordInfo',[() => {
    let policies={};
    let info={};
    return { info, policies };
}])
.factory('CuiPasswordValidators',['CuiPasswordInfo',(CuiPasswordInfo) => {
    RegExp.escape = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const validators = (policies, id) => {
        CuiPasswordInfo.info[id] = {}; // Initialize the object that holds the info for this password validation (disallowedWords, disallowedChars)
        return {
            lowercase: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return /.*[a-z].*/.test(viewValue);
            },
            uppercase: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return /.*[A-Z].*/.test(viewValue);
            },
            number: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return /.*[0-9].*/.test(viewValue);
            },
            special: (modelValue,viewValue) => {
                if(!modelValue) return false;
                if(getValidators(policies,id).complex(modelValue,viewValue)) return true;
                return !(/^[a-z0-9]+$/i.test(viewValue));
            },
            complex: (modelValue,viewValue) => {
                if(!modelValue) return false;
                let numberOfUsedClasses=0;
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
                return numberOfUsedClasses >= policies.requiredNumberOfCharClasses;
            },
            lowercaseNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return !(/.*[a-z].*/.test(viewValue));
            },
            uppercaseNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return !(/.*[A-Z].*/.test(viewValue));
            },
            numberNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return !(/.*[0-9].*/.test(viewValue));
            },
            specialNotAllowed: (modelValue,viewValue) => {
                if(!viewValue) return true;
                return /^[a-z0-9]+$/i.test(viewValue);
            },
            disallowedChars: (modelValue,viewValue) => {
                if(!viewValue) return true;
                var valid = true;
                var disallowedChars = [];
                policies.disallowedChars.split('').forEach((disallowedChar) => {
                    if(viewValue.indexOf(disallowedChar)> -1){
                        valid=false;
                        disallowedChars.push(disallowedChar);
                    }
                });
                CuiPasswordInfo.info[id].disallowedChars = disallowedChars.join(', ');
                return valid;
            },
            disallowedWords: (modelValue,viewValue) => {
                if(!viewValue) return true;
                let valid = true;
                let disallowedWords = [];
                policies.disallowedWords.forEach((word) => {
                    if(viewValue.toUpperCase().indexOf(word.toUpperCase())>-1){
                        valid=false;
                        disallowedWords.push(word);
                    }
                });
                CuiPasswordInfo.info[id].disallowedWords = disallowedWords.join(', ');
                return valid;
            },
            length: (modelValue,viewValue) => {
                if(!modelValue) return false;
                return (viewValue.length <= policies.max) && (viewValue.length >= policies.min);
            }
        };
    };

    const getValidators = (parsedPolicies,id) =>{
        let validator = {};
        const passwordValidators = Object.assign({}, validators(parsedPolicies,id));
        const trueFunction = () => true;

        CuiPasswordInfo.policies[id]=parsedPolicies;

        validator.complex = passwordValidators.complex;

        // if lower chars are not allowed add a check to see if there's a lowercase in the input
        if (parsedPolicies.allowLowerChars) {
            validator.lowercase = passwordValidators.lowercase;
            validator.lowercaseNotAllowed = trueFunction;
        }
        else {
            validator.lowercase = trueFunction;
            validator.lowercaseNotAllowed = passwordValidators.lowercaseNotAllowed;
        }

        if (parsedPolicies.allowUpperChars) {
            validator.uppercase = passwordValidators.uppercase;
            validator.uppercaseNotAllowed = trueFunction;
        }
        else {
            validator.uppercase = trueFunction;
            validator.uppercaseNotAllowed = passwordValidators.uppercaseNotAllowed;
        }

        if (parsedPolicies.allowNumChars){
            validator.number = passwordValidators.number;
            validator.numberNotAllowed = trueFunction;
        }
        else{
            validator.number = trueFunction;
            validator.numberNotAllowed = passwordValidators.numberNotAllowed;
        }

        if(parsedPolicies.allowSpecialChars){
            validator.special = passwordValidators.special;
            validator.specialNotAllowed = trueFunction;
        }
        else{
            validator.special = trueFunction;
            validator.specialNotAllowed = passwordValidators.specialNotAllowed;
        }

        if(parsedPolicies.disallowedChars){
            validator.disallowedChars = passwordValidators.disallowedChars;
        }

        if(parsedPolicies.disallowedWords){
            validator.disallowedWords = passwordValidators.disallowedWords;
        }

        if(parsedPolicies.min || parsedPolicies.max){
            validator.length = passwordValidators.length;
        }

        return validator;
    };

    return { getValidators };
}])
.factory('CuiPasswordPolicies', ['CuiPasswordValidators','CuiPasswordInfo', (CuiPasswordValidators,CuiPasswordInfo) => {
    const policy = {
        parse: (policies) => {
            let newParsedPolicies={};
            if(policies.length){ // if we received an array
                policies.forEach((policyRulesObject) => {
                    Object.keys(policyRulesObject).forEach((policyKey) => {
                        newParsedPolicies[policyKey] = policyRulesObject[policyKey];
                    });
                });
            }
            else newParsedPolicies = Object.assign({},policies);
            return newParsedPolicies;
        }
    };
    return policy;
}])
.directive('passwordValidation', ['CuiPasswordPolicies','CuiPasswordValidators',(CuiPasswordPolicies,CuiPasswordValidators) => {
    return {
        require: 'ngModel',
        scope: {
            passwordValidation:'='
        },
        restrict: 'A',
        link: (scope, elem, attrs, ctrl) => {
            let passwordValidationKey = scope.$id;
            ctrl.passwordValidationKey = passwordValidationKey;

            scope.$watch('passwordValidation', (newPasswordValidationRules) => {
                if(newPasswordValidationRules ) {
                    let parsedPolicies = CuiPasswordPolicies.parse(newPasswordValidationRules);
                    let validators = CuiPasswordValidators.getValidators(parsedPolicies,passwordValidationKey);
                    angular.forEach(validators, (checkFunction,validationName) => {
                      ctrl.$validators[validationName] = checkFunction;
                    });
                    ctrl.$validate();
                }
            });
        }
    };
}])
.directive('passwordPopover',['CuiPasswordInfo', (CuiPasswordInfo) => {
    return {
        restrict: 'A',
        link: (scope,elem,attrs) => {
            let passwordValidationKey = scope.$eval(attrs.ngMessages.replace('.$error','.passwordValidationKey')); // get the passwordValidationKey from the input it's applied to

            scope.$watchCollection(() => CuiPasswordInfo.info[passwordValidationKey], (newPasswordInfo) => {
                if(newPasswordInfo){
                    Object.keys(newPasswordInfo).forEach(key => {
                        scope[key]=newPasswordInfo[key];
                    });
                }
            });

            scope.$watchCollection(() => CuiPasswordInfo.policies[passwordValidationKey], (newPasswordPolicies) => {
                if(newPasswordPolicies) scope.policies = Object.assign({},newPasswordPolicies);
            });

            scope.$watchCollection(() => scope.$eval(attrs.ngMessages), (newErrorObject) => {
                if(newErrorObject) scope.errors = Object.assign({},newErrorObject);
            });
        }
    };
}]);

angular.module('cui-ng')
.provider('$pagination', [function() {
    let paginationOptions;
    let userValue;

    this.setPaginationOptions = (valueArray) => {
        paginationOptions = valueArray;
    };

    this.getPaginationOptions = () => {
        return paginationOptions;
    };

    this.setUserValue = (value) => { // sets the user value so that other pages that use that directive will have that value saved
        try {
            localStorage.setItem('cui.resultsPerPage',value);
        }
        catch (e){ }
        userValue = value;
    };

    this.getUserValue = () => {
        try {
            userValue = parseInt(localStorage.getItem('cui.resultsPerPage'));
        }
        catch (e){ }
        return userValue;
    }

    this.$get = () => this;
}])
.directive('resultsPerPage', ['$compile','$pagination', ($compile,$pagination) => {
    return {
        restrict: 'E',
        scope: {
            selected: '=ngModel',
        },
        link: (scope, elem, attrs) => {
            const resultsPerPage = {
                initScope: () => {
                    scope.options = $pagination.getPaginationOptions();
                    scope.selected = $pagination.getUserValue() || scope.options[0];

                    scope.$watch('selected', (selected) => {
                        $pagination.setUserValue(selected);
                        scope.selected = selected;
                    });
                },
                config: {
                    selectClass: attrs.class || 'cui-dropdown'
                },
                render: () => {
                    const element = $compile(`<cui-dropdown class="${resultsPerPage.config.selectClass}" ng-model="selected" options="options"></cui-dropdown>`)(scope);
                    angular.element(elem).replaceWith(element);
                }
            };
            resultsPerPage.initScope();
            resultsPerPage.render();
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
.directive('tether',['$timeout','$parse',($timeout,$parse) => {
  return {
    restrict:'A',
    scope:true,
    link : (scope,elem,attrs) => {
      let tether;
      elem[0].classList.add('hide--opacity'); // this fixes the incorrect positioning when it first renders
      $timeout(() => {
        tether = new Tether({
          element: elem,
          target: attrs.target,
          attachment: attrs.attachment || 'top center',
          targetAttachment: attrs.targetAttachment || 'bottom center',
          offset: attrs.offset || '0 0',
          targetOffset: attrs.targetOffset || '0 0',
          targetModifier: attrs.targetModifier || undefined,
          constraints: scope.$eval(attrs.constraints) || undefined
        });
      }).
      then(() => {
        tether.position();
        elem[0].classList.remove('hide--opacity');
      });
    }
  };
}]);

angular.module('cui-ng')
.directive('uiSrefActiveFor',['$state','PubSub',($state,PubSub) => {
    return {
        restrict:'A',
        compile:() => {
            return {
                pre:(scope,elem,attrs) => {
                    let active,
                        classList = attrs.uiSrefActiveForClasses ? attrs.uiSrefActiveForClasses.split(',').map(x => x.trim()) : ['active']

                    const handleStateChange = (e, { toState }) => {
                        if(toState.name.indexOf(attrs.uiSrefActiveFor) >= 0 && !active) {
                            classList.forEach(className => elem[0].classList.add(className))
                            active = true
                        }
                        else if(toState.name.indexOf(attrs.uiSrefActiveFor) < 0 && active) {
                            classList.forEach(className => elem[0].classList.remove(className))
                            active = false
                        }
                    };

                    const unsub = PubSub.subscribe('stateChange', handleStateChange)

                    handleStateChange(null, { toState: $state.current })

                    scope.$on('$destroy',()=> {
                        PubSub.unsubscribe(unsub)
                    })
                }
            }
        }
    }
}])

angular.module('cui-ng')
.directive('uiSrefActiveNested',['$state','PubSub',($state,PubSub) => {
    return{
        restrict:'A',
        compile:() => {
            return {
                pre:(scope,elem,attrs) => {
                    let parentState;
                    if(!attrs.uiSref) {
                        throw 'ui-sref-active-nested can only be used on elements with a ui-sref attribute';
                        return;
                    }
                    // if this element is a link to a state that is nested
                    if(attrs.uiSref.indexOf('.')>-1){
                        parentState = attrs.uiSref.split('.')[0];
                    }
                    // else if it's a parent state
                    else parentState=attrs.uiSref;

                    let applyActiveClassIfNestedState = (e, { toState }) => {
                        if(toState.name.indexOf('.')>-1 && toState.name.split('.')[0] === parentState){
                            elem[0].classList.add(attrs.uiSrefActiveNested);
                        }
                        else if(toState.name.indexOf('.')===-1 && toState.name===parentState){
                            elem[0].classList.add(attrs.uiSrefActiveNested);
                        }
                        else elem[0].classList.remove(attrs.uiSrefActiveNested);
                    };

                    const unsub = PubSub.subscribe('stateChange', applyActiveClassIfNestedState);

                    applyActiveClassIfNestedState(null, { toState: $state.current });

                    scope.$on('$destroy',() => {
                        PubSub.unsubscribe(unsub);
                    });
                }
            };
        }
    };
}]);

const goToState = ($state,$rootScope,stateName,toState,toParams,fromState,fromParams) => {
  $state.go(stateName,toParams,{ notify:false }).then(()=>{
    $rootScope.$broadcast('$stateChangeSuccess',{toState,toParams,fromState,fromParams});
  });
};


angular.module('cui.authorization',[])
.factory('cui.authorization.routing', ['cui.authorization.authorize', '$timeout','$rootScope','$state',(authorize,$timeout,$rootScope,$state) => {
  const routing = (toState, toParams, fromState, fromParams, userEntitlements,loginRequiredState='loginRequired',nonAuthState='notAuthorized') => {

    let authorized;

    if (toState.access !== undefined) {
      authorized = authorize.authorize(toState.access.loginRequired, toState.access.requiredEntitlements, toState.access.entitlementType, userEntitlements);

      let stateName;

      switch (authorized){
        case 'login required':
          stateName = loginRequiredState;
        case 'not authorized':
          stateName = nonAuthState;
        default :
          break;
        case 'authorized':
          stateName = toState.name;
          break;
      };

      goToState($state,$rootScope,stateName,toState,toParams,fromState,fromParams);
    }
    else {
      goToState($state,$rootScope,toState.name,toState,toParams,fromState,fromParams);
    }
  };

  return routing;
}])
.factory('cui.authorization.authorize', [() => {
  const authorize = (loginRequired, requiredEntitlements, entitlementType='atLeastOne', userEntitlements) => {
    let loweredPermissions = [],
        hasPermission = true,
        result='not authorized';

    if (loginRequired === true && userEntitlements === undefined) {
        result = 'login required';
    }
    else if ((loginRequired === true && userEntitlements !== undefined) && (requiredEntitlements === undefined || requiredEntitlements.length === 0)) {
    // Login is required but no specific permissions are specified.
        result = 'authorized';
    }
    else if (requiredEntitlements) {
        angular.forEach(userEntitlements, (permission) => {
            loweredPermissions.push(permission.toLowerCase());
        });
        for (let i = 0; i < requiredEntitlements.length; i++) {
            const permission = requiredEntitlements[i].toLowerCase();

            if (entitlementType === 'all') {
                hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                // i1f all the permissions are required and hasPermission is false there is no point carrying on
                if (hasPermission === false) break;
            }
            else if (entitlementType === 'atLeastOne') {
                hasPermission = loweredPermissions.indexOf(permission) > -1;
                // if we only need one of the permissions and we have it there is no point carrying on
                if (hasPermission) break;
            }
        }
        result = hasPermission ? 'authorized' : 'not authorized';
    }
    return result;
  };

    return { authorize }
}])
.directive('cuiAccess',['cui.authorization.authorize',(authorize)=>{
    return{
        restrict:'A',
        scope: {
            userEntitlements:'=',
            cuiAccess:'='
        },
        link: (scope,elem,attrs) => {
            const requiredEntitlements = scope.cuiAccess && scope.cuiAccess.requiredEntitlements || [];
            const entitlementType = scope.cuiAccess && scope.cuiAccess.entitlementType || 'atLeastOne';

            const notAuthorizedClasses = attrs.notAuthorizedClasses && attrs.notAuthorizedClasses.split(',').map(className => className.trim());
            const initalDisplay = elem.css('display');

            const giveAuth = () => {
                if(notAuthorizedClasses) {
                    notAuthorizedClasses.forEach(className => elem[0].classList.remove(className));
                }
                else elem.css('display',initalDisplay);
            };

            const removeAuth = () => {
                if(notAuthorizedClasses) {
                    notAuthorizedClasses.forEach(className => elem[0].classList.add(className));
                }
                else elem.css('display','none');
            };


            scope.$watch('userEntitlements',() => {
                const authorized=authorize.authorize(true, requiredEntitlements, entitlementType, scope.userEntitlements);
                if(authorized!=='authorized') removeAuth();
                else giveAuth();
            });
        }
    };
}]);


})(angular);