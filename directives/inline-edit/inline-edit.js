angular.module('cui-ng')
.directive('inlineEdit', ['$compile', function($compile){
  return {
    restrict: 'E',
    scope:{
      model: '=',
      type: '@',
      options: '=',
      display: '=',
      localData: '='
    },
    link: function(scope,ele,attrs){
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
        if(attrs.label!==undefined) return '{{"' + attrs.label + '"| translate}}';
        else if(attrs.name!==undefined) return attrs.name;
        else console.log('Inline-edit needs 1 of the following attributes: label or name.');
      };

      var getInput=function(){
        attrs.type=attrs.type || 'text';
        if(attrs.type==='dropdown') return '<select ng-model="$parent.editInput" class="cui-expandable__review-select" ' +
          'ng-init="matchModels()" ng-options="' + attrs.optionsExpression + '" ng-if="edit"></select>';
        else if(attrs.type==='auto-complete') return '<div auto-complete selected-object="$parent.editInput" local-data="localData"' +
          ' search-fields="' + attrs.searchFields + ' " title-field="' + attrs.titleField + '" input-class="cui-expandable__review-input" '+
          ' match-class="highlight" ng-init="matchModels()" auto-match="true"' +
          ' ng-if="edit" ng-keypress="parseKeyCode($event)" initial-value="$parent.editInput.title"></div>';
        return '<input type="' + attrs.type + '" ng-model="$parent.editInput" class="cui-expandable__review-input" ' +
          'ng-init="matchModels()" ng-if="edit" ng-keyup="parseKeyCode($event)" focus-if="focus"/>';
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
        '<div class="cui-expandable__review-item">' + getLabel() + ': <span ng-if="!edit">' +
        '{{displayValue}}' + '</span>' + getInput() +
        '<span class="cui-expandable__review-button" ng-click="toggleEdit()" ng-if="!edit"> Edit</span>' +
        '<span class="cui-expandable__review-button" ng-if="edit" ng-click="saveInput();toggleEdit();"> Save</span>'+
        '<span class="cui-expandable__review-button" ng-if="edit" ng-click="toggleEdit()"> Cancel</span></div>'
      )(scope);
      angular.element(ele[0]).html(element);

    }
  };
}]);