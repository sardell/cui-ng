angular.module('cui-ng')
.provider('$pagination', [function() {
    let paginationOptions;
    let userValue;

    this.setPaginationOptions = (valueArray) => {
        paginationOptions = valueArray;
    };

    this.getPaginationOptions = () => {
        return paginationOptions
    };

    this.setUserValue = (value) => { // sets the user value so that other pages that use that directive will have that value saved
        try {
            localStorage.setItem('cui.resultsPerPage',value);
        }
        catch (e){ }
        userValue = value;
    };

    this.getUserValue = () => {
        try {
            userValue = parseInt(localStorage.getItem('cui.resultsPerPage'));
        }
        catch (e){ }
        return userValue;
    }

    this.$get = () => this;
}])
