define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', '$http', '$interval', 'messageBrokerService']; /***
                                                                                 * (c) 2016 by duo.uno
                                                                                 *
                                                                                 ***/

  angularModule.push(function (scope, http, interval, messageBroker) {
    console.log('define collectionsBarController');

    messageBroker.sub('collectionsbar.status collections.reload current.collection current.database', scope);
    scope.cfg = {};
    scope.status = 1;
    scope.collections = [];
    scope.currentCollection = '';
    scope.currentDatabase = '';

    scope.setCurrentCollection = function () {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = scope.collections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var col = _step.value;

          if (col.name == scope.currentCollection) {
            col.current = true;
          } else col.current = false;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };

    scope.reloadCollections = function () {
      return http.get('/_db/' + scope.currentDatabase + '/_api/collection').then(function (data) {
        scope.collections = data.data.collections;scope.setCurrentCollection();
      });
    };

    scope.$on('collectionsbar.status', function (e, status) {
      return scope.status = status;
    });

    scope.$on('collections.reload', function () {
      return scope.reloadCollections();
    });

    scope.$on('current.collection', function (e, currentCollection) {
      scope.currentCollection = currentCollection;scope.setCurrentCollection();
    });

    scope.$on('current.database', function (e, database) {
      if (database === scope.currentDatabase) return;
      scope.currentDatabase = database;
      scope.reloadCollections();
    });
  });

  _app2.default.controller('collectionsBarController', angularModule);
});