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
    var collectionName = '';

    http.get('collections').then(function (result) {
      collectionName = result.data.settings;
      reloadQueries();
    });

    var reloadQueries = function reloadQueries() {
      http.get('/_db/_system/_api/document/' + collectionName + '/savedQueries').then(function (data) {

        for (var key in data.data.queries) {
          queries.queries[key] = data.data.queries[key];
        } // for
      });
    };

    var queries = {
      queries: { unsaved: { name: 'unsaved', options: { eval: 'blur', max: 1000 }, query: '// eval:asap max:all table:true name:unsaved\n// query\n' } },
      currentName: function currentName() {
        return queries.queries[messageBroker.last('current.query')].name;
      },
      save: function save() {
        http.patch('/_db/_system/_api/document/' + collectionName + '/savedQueries', { queries: queries.queries });
      }
    };

    return queries;
  });

  _app2.default.service('queriesService', angularModule);
});