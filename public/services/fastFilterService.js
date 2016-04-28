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
      reloadFilters();
    });

    var reloadFilters = function reloadFilters() {
      http.get('/_db/_system/_api/document/' + collectionName + '/fastFilter').then(function (data) {

        for (var key in data.data.rules) {
          fastFilter.rules[key] = data.data.rules[key];
        } // for
      });
    };

    var fastFilter = {
      rules: { 'none': { name: 'none', rule: '// none' } },
      currentRule: function currentRule() {
        return fastFilter.rules[messageBroker.last('current.fastFilter')].rule;
      },
      save: function save() {
        http.patch('/_db/_system/_api/document/' + collectionName + '/fastFilter', { rules: fastFilter.rules });
      }
    };

    return fastFilter;
  });

  _app2.default.service('fastFilterService', angularModule);
});