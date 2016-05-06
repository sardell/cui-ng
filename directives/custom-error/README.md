# custom-error

Attach custom errors to an input based on custom validation functions.
The validation function can compare scope variables or even server side checking.

## Usage

In your controller add an array of "error" objects, like this

```javascript
app.customErrors ={
        notAdmin:function(value) { // Client side checking
            return value !== 'admin' && value !== 'Admin';
        },
        usernameTaken:function(value) { // Server side checking. The valid method will be passed the response from the promise once it's resolved, there you need to do custom parsing
            // to make sure you return a boolean (true if valid or false if not valid)
            return {
                promise:fakeApi.checkIfUsernameAvailable(value),
                valid:function(res){
                    return res;
                },
                catch:function(err){
                    // do something with the error here
                }
            }
        },
};
```


Then link the errors in your template.
```html
<form name="myForm">
    <input type="text" custom-error="app.customErrors" custom-error-loading="app.loading" ng-model="app.test" name="myField"/>
    <span ng-if="myForm.myField.$error.notAdmin" class="error-message">Can't be admin</span>
    <span ng-if="myForm.myField.$error.usernameTaken" class="error-message">Username is taken</span>
    <span ng-if="app.loading">You'll see this if I'm waiting for a response to any of the promices passed (put a loading spinner based on this condition)</span>
</form>
```
