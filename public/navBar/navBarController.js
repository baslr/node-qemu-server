define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /***
   * (c) 2016 by duo.uno
   *
   ***/

  var stat = 'LET r = (FOR d IN _statistics sort d.time desc limit @time RETURN d)\nlet x = MERGE(FOR t IN [\'http\', \'client\', \'system\']\nlet z = MERGE(FOR a IN ATTRIBUTES(r[0][t])\nfilter !CONTAINS(a, \'Percent\')\nRETURN {[a]: sum(r[*][t][a]) / @time})\nRETURN {[t]:z}) RETURN x';

  var angularModule = ['$scope', '$http', '$interval', 'formatService', 'messageBrokerService', '$location'];

  angularModule.push(function (scope, http, interval, format, messageBroker, location) {
    console.log('init navBarController');
    scope.format = format;

    scope.collectionsBarStatus = 1;
    scope.changeCollectionsBarStatus = function () {
      scope.collectionsBarStatus++;if (scope.collectionsBarStatus > 1) scope.collectionsBarStatus = 0;messageBroker.pub('collectionsbar.status', scope.collectionsBarStatus);
    };

    http.get('/_db/_system/_api/version').then(function (data) {
      scope.cfg.arango = data.data;
      http.jsonp('https://www.arangodb.com/repositories/versions.php?jsonp=JSON_CALLBACK&version=' + scope.cfg.arango.version + '&callback=JSON_CALLBACK').then(function (data) {
        scope.cfg.availableVersions = Object.keys(data.data).sort().map(function (key) {
          return data.data[key].version + ' ' + key;
        }).join(', ');
        if (scope.cfg.availableVersions) {
          scope.cfg.availableVersions = '(' + scope.cfg.availableVersions + ' available)';
        } // if
      });
    });
    http.get('/_api/database').then(function (data) {
      return scope.cfg.dbs = data.data.result;
    });

    scope.cfg = {};
    scope.cfg.arango = 'n/a';
    scope.cfg.dbs = [];
    scope.cfg.selectedDb = '';

    scope.databaseChanged = function () {
      return location.url('/database/' + scope.cfg.selectedDb);
    };

    scope.$on('current.database', function (e, database) {
      return scope.cfg.selectedDb = database;
    });
    messageBroker.sub('current.database', scope);

    scope.refreshStats = function () {
      http.post('/_db/_system/_api/cursor', { cache: false, query: stat, bindVars: { time: 6 } }).then(function (data) {
        return scope.cfg.stats = data.data.result[0];
      });
    };
    scope.refreshStats();
    interval(scope.refreshStats, 10 * 1000);
  });

  _app2.default.controller('navBarController', angularModule);
});