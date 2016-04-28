define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', 'messageBrokerService'];
  angularModule.push(function (scope, messageBroker) {
    messageBroker.pub('current.collection', '');
    messageBroker.pub('collections.reload');
  });

  _app2.default.controller('collectionsController', angularModule);
});