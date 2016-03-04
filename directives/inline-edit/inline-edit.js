angular.module('cui-ng')
.directive('inlineEdit', ['$compile', '$timeout', function($compile, $timeout){
  return {
    restrict: 'E',
    scope:{
      model: '=',
      type: '@',
      options: '=',
      display: '=',
      localData: '=',
      saveCallback: '&onSave'
    },
    link: function(scope,ele,attrs){
      var valueClass=attrs.valueClass || "cui-field-val__val";
      var inputClass=attrs.inputClass || "cui-field-val__val";
      var labelClass=attrs.labelClass || "cui-field-val__field";
      var wrapperClass=attrs.wrapperClass || "cui-field-val";
      scope.edit=false;
      scope.focus=false;
      scope.toggleEdit=function(){
        scope.focus=scope.edit=!scope.edit;
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
        getDisplayValue();
      };
      scope.parseKeyCode=function(e){
        if(e.keyCode===13) { // if enter is pressed save input and toggle eddit.
          scope.toggleEdit();
          scope.saveInput();
        }
        if(e.keyCode===27) { // if escape is pressed toggle edit and don't save.
          scope.toggleEdit();
        }
      };

      var getLabel=function(){
        var label='';
        if(attrs.label!==undefined) return label.concat('{{"', attrs.label,'"| translate}}');
        else if(attrs.name!==undefined) return attrs.name;
        else console.log('Inline-edit needs 1 of the following attributes: label or name.');
      };

      var getInput=function(){
        attrs.type=attrs.type || 'text';
        if(attrs.type==='dropdown') return String.prototype.concat(
          '<select ng-model="$parent.editInput" class="',inputClass,'"',
          'ng-init="matchModels()" ng-options="',attrs.optionsExpression,'" ng-if="edit"></select>');
        else if(attrs.type==='auto-complete') return String.prototype.concat('<div auto-complete selected-object="$parent.editInput" local-data="localData"',
          ' search-fields="',attrs.searchFields,'" title-field="',attrs.titleField,'" input-class="',inputClass,'" ',
          ' match-class="highlight" ng-init="matchModels()" auto-match="true"',
          ' ng-if="edit" ng-keypress="parseKeyCode($event)" initial-value="$parent.editInput.title"></div>');
        return String.prototype.concat('<input type="',attrs.type,'" ng-model="$parent.editInput" class="',inputClass,'" ',
          'ng-init="matchModels()" ng-if="edit" ng-keyup="parseKeyCode($event)" focus-if="focus"/>');
      };

      var getDisplayValue=function(){
        if(attrs.type==="password") {
          scope.displayValue=Array(scope.model? scope.model.length+1 : 0).join('•');
        }
        else scope.displayValue = scope.display || scope.model;
      };

      scope.$watch('display',getDisplayValue);
      scope.$watch('model',getDisplayValue);

      var element= $compile(
        String.prototype.concat(
        '<div class="',wrapperClass,'">',
            '<span class="',labelClass,'">',getLabel(),':</span>',
            '<span ng-if="!edit" class="',valueClass,'">','{{displayValue}}','</span>',getInput() ,
        '</div>',
        '<span class="cui-link" ng-click="toggleEdit()" ng-if="!edit">{{ "edit" | translate }}</span>',
        '<span class="cui-button" ng-if="edit" ng-click="saveInput();toggleEdit();">{{ "update" | translate }}</span>',
        '<span class="cui-link" ng-if="edit" ng-click="toggleEdit()">{{ "cancel" | translate }}</span>')
      )(scope);
      angular.element(ele[0]).html(element);

    }
  };
}]);