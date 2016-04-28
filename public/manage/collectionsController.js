define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', '$http', '$routeParams', 'messageBrokerService', 'formatService', '$q']; /***
                                                                                                           * (c) 2016 by duo.uno
                                                                                                           *
                                                                                                           ***/

  angularModule.push(function (scope, http, params, messageBroker, formatService, q) {
    scope.format = formatService;
    scope.params = params;
    scope.Number = Number;
    scope.showNewColForm = false;
    scope.newCol = { type: 2, waitForSync: true, isVolatile: false, indexBuckets: 8, isSystem: false, doCompact: true, journalSize: 1024 * 1024 * 32 };

    scope.indexBucketSizes = {};
    for (var i = 1; i <= 1024; i = i * 2) {
      scope.indexBucketSizes[i] = 1;
    }scope.reloadCollections = function () {
      http.get('/_db/' + params.currentDatabase + '/_api/collection').then(function (data) {
        scope.collections = data.data.collections;
        scope.colIds = {}; // map colId to collections[]
        scope.indexes = {};

        scope.collections.forEach(function (col) {
          col.expanded = false;
          scope.colIds[col.id] = col;
        });
      });
    };
    scope.reloadCollections();

    scope.orderCollection = function (col) {
      return !col.isSystem + '_' + col.name;
    };

    scope.loadColDetails = function (col, open) {
      if (!open) return;
      if (col.status == 3) {
        http.get('/_db/' + params.currentDatabase + '/_api/collection/' + col.id + '/figures').then(function (data) {
          Object.assign(scope.colIds[col.id], data.data);
          col.editName = col.name;
          col.journalSize2 = col.journalSize;
          col.journalSize10 = col.journalSize;
        });
        http.get('/_db/' + params.currentDatabase + '/_api/index?collection=' + col.id).then(function (data) {
          return scope.indexes[col.id] = data.data.indexes;
        });
      } // if
    };

    scope.createNewCollection = function () {
      return http.post('/_db/' + params.currentDatabase + '/_api/collection', scope.newCol).then(function (data) {
        scope.reloadCollections();
        messageBroker.pub('collections.reload');
      });
    };

    scope.doAction = function (action, col) {
      if (col.status == 2 && action != 'load') return;
      var promise = void 0;
      switch (action) {
        case 'load':
          promise = http.put('/_db/' + params.currentDatabase + '/_api/collection/' + col.name + '/load', { count: false });
          break;

        case 'unload':
          promise = http.put('/_db/' + params.currentDatabase + '/_api/collection/' + col.name + '/unload');
          break;

        case 'truncate':
          if (!confirm('Really truncate collection?')) return;
          promise = http.put('/_db/' + params.currentDatabase + '/_api/collection/' + col.name + '/truncate');
          break;

        case 'rotate':
          promise = http.put('/_db/' + params.currentDatabase + '/_api/collection/' + col.name + '/rotate');
          break;

        case 'rename':
          promise = http.put('/_db/' + params.currentDatabase + '/_api/collection/' + col.name + '/rename', { name: col.editName });
          break;

        case 'indexBuckets':
        case 'waitForSync':
        case 'journalSize2':
        case 'journalSize10':
          promise = http.put('/_db/' + params.currentDatabase + '/_api/collection/' + col.name + '/properties', {
            indexBuckets: col.indexBuckets,
            waitForSync: col.waitForSync,
            journalSize: action == 'journalSize2' ? col.journalSize2 : col.journalSize10 });
          break;
      } // switch

      promise.then(function (data) {
        switch (action) {
          case 'rename':
            messageBroker.pub('collections.reload');
            scope.loadColDetails(col, true);
            break;

          case 'load':
            messageBroker.pub('collections.reload');
            col.status = 3;
            scope.loadColDetails(col, true);
            break;

          case 'unload':
            col.status = 2;
            col.figures = {};
            delete scope.indexes[col.id];
            messageBroker.pub('collections.reload');
            break;

          case 'truncate':
          case 'rotate':
          case 'indexBuckets':
          case 'waitForSync':
          case 'journalSize2':
          case 'journalSize10':
            scope.loadColDetails(col, true);
            break;
        } // switch
      }, function (err) {
        messageBroker.pub(col.id + '-feedback', { msg: 'ERRNo: ' + err.data.errorNum + ', ' + err.data.errorMessage, type: 'danger' });
        scope.loadColDetails(col, true);
      });
    };

    scope.dropCol = function (col, ev) {
      ev.stopPropagation();
      if (!confirm('delete collection ' + col.name + '?')) return;
      http.delete('/_db/' + params.currentDatabase + '/_api/collection/' + col.name).then(function () {
        scope.reloadCollections();
        messageBroker.pub('collections.reload');
      });
    };
  });

  _app2.default.controller('collectionsController', angularModule);
});