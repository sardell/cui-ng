angular.module('cui-ng')
.directive('inlineEdit', ['$compile', function($compile){
  return {
    restrict: 'E',
    scope:{
      model: '=',
      type: '@',
      options: '=',
      display: '=',
      localData: '=localData'
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
      };
      scope.listenForEnter=function(e){
        if(e.keyCode===13) {
          scope.toggleEdit();
          scope.saveInput();
        }
      };

      var getLabel=function(){
        if(attrs.label!==undefined) return '{{"' + attrs.label + '"| translate}}';
        else if(attrs.name!==undefined) return attrs.name;
        else console.log('Inline-edit needs 1 of the following attributes: label or name.');
      };

      var getInput=function(){
        attrs.type=attrs.type || 'text';
        if(attrs.type==='dropdown') return '<select ng-model="$parent.editInput" class="cui-select" ' +
          'ng-init="matchModels()" ng-options="' + attrs.optionsExpression + '" ng-if="edit"></select>';
        else if(attrs.type==='auto-complete') return '<div auto-complete selected-object="$parent.editInput" local-data="localData"' +
          ' search-fields="' + attrs.searchFields + ' " title-field="' + attrs.titleField + '" input-class="cui-input" '+
          ' match-class="highlight" ng-init="matchModels()" auto-match="true"' +
          ' ng-if="edit" ng-keypress="listenForEnter($event)" initial-value="$parent.editInput.title"></div>';
        return '<input type="' + attrs.type + '" ng-model="$parent.editInput" class="cui-input" ' +
          'ng-init="matchModels()" ng-if="edit" ng-keypress="listenForEnter($event)" focus-if="focus"/>';
      };

      var getDisplayValue=function(){
        return '{{ display || model }}';
      }


      var element= $compile(
        '<p class="cui-expandable__review-item">' + getLabel() + ': <span ng-if="!edit">' +
        getDisplayValue() + '</span>' + getInput() +
        '<span class="cui-link" ng-click="toggleEdit()" ng-if="!edit"> Edit</span>' +
        '<span class="cui-link" ng-if="edit" ng-click="saveInput();toggleEdit();"> Save</span>'+
        '<span class="cui-link" ng-if="edit" ng-click="toggleEdit()"> Cancel</span></p>'
      )(scope);
      angular.element(ele[0]).html(element);

    }
  };
}]);