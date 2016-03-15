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

