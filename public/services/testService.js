define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$route', '$routeParams', 'queryService', 'fastFilterService', '$q']; /***
                                                                                              * (c) 2016 by duo.uno
                                                                                              *
                                                                                              ***/

  // @todo add fastFilter statement maybe into query.query


  angularModule.push(function (route, params, query, fastFilter, q) {

    return {
      test: function test() {
        var d = q.defer();

        var from = params.from;
        var to = params.to;
        var index = params.index;

        from = Number(from);
        to = Number(to);
        index = Number(index);
        var offset = from + index - 1;
        var batchSize = to - from + 1;
        var prevDocLink = '',
            nextDocLink = '',
            docsLink = '';

        var limit = 3;
        if (offset < 0) {
          offset = 0;
          limit = 2;
        } // if
        query.query('for doc in ' + params.currentCollection + ' ' + fastFilter.currentRule() + '\n limit ' + offset + ',' + limit + ' return doc._key').then(function (result) {
          result = result.result;
          var newIndex = index + 1;
          if (newIndex > batchSize - 1) {
            nextDocLink = 'database/' + params.currentDatabase + '/collection/' + params.currentCollection + '/' + (from + batchSize) + '/' + (to + batchSize) + '/0/document/' + result.slice(-1)[0];
          } else {
            nextDocLink = 'database/' + params.currentDatabase + '/collection/' + params.currentCollection + '/' + from + '/' + to + '/' + (index + 1) + '/document/' + result.slice(-1)[0];
          }
          newIndex = index - 1;
          if (newIndex < 0) {
            prevDocLink = 'database/' + params.currentDatabase + '/collection/' + params.currentCollection + '/' + (from - batchSize) + '/' + (to - batchSize) + '/' + (batchSize - 1) + '/document/' + result.slice(0, 1)[0];
          } else {
            prevDocLink = 'database/' + params.currentDatabase + '/collection/' + params.currentCollection + '/' + from + '/' + to + '/' + (index - 1) + '/document/' + result.slice(0, 1)[0];
          }
          docsLink = 'database/' + params.currentDatabase + '/collection/' + params.currentCollection + '/' + from + '/' + to;
          d.resolve({ docsLink: docsLink, prevDocLink: prevDocLink, nextDocLink: nextDocLink, _keys: result });
        });
        return d.promise;
      }
    };
  });

  _app2.default.service('testService', angularModule);
});