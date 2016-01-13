angular.module('cui-ng')
.directive('inlineEdit', ['$compile', function($compile){
  return {
    restrict: 'E',
    scope:{
      model: '=',
      type: '@',
      options: '='
    },
    link: function(scope,ele,attrs){
      scope.edit=false;
      scope.toggleEdit=function(){
        scope.edit=!scope.edit;
      };
      scope.matchModels=function(){
        scope.editInput=scope.model;
      };
      scope.saveInput=function(){
        scope.model=scope.editInput;
      };
      scope.listenForEnter=function(e){
        if(e.keyCode===13) {scope.toggleEdit();scope.saveInput();}
      };

      var getLabel=function(){
        if(attrs.label!==undefined) return '{{"' + attrs.label + '"| translate}}';
        else if(attrs.name!==undefined) return attrs.name;
        else console.log('Inline-edit needs 1 of the following attributes: label or name.');
      };

      var getInput=function(){
        attrs.type=attrs.type || 'text';
        console.log(attrs);
        if(attrs.type==='dropdown') return '<select ng-model="$parent.editInput" class="cui-select" ' +
          'ng-init="matchModels()" ng-options="' + attrs.optionsExpression + '" ng-if="edit"></select>';
        return '<input type="' + attrs.type + '" ng-model="$parent.editInput" class="cui-input" ' +
          'ng-init="matchModels()" ng-if="edit" ng-keypress="listenForEnter($event)"/>';
      };

      var element= $compile(
        '<p class="cui-expandable__review-item">' + getLabel() + ': <span ng-if="!edit">{{model}}</span>' +
        getInput() +
        '<span class="cui-link" ng-click="toggleEdit()" ng-if="!edit"> Edit</span>' + 
        '<span class="cui-link" ng-if="edit" ng-click="saveInput();toggleEdit();"> Save</span>'+
        '<span class="cui-link" ng-if="edit" ng-click="toggleEdit()"> Cancel</span></p>'
      )(scope);
      angular.element(ele[0]).html(element);

    }
  };
}]);