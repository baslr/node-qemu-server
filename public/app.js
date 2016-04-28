define(['exports', 'angular', 'angular-route', 'angular-animate', 'angular-sanitize', 'jsoneditor', 'ngjsoneditor'], function (exports, _angular2, _angularRoute, _angularAnimate, _angularSanitize, _jsoneditor, _ngjsoneditor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _angular3 = _interopRequireDefault(_angular2);

  var _angularRoute2 = _interopRequireDefault(_angularRoute);

  var _angularAnimate2 = _interopRequireDefault(_angularAnimate);

  var _angularSanitize2 = _interopRequireDefault(_angularSanitize);

  var _jsoneditor2 = _interopRequireDefault(_jsoneditor);

  var _ngjsoneditor2 = _interopRequireDefault(_ngjsoneditor);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /***
   * (c) 2016 by duo.uno
   *
   ***/

  window.JSONEditor = _jsoneditor2.default;

  var app = angular.module('app', ['ngRoute', 'ngAnimate', 'ngSanitize', 'ng.jsoneditor']);

  app.config(['$routeProvider', '$locationProvider', '$sceDelegateProvider', function (route, locationProvider, sceDelegateProvider) {

    locationProvider.html5Mode(true);

    // route.when('/database/:currentDatabase/manage/collections', {
    //   controller: 'collectionsController',
    //   templateUrl: 'manage/collectionsView.html'
    // });

    // route.when('/database/:currentDatabase/collection/:currentCollection/:from/:to', {
    //   controller: 'collectionController',
    //   templateUrl: 'collection/collectionView.html'
    // });

    // route.when('/database/:currentDatabase/collection/:currentCollection/:from/:to/:index/document/:documentKey', {
    //   controller: 'documentController',
    //   templateUrl: 'document/documentView.html'
    //   // resolve: {'formatService':'formatService'}
    // });

    // // A Q L
    // route.when('/database/:currentDatabase/aql', {
    //   controller:  'aqlController',
    //   templateUrl: 'aql/aqlView.html'
    // });

    // // A Q L
    // route.when('/database/:currentDatabase/graph', {
    //   controller:  'graphController',
    //   templateUrl: 'graph/graphView.html'
    // });

    // route.when('/collection/:collectionName/:from/:to/:index', {
    //   controller: 'documentRouteController',
    //   template:''
    // });

    // V M S
    route.when('/vms', {
      controller: 'vmsController',
      templateUrl: 'vms/vmsView.html'
    });

    route.otherwise({ redirectTo: '/vms' });
  }]);

  app.run(['$rootScope', '$location', 'messageBrokerService', '$routeParams', '$route', function (rootScope, location, messageBroker, routeParams, route) {
    messageBroker.pub('current.database', '_system');
    messageBroker.pub('current.fastFilter', 'none');
    messageBroker.pub('current.query', 'unsaved');
    messageBroker.pub('show.fastFilter', false);
    rootScope.$on('$routeChangeError', function (a, b, c, d) {
      console.log('routeChangeError');
    });

    /*
        route change start
        location change success
        location change start
        route change success
        |   route.current.params
        |   | routeParams
        rcs 0 0
        lcs 0 0
        lcs 1 0
        rcs 1 1
    */
    rootScope.$on('$routeChangeStart', function () {
      console.log('routeChangeStart');
      // if(route.current) console.log(JSON.stringify(route.current.params, false, 2));
      // console.log(JSON.stringify(routeParams,false, 2));
    });

    rootScope.$on('$locationChangeStart', function (e, newUrl, oldUrl) {
      console.log('locationChangeStart', oldUrl, newUrl);
      // if(route.current) console.log(JSON.stringify(route.current.params, false, 2));
      // console.log(JSON.stringify(routeParams,false, 2));
    });

    rootScope.$on('$locationChangeSuccess', function () {
      console.log('locationChangeSuccess');
      // if(route.current) console.log(JSON.stringify(route.current.params, false, 2));
      // console.log(JSON.stringify(routeParams,false, 2));

      if (route.current) {
        if (route.current.params.currentDatabase) messageBroker.pub('current.database', route.current.params.currentDatabase);
        if (route.current.params.currentCollection) messageBroker.pub('current.collection', route.current.params.currentCollection);else messageBroker.pub('current.collection', '');
      } // if
    });

    rootScope.$on('$routeChangeSuccess', function () {
      console.log('routeChangeSuccess');
      // if(route.current) console.log(JSON.stringify(route.current.params, false, 2));
      // console.log(JSON.stringify(routeParams,false, 2));
    });
  }]);

  exports.default = app;
});