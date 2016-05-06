angular.module('cui-ng')
.directive('cuiDropdown', ['$compile','$timeout','$filter',($compile,$timeout,$filter) => {
    return {
        require:'ngModel',
        restrict: 'E',
        scope: {
            ngModel:'=',
            options:'&',
            constraints: '&'
        },
        link: (scope, elem, attrs, ctrl) => {
            const id=scope.$id, inputName=(`cuiDropdown${id}`);
            let self, newScope, dropdownScope, formName, currentIndex;

            const cuiDropdown = {
                initScope: () => {
                    if(attrs.ngRequired || attrs.required){
                        ctrl.$validators['required'] = () => ctrl.$viewValue!==null;
                    }
                    angular.forEach(cuiDropdown.watchers,(initWatcher) => {
                        initWatcher();
                    });
                    angular.forEach(cuiDropdown.scope,(value,key) => {
                        scope[key]=value;
                    });
                },
                config: {
                    inputClass: attrs.class || 'cui-dropdown',
                    dropdownWrapperClass: attrs.dropdownClass || 'cui-dropdown__wrapper',
                    dropdownItemClass: attrs.dropdownItemClass || 'cui-dropdown__item',
                    attachment: attrs.attachment || 'top left',
                    targetAttachment: attrs.targetAttachment || 'top left',
                    offset: attrs.offset || '0 0',
                    defaultConstraints: [{ to: 'window', attachment: 'together none'}],
                    returnValue: attrs.returnValue || 'option',
                    displayValue: attrs.displayValue || 'option',
                    required: attrs.ngRequired || attrs.required || false,
                    defaultOption: angular.isDefined(attrs.defaultOption),
                    defaultOptionValue: attrs.defaultOption || '("select-one" | translate)'
                },
                selectors: {
                    $cuiDropdown: angular.element(elem),
                    $body: angular.element(document.body)
                },
                watchers:{
                    dropdownClick:() => {
                        scope.$on(id.toString(),cuiDropdown.helpers.reassignModel); // each dropdown item broadcasts the cui-dropdown scope id and passes the index of the choice
                    },
                    languageChange:() => {
                        scope.$on('languageChange',cuiDropdown.helpers.handleLanguageChange)
                    },
                    options:() => {
                        scope.$watch(scope.options,(newOptions,oldOptions) => {
                            if(newOptions) {
                                cuiDropdown.helpers.setInitialInputValue();
                                cuiDropdown.render.currentValueBox();
                            }
                        },(newOptions,oldOptions) => !angular.equals(newOptions,oldOptions));
                    }
                },
                scope:{
                    toggleDropdown:() => {
                        if(!cuiDropdown.selectors.$dropdown){
                            cuiDropdown.render.dropdown();
                        }
                        else cuiDropdown.scope.destroyDropdown();
                    },
                    destroyDropdown:function(){
                        if(cuiDropdown.selectors.$dropdown) {
                            dropdownScope.$destroy();
                            cuiDropdown.selectors.$dropdown.detach();
                            cuiDropdown.selectors.$dropdown=null;
                        }
                    }
                },
                helpers: {
                    getOptions:() => scope.options(),
                    getKeyValue:(keyString,object) => {
                        const keys=keyString.split('.').slice(1);
                        let returnValue;
                        if(keys.length===0) return object;
                        else {
                            let i=0;
                            do {
                                returnValue? returnValue=returnValue[keys[i]] : returnValue=object[keys[i]];
                                i++;
                            }
                            while (i<keys.length);
                        }
                        return returnValue;
                    },
                    getOptionDisplayValues:() => {
                        let displayValues = [];
                        let [ keyString, filter ] = cuiDropdown.config.displayValue.replace(/( |\)|\))/g,'').split('|');
                        const { defaultOption, defaultOptionValue, displayValue } = cuiDropdown.config;
                        if(defaultOption) {
                            if(defaultOptionValue.indexOf('(')>-1){
                                displayValues.push($filter(filter)(keyString));
                            }
                            else displayValues.push(defaultOptionValue);
                        }
                        if( displayValue.indexOf('(') < 0 ) keyString = displayValue;

                        switch (displayValue){
                            case 'value': // if we just want to display values from an object
                                angular.forEach(scope.options(),(val)=>{
                                    displayValues.push(val);
                                });
                                break;
                            case 'key':
                                angular.forEach(scope.option(),(val,key)=>{ // if we just want to display the keys from an object
                                    displayValues.push(key);
                                });
                                break;
                            default:
                                scope.options().forEach((option) => {
                                    if(displayValue.indexOf('|') >= 0) displayValues.push($filter(filter)(cuiDropdown.helpers.getKeyValue(keyString,option))); // if we're using a filter
                                    else displayValues.push(cuiDropdown.helpers.getKeyValue(keyString,option)); // else just get the correct key from the option object
                                });
                        };
                        return displayValues;
                    },
                    getOptionReturnValues:() => {
                        let returnValues=[];
                        const { defaultOption, returnValue } = cuiDropdown.config;
                        if(defaultOption) returnValues.push(null); // if there's a default option it won't have any return value
                        switch (returnValue){
                            case 'value':
                                angular.forEach(scope.options(),(val)=>{
                                    returnValues.push(val);
                                });
                                break;
                            case 'key':
                                angular.forEach(scope.options(),(val,key)=>{
                                    returnValues.push(key);
                                });
                                break;
                            default:
                                angular.forEach(scope.options(),(val)=>{
                                    returnValues.push(val);
                                });
                        };
                        return returnValues;
                    },
                    getDropdownItem:(index,displayValue) => {
                        let ngClick=`$root.$broadcast('${id}',${index})`;
                        return $compile(
                            `<div class="${cuiDropdown.config.dropdownItemClass}" ng-click="${ngClick}">
                                ${displayValue}
                            </div>`
                        )(scope);
                    },
                    setInitialInputValue:() => {
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                        const returnValues = cuiDropdown.helpers.getOptionReturnValues();
                        if(!scope.ngModel) {
                            scope.displayValue = displayValues[0];
                            scope.ngModel = returnValues[0];
                            currentIndex = 0;
                            return;
                        }
                        console.log('returns',returnValues);
                        console.log('model',typeof scope.ngModel);
                        let index = _.findIndex(returnValues, (value) => angular.equals(value,scope.ngModel))
                        if(index > -1){
                            scope.displayValue = displayValues[index];
                            currentIndex = index;
                        }
                        else {
                            scope.displayValue = displayValues[0];
                            scope.ngModel = returnValues[0];
                            currentIndex = 0;
                        }
                    },
                    reassignModel:(e,index) => {
                        if(typeof index === 'number'){
                          currentIndex = index;
                        }
                        else {
                          index = currentIndex;
                        }
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                        const returnValues=cuiDropdown.helpers.getOptionReturnValues();
                        scope.displayValue = displayValues[index];
                        scope.ngModel = returnValues[index];
                        cuiDropdown.scope.destroyDropdown();
                    },
                    handleLanguageChange:() => {
                        cuiDropdown.helpers.reassignModel();
                    }
                },
                render: {
                    currentValueBox: () => {
                        if(newScope) newScope.$destroy(); // this makes sure that if the input has been rendered once the off click handler is removed
                        newScope = scope.$new();
                        const element = $compile(
                            `<div class="${cuiDropdown.config.inputClass}" ng-click="toggleDropdown()" off-click="destroyDropdown()" id="cui-dropdown-${id}">
                                {{displayValue}}
                            </div>`
                        )(newScope);
                        cuiDropdown.selectors.$cuiDropdown.replaceWith(element);
                        cuiDropdown.selectors.$cuiDropdown=element;
                    },
                    dropdown: () => {
                        if(dropdownScope) dropdownScope.$destroy();
                        dropdownScope = scope.$new();
                        const dropdown = $compile(`<div class="${cuiDropdown.config.dropdownWrapperClass}" off-click-filter="#cui-dropdown-${id}"></div>`)(dropdownScope);
                        const displayValues=cuiDropdown.helpers.getOptionDisplayValues();
                        displayValues.forEach((value,i) => {
                            dropdown.append(cuiDropdown.helpers.getDropdownItem(i,value));
                        });
                        dropdown.width(cuiDropdown.selectors.$cuiDropdown.outerWidth() * 0.9);
                        cuiDropdown.selectors.$dropdown = dropdown;
                        cuiDropdown.selectors.$body.append(dropdown);
                        new Tether({
                            element:cuiDropdown.selectors.$dropdown[0],
                            target:cuiDropdown.selectors.$cuiDropdown[0],
                            attachment:cuiDropdown.config.attachment,
                            targetAttachment:cuiDropdown.config.targetAttachment,
                            constraints:scope.constraints() || cuiDropdown.config.defaultConstraints
                        });
                    }
                }
            };
            cuiDropdown.initScope();
        }
    };

}]);