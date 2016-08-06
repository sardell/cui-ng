angular.module('cui-ng')
.provider('$cuiIcon', function () {
    let iconSets = {}

    this.iconSet = (namespace, path, viewBox) => {
        iconSets[namespace] = { path, viewBox }
    }

    this.getIconSets = () => iconSets

    this.getIconSet = (namespace) => {
        if (!iconSets[namespace]) {
            throw new Error(`The icon collection with the namespace ${namespace} is not yet defined in the $cuiIcon provider.`)
        }
        return iconSets[namespace]
    }

    this.$get = function () {
        return this
    }
})