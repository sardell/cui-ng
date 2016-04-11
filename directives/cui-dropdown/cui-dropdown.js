angular.module('cui-ng')
.directive('cuiDropdown', ['$compile','$timeout','$filter',function($compile,$timeout,$filter) {
    return {
        require:'ngModel',
        restrict: 'E',
        scope: {
            ngModel:'=',
            options:'&',
            constraints: '&'
        },
        link: function(scope, elem, attrs, ctrl) {
            var id=scope.$id;
            var self,newScope,formName,inputName=('cuiDropdown'+id);
            var cuiDropdown = {
                initScope: function() {
                    self = this;
                    if(attrs.ngRequired || attrs.required){
                        ctrl.$validators['required']=function(){
                           return ctrl.$viewValue!==null;
                        };
                    }
                    angular.forEach(self.watchers,function(initWatcher){
                        initWatcher();
                    });
                    angular.forEach(self.scope,function(value,key){
                        scope[key]=value;
                    });
                    self.helpers.setInitialInputValue();
                },
                config: {
                    inputClass: attrs.class || 'cui-dropdown',
                    dropdownWrapperClass: attrs.dropdownClass || 'cui-dropdown__current-value',
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
                    dropdownClick:function(){
                        scope.$on(id.toString(),self.helpers.reassignModel); // each dropdown item broadcasts the cui-dropdown scope id and passes the index of the choice
                    },
                    languageChange:function(){
                        scope.$on('languageChange',self.helpers.handleLanguageChange)
                    },
                    options:function(){
                        scope.$watch(scope.options,function(newOptions,oldOptions){
                            if(newOptions) {
                                self.helpers.setInitialInputValue();
                                self.render.currentValueBox();
                            }
                        },function(newOptions,oldOptions){
                            return !angular.equals(newOptions,oldOptions);
                        });
                    }
                },
                scope:{
                    renderDropdown:function(){
                        if(!self.selectors.$dropdown){
                            self.render.dropdown();
                        }
                    },
                    destroyDropdown:function(){
                        if(self.selectors.$dropdown) {
                            self.selectors.$dropdown.detach();
                            self.selectors.$dropdown=null;
                        }
                    }
                },
                helpers: {
                    getOptions:function(){
                        return scope.options();
                    },
                    getKeyValue:function(keyString,object){
                        var keys=keyString.split('.').slice(1);
                        if(keys.length===0) return object;
                        else {
                            var returnValue;
                            var i=0;
                            do {
                                returnValue? returnValue=returnValue[keys[i]] : returnValue=object[keys[i]];
                                i++;
                            }
                            while (i<keys.length);
                        }
                        return returnValue;
                    },
                    getOptionDisplayValues:function(){
                        var displayValues=[];
                        if(self.config.defaultOption) {
                            if(self.config.defaultOptionValue.indexOf('(')>-1){
                                var arrayWithKeyAndFilter=self.config.displayValue.replace(/( |\)|\))/g,'').split('|');
                                var filter=arrayWithKeyAndFilter[1];
                                var keyString=arrayWithKeyAndFilter[0];
                                displayValues.push($filter(filter)(keyString));
                            }
                            else displayValues.push(self.config.defaultOptionValue);
                        }
                        if(self.config.displayValue.indexOf('(')>-1){
                            var arrayWithKeyAndFilter=self.config.displayValue.replace(/( |\)|\))/g,'').split('|');
                            var filter=arrayWithKeyAndFilter[1];
                            var keyString=arrayWithKeyAndFilter[0];
                        }
                        else var keyString=self.config.displayValue;
                        scope.options().forEach(function(option){
                            if(filter) displayValues.push($filter(filter)(self.helpers.getKeyValue(keyString,option)));
                            else displayValues.push(self.helpers.getKeyValue(keyString,option));
                        });
                        return displayValues;
                    },
                    getOptionReturnValues:function(){
                        var returnValues=[];
                        if(self.config.defaultOption) {
                            returnValues.push(null);
                        }
                        scope.options().forEach(function(option){
                            returnValues.push(self.helpers.getKeyValue(self.config.returnValue,option));
                        });
                        return returnValues;
                    },
                    getDropdownItem:function(index,displayValue){
                        var ngClick=' ng-click="$root.$broadcast(\''+ id + '\',' + index + ')" ';
                        return $compile(
                            String.prototype.concat('<div class="', self.config.dropdownItemClass,'"',ngClick,'>',
                                displayValue,
                            '</div>')
                        )(scope);
                    },
                    setInitialInputValue:function(){
                        var displayValues=self.helpers.getOptionDisplayValues();
                        var returnValues=self.helpers.getOptionReturnValues();
                        if(!scope.ngModel) {
                            scope.displayValue=displayValues[0];
                            scope.ngModel=returnValues[0];
                            return;
                        }
                        var index=_.findIndex(returnValues, function(value) {
                            return angular.equals(value,scope.ngModel)
                        });
                        if(index>-1){
                            scope.displayValue=displayValues[index];
                        }
                        else {
                            scope.displayValue=displayValues[0];
                            scope.ngModel=returnValues[0];
                        }
                    },
                    reassignModel:function(e,index){
                        var index=parseInt(index);
                        var displayValues=self.helpers.getOptionDisplayValues();
                        var returnValues=self.helpers.getOptionReturnValues();
                        scope.displayValue=displayValues[index];
                        scope.ngModel=returnValues[index];
                        self.scope.destroyDropdown();
                    },
                    handleLanguageChange:function(){
                        self.helpers.reassignModel();
                    }
                },
                render: {
                    currentValueBox: function() {
                        if(newScope) newScope.$destroy(); // this makes sure that if the input has been rendered once the off click handler is removed
                        newScope=scope.$new();
                        var element = $compile(
                            String.prototype.concat(
                                '<div class="', self.config.inputClass, '" ng-click="renderDropdown()" off-click="destroyDropdown()">',
                                    '{{displayValue}}',
                                '</div>'
                            )
                        )(newScope);
                        self.selectors.$cuiDropdown.replaceWith(element);
                        self.selectors.$cuiDropdown=element;
                    },

                    dropdown: function() {
                        var dropdown = $compile(
                            String.prototype.concat(
                                '<div class="', self.config.dropdownWrapperClass, '">',
                                '</div>'
                            )
                        )(scope);
                        var displayValues=self.helpers.getOptionDisplayValues();
                        displayValues.forEach(function(value,i){
                            dropdown.append(self.helpers.getDropdownItem(i,value));
                        });
                        dropdown.width(self.selectors.$cuiDropdown.outerWidth()*0.9);
                        self.selectors.$dropdown=dropdown;
                        self.selectors.$body.append(dropdown);
                        new Tether({
                            element:self.selectors.$dropdown[0],
                            target:self.selectors.$cuiDropdown[0],
                            attachment:self.config.attachment,
                            targetAttachment:self.config.targetAttachment,
                            constraints:scope.constraints() || self.config.defaultConstraints
                        });
                    }
                }
            };
            cuiDropdown.initScope();
        }
    };

}]);