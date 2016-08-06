;(function(angular){
    'use strict'
    $.get('./app-config.json', configData => {
        const appConfig = configData
        angular.element(document).ready( () => {
            angular.module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
