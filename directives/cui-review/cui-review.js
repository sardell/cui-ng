angular.module('cui-ng')
.directive('cuiReview', ['$compile', function($compile){
  return {
    restrict: 'E',
    scope:{
      model: '=model' 
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
      scope.sayInput=function(){
        console.log(scope.editInput);
      };

      var element= $compile(
        '<p class="cui-expandable__review-item">{{"' + attrs.label + '"| translate}}: <span ng-if="!edit">{{model}}</span>' +
        '<input type="text" ng-model="editInput" class="cui-input" ng-change="sayInput()" ng-init="matchModels()" ng-if="edit"/>' +
        '<span class="cui-link" ng-click="toggleEdit()" ng-if="!edit"> Edit</span>' + 
        '<span class="cui-link" ng-if="edit" ng-click="saveInput();toggleEdit();"> Save</span>'+
        '<span class="cui-link" ng-if="edit" ng-click="toggleEdit()"> Cancel</span>'
      )(scope);
      angular.element(ele[0]).html(element);
    }
  };
}]);