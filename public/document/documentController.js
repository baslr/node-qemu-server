define(['app', 'jquery'], function (_app, _jquery) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  var _jquery2 = _interopRequireDefault(_jquery);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /***
   * (c) 2016 by duo.uno
   *
   ***/

  var angularModule = ['$scope', '$routeParams', '$http', 'testService'];

  angularModule.push(function (scope, params, http, testService) {
    console.log('init documentController');
    scope.params = params;

    var from = scope.from = Number(params.from);
    var to = Number(params.to);
    var index = scope.index = Number(params.index);
    scope._doc = {};

    testService.test().then(function (results) {
      var _results;

      return _results = results, scope.docsLink = _results.docsLink, scope.prevDocLink = _results.prevDocLink, scope.nextDocLink = _results.nextDocLink, scope._keys = _results._keys, _results;
    });

    scope.obj = { data: {}, preferText: true, options: { mode: 'tree',
        change: function change(err) {
          if (err) {
            scope.obj.canSave = false;
          } else {
            // if
            scope.obj.canSave = true;
          } // else
        },
        onEditable: function onEditable(node) {
          if (-1 < ['_key', '_id', '_rev'].indexOf(node.field) && node.path.length == 1) return false;
          return true;
        } },
      canSave: true
    };

    http.get('/_db/' + params.currentDatabase + '/_api/document/' + params.currentCollection + '/' + params.documentKey).then(function (data) {
      scope.obj.data = data.data;
      var _arr = ['_id', '_rev', '_key', '_from', '_to'];
      for (var _i = 0; _i < _arr.length; _i++) {
        var type = _arr[_i];
        if (data.data[type] === undefined) continue;
        scope._doc[type] = data.data[type];
        delete data.data[type];
      } // for
      resize();
    });

    scope.saveDoc = function () {
      console.log(scope.obj.data);
      console.log(Object.assign({}, scope.obj.data, scope._doc));
      http.put('/_db/' + params.currentDatabase + '/_api/document/' + params.currentCollection + '/' + params.documentKey, scope.obj.data).then(function (data) {
        console.log(data);
      });
    };

    // todo: fix uglyness maybe in css?
    var resize = function resize() {
      return $('DIV#ngeditor').css('height', window.document.documentElement.clientHeight - $('div#ngeditor').position().top + 'px');
    };
    $(window).on('resize', resize);
    scope.$on('$destroy', function () {
      console.log('destroy');
      $(window).off('resize', resize);
    });
  });

  _app2.default.controller('documentController', angularModule);

  // FOR x IN @@collection LET att = SLICE(ATTRIBUTES(x), 0, 25) SORT TO_NUMBER(x._key) == 0 ? x._key : TO_NUMBER(x._key) LIMIT @offset, @count RETURN KEEP(x, att)"
});