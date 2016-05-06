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

