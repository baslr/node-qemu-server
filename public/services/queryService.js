define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$http', '$q', 'messageBrokerService']; /***
                                                                * (c) 2016 by duo.uno
                                                                *
                                                                ***/

  angularModule.push(function (http, q, messageBroker) {

    return {
      query: function query(_query) {
        var d = q.defer();
        console.log('AQL-QUERY', _query);
        http.post('/_db/' + messageBroker.last('current.database') + '/_api/cursor', { cache: false, query: _query, options: { fullCount: true } }).then(function (data) {
          d.resolve(data.data);
        });
        return d.promise;
      }
    };
  });

  _app2.default.service('queryService', angularModule);
});