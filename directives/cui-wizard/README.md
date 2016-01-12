# CUI Wizard
Version 1.0


### Description
Cui-wizard is an angular directive that, following a few syntax rules, allows the developer to easily create a multi-step form or any other component that requires a "step-through" approach.

### Usage Example

```html
  <cui-wizard step="{{begginingStep}}" clickable-indicators minimum-padding="30" bar mobile-stack>
    <indicator-container></indicator-container>
    <step title="{{step1Title}}" state="{{stateName}}" icon="{{iconRef/Link}}">
      *step1 contents go here*
    </step>
    <step title="{{step2Title}}">
      *step2 contents go here*
    </step>
  </cui-wizard>
```

WARNING: If you're using ng-include to populate each step and you're using the `mobile-stack` feature, make sure to use only 1 ng-include with all of the content and use this syntax : '<div ng-include="'<path>.html'"></div>'

#### Variables
1. `{{beggining Step}}` -> the step the wizard will start on.
2. `{{stepXTitle}}` -> the titles that will populate the indicator-container.
3. `{{stateName}}` -> the name of the state that the user is redirected to when he clicks that indicator, assuming he defined `clickable-indicators`.
4. `{{iconRef/Link}}` -> reference to the icon that will appear under the for the step. (look below for more info on how this works)

### How it works / features
The directive will start by reading the `title` atributes on each `step` element within the `cui-wizard`. 
Then it creates step indicators (these are given `.step-indicator` class) which will be clickable depending on the presence of the `clickable-indicators` atribute.
The step that is currently active will give it's corresponding indicator an `.active` class.

As for the `icon`, if it contains a dot (.) the directive will interpret it as a link to an img and will create an img tag with a class of `.icon`. If it does not contain any dots it will automatically use the [`cui-icon directive`](https://github.com/thirdwavellc/cui-ng/tree/master/directives/cui-icon) to create an svg icon under the label, once again with an `.icon` class.

#### Changing steps
Anywhere inside of this directive you can position an element with an `ng-click` directive that calls one of 4 navigating functions:

*Note: variables in `<< >>` means they are optional. If << stateName >> is defined, it will also update the current state to whatever state is passed.

1. `next(<< nextStateName >>*)` -> increases the `step` attribute on cui-wizard by 1 and updates the wizard accordingly.
2. `nextWithErrorChecking(formName, << nextStateName >>*)` -> checks if every form field in that step is valid and will set a scope variable called `invalidForm[i]` (where i is the current step) to true if there are any errors. If there aren't errors, it simply calls `next()`. (you have to give your form and your inputs `name` attributes for this to work)
3. `goToStep(i)` -> navigates to a step with index i (note, steps start counting from 1)
4. `previous(<< previousStateName >>*)` -> navigates to the previous step
5. `goToState(state)` ->This is called automatically by `next`,`nextWithErrorChecking` and previous, if states are passed. What it does is use `$rootScope.$broadcast` to broadcast `'stepChange'` with {state:statePassed} as the data. This means you can use `$scope.$on` in your controller and listen for `'stepChange'`,like this:
```javascript
angular.module('app',['cui-ng','ui.router'])
.run(['$rootScope','wizardStep',function($rootScope,wizardStep){
  $rootScope.$on('$stateChangeStart', function(event, toState){
    if(toState.data && toState.data.step){
        wizardStep.set(toState.data.step);
        $rootScope.$broadcast('stepChange');
    }
  })
}])
.config(['$stateProvider','$urlRouterProvider','$injector',function($stateProvider,$urlRouterProvider,$injector){
  $stateProvider
    .state('wizard',{
        url: '/wizard',
        templateUrl: 'assets/angular-templates/cui-wizard.html',
        data: {
            step: 1
        }
    })
    .state('wizard.organization',{
        url: '/organization',
        data: {
            step: 1
        }
    })
    .state('wizard.signOn',{
        url: '/signOn',
        data: {
            step: 2
        }
    })
     .state('wizard.user',{
        url: '/user',
        data: {
            step: 3
        }
    })
    .state('wizard.review',{
        url: '/review',
        data: {
            step: 4
        }
    });
    
    //fixes infinite digest loop with ui-router
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('wizard');
    });
}])
.factory('wizardStep',[function(){
  var step;
  return{
      get: function(){
          return step;
      },
      set: function(newStep){
          step=newStep;
      }
  }
}])
.controller('appCtrl',['$scope','$state','wizardStep',function($scope,$state,wizardStep){
  $scope.$on('stepChange',function(e,data){
    if(data && data.state){
        app.goTo(data.state);
    }
    app.step=wizardStep.get();
  })
    
  app.goTo= function(state){
    $state.go(state,{notify:true,reload:true});
  }
}])
```

#### Key features
One of the key features of this wizard is indicator collision detection. What this means is:
Whenever the wizard is first shown or the window is rezised the directive will check that there is enough space within `indicator-container` to show all the step indicators AND the minimum padding (in px) between each of them, which is defined by `minimum-padding`. 

If there isn't enough space then `indicator-container` gets applied a class of `.small` that can then be used to style accordingly with css. (tip: use this in conjunction with `.active` class on the indicators to give emphasis to the currently active step, by, for example, only showing the active step when there isn't enough room.

The `bar` attribute activates a bar with `.steps-bar` class within the `indicator-container`. Inside of this bar there will be another bar with a class of `.steps-bar-fill` that will increase in width based on the current step. (Note: Currently the bar grows from the middle of the 1st step indicator up to the middle of the last one)

The `mobile-stack` attribute will create dupes of your wizard's steps, using the `cui-expandable` directive. These dupes will have a `mobile-element` class and the original steps will be given a `desktop-element` class. We can then style these classes to give a different look and feel on mobile (the styling will be included in cui-styleguide).

Cui-wizard will also listen for `'languageChange'` broadcasts on scope, and will fire the function that ensures there's enough room to show all of the indicators (and apply the class of `.small` to the `indicator-container` if there isn't). This is specifically built in for use with the [cui-i18n](https://github.com/thirdwavellc/cui-i18n) module.
