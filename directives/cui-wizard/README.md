# CUI Wizard
Version 1.0


### Description
Cui-wizard is an angular directive that, following a few syntax rules, allows the developer to easily create a multi-step form or any other component that requires a "step-through" approach.

### Usage Example
```html
  <cui-wizard step="{{begginingStep}}" clickable-indicators minimum-padding="30">
    <indicator-container></indicator-container>
    <step title="{{step1Title}}">
      *step1 contents go here*
    </step>
    <step title="{{step2Title}}">
      *step2 contents go here*
    </step>
  </cui-wizard>
```

### How it works / features
The directive will start by reading the `title` atributes on each `step` element within the `cui-wizard`. 
Then it creates step indicators (these are given `.step-indicator` class) which will be clickable depending on the presence of the `clickable-indicators` atribute.
The step that is currently active will give it's corresponding indicator an `.active` class.

#### Changing steps
Anywhere inside of this directive you can position an element with an `ng-click` directive that calls one of 4 navigating functions:

1. `next()` - increases the `step` attribute on cui-wizard by 1 and updates the wizard accordingly.
2. `nextWithErrorChecking()` - checks if every form field in that step is valid and will set a scope variable called `invalidForm[i]` (where i is the current step) to true if there are any errors. If there aren't errors, it simply calls `next()`. (you have to give your form and your inputs `name` attributes for this to work)
3. `goToStep(i)` - navigates to a step with index i (note, steps start counting from 1)
4. `previous()` - navigates to the previous step

#### Key features
One of the key features of this wizard is indicator collision detection. What this means is:
Whenever the wizard is first shown or the window is rezised the directive will check that there is enough space within `indicator-container` to show all the step indicators AND the minimum padding (in px) between each of them, which is defined by `minimum-padding`. 

If there isn't enough space then `indicator-container` gets applied a class of `.small` that can then be used to style accordingly with css. (tip: use this in conjunction with `.active` class on the indicators to give emphasis to the currently active step, by, for example, only showing the active step when there isn't enough room.

Cui-wizard will also listen for `'languageChange'` broadcasts on scope, and will fire the function that ensures there's enough room to show all of the indicators (and apply the class of `.small` to the `indicator-container` if there isn't). This is specifically built in for use with the [cui-i18n](https://github.com/thirdwavellc/cui-i18n) module.
