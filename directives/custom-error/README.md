# custom-error

Attach custom errors to an input based on custom validation functions.
The validation function can compare scope variables or even server side checking.

## Usage

In your controller add an array of "error" objects, like this

```javascript
app.customErrors=[
    {
        name:'devil',
        check:function(){
            return app.test!=='666'; // careful for data types
        }
    },
    {
        name:'idTaken',
        check:function(){
            var idTaken=API.checkIfIDIsTaken(app.test);
            return idTaken;
        }
    }
];
```

Then link the errors in your template.
```html
<form name="myForm">
    <input type="text" custom-error="app.customErrors" ng-model="app.test" name="myField" />
    <div ng-show="myForm.myField.$error.devil">Away devil!</div>
    <div ng-show="myForm.myField.$error.idTaken">That ID is taken!</div>
</form>
```
