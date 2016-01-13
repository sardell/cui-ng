# Inline-Edit

Create an inline edit component for any variable.

## Usage

```html
<inline-edit label="cui-org" model="app.organization.name"></inline-edit>
```

This will compile to

```html
    <p class="cui-expandable__review-item">
        {{"cui-org"| translate}}: <span ng-if="!edit">{{app.organization.name}}</span>
        <input type="text" ng-model="$parent.editInput" class="cui-input" ng-change="sayInput()" ng-init="matchModels()" ng-if="edit"/>
        <span class="cui-link" ng-click="toggleEdit()" ng-if="!edit"> Edit</span>
        <span class="cui-link" ng-if="edit" ng-click="saveInput();toggleEdit();"> Save</span>
        <span class="cui-link" ng-if="edit" ng-click="toggleEdit()"> Cancel</span>
    </p>
```

Note that whatever is put into the `label` attribute will compile using the cui-i18n filter `translate`. If instead you just want to use a static text label, change the attribute to `name` instead of `label`.