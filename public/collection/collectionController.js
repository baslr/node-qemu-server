define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', '$routeParams', '$http', 'messageBrokerService', 'queryService', 'formatService', 'fastFilterService']; /***
                                                                                                                                          * (c) 2016 by duo.uno
                                                                                                                                          *
                                                                                                                                          ***/

  angularModule.push(function (scope, params, http, messageBroker, query, format, fastFilterService) {
    scope.format = format;
    scope.params = params;

    var from = scope.from = Number(params.from);
    var to = scope.to = Number(params.to);
    scope.batchSize = to - from + 1;
    scope.docs = [];

    scope.rules = fastFilterService.rules;

    scope.fastFilter = { editableRule: scope.rules[messageBroker.last('current.fastFilter')].rule, selectedRule: messageBroker.last('current.fastFilter'), active: messageBroker.last('show.fastFilter') };
    scope.fastFilterRuleChanged = function () {
      scope.fastFilter.editableRule = scope.rules[scope.fastFilter.selectedRule].rule;
      messageBroker.pub('current.fastFilter', scope.fastFilter.selectedRule);
      scope.queryDocs();
    };

    scope.toggleFastFilterTexterea = function () {
      scope.fastFilter.active = !scope.fastFilter.active;
      messageBroker.pub('show.fastFilter', scope.fastFilter.active);
    };

    scope.applyFastFilter = function () {
      var fromBlur = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var lines = scope.fastFilter.editableRule.split('\n');
      var ruleName = undefined;
      var pos = $('textarea#filterRuleText').prop('selectionStart');
      var plusPos = 0;

      // first line does not match a rule name
      if (fromBlur) {
        if (! ~lines[0].search(/^\/\/\ *\S+/)) {
          ruleName = 'last unsaved';
          lines.unshift('// ' + ruleName);
        } else {
          ruleName = lines[0].match(/^\/\/\ +(.+)$/)[1].trim();
        }
      } else if (1 < lines.length) {
        // check position only when min 2 lines available
        if (~scope.fastFilter.editableRule.slice(0, pos).search('\n')) {
          try {
            ruleName = lines[0].match(/^\/\/\ *(.+)$/)[1].trim();
            if ('' == ruleName) {
              ruleName = 'last unsaved';
              lines[0] = '// last unsaved';
              plusPos = 12;
            }
          } catch (e) {
            ruleName = 'last unsaved';
            lines.unshift('// last unsaved');
            plusPos = 16;
          } // catch
        } // if
      } // else if

      if ('none' === ruleName) {
        lines[0] = '// last unsaved';
        ruleName = 'last unsaved';
        plusPos = 8;
      } // if

      setTimeout(function () {
        $('textarea#filterRuleText').prop('selectionStart', pos + plusPos); // 'last unsaved'.length + 1);
        $('textarea#filterRuleText').prop('selectionEnd', pos + plusPos); // 'last unsaved'.length + 1);
      }, 100);

      scope.fastFilter.editableRule = lines.join('\n');

      if (ruleName) {
        scope.rules[ruleName] = { name: ruleName, rule: scope.fastFilter.editableRule };
        scope.fastFilter.selectedRule = ruleName;
        messageBroker.pub('current.fastFilter', ruleName);
        fastFilterService.save();
      }

      scope.queryDocs();
    };

    http.get('/_db/' + params.currentDatabase + '/_api/collection/' + params.currentCollection + '/count').then(function (data) {
      scope.collectionInfo = data.data;
      messageBroker.pub('collections.reload');
      scope.queryDocs();
    });

    // call pagination
    scope.queryDocs = function () {
      query.query('for doc in ' + params.currentCollection + ' let attr = slice(attributes(doc), 0, 20) ' + scope.fastFilter.editableRule + ' \nlimit ' + params.from + ',' + scope.batchSize + ' return keep(doc, attr)').then(function (result) {
        scope.collectionInfo.count = result.extra.stats.fullCount;
        var pages = Math.ceil(result.extra.stats.fullCount / scope.batchSize);

        var curpage = from / scope.batchSize + 1;

        var left = curpage - 1;
        var right = pages - curpage;

        var arr = [];
        arr.push(curpage);

        for (var i = 1; i <= 3; i++) {
          if (left - i >= 0) {
            arr.unshift(curpage - i);
          }
          if (right - i >= 0) {
            arr.push(curpage + i);
          }
        } // for

        var attrLength = Math.floor(arr.length / 2);

        for (var _i = 2; _i < right - attrLength && _i < 20; _i++) {
          var n = curpage + Math.round(Math.pow(Math.E, _i));
          if (n >= pages) break;
          arr.push(n);
        }

        for (var _i2 = 2; _i2 < left - attrLength && _i2 < 20; _i2++) {
          var _n = curpage - Math.round(Math.pow(Math.E, _i2));
          if (_n < 2) break;
          arr.unshift(_n);
        }

        if (attrLength < right && -1 == arr.indexOf(pages)) arr.push(pages);
        if (attrLength < left && -1 == arr.indexOf(1)) arr.unshift(1);

        scope.pages = arr;

        scope.docs = result.result;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = scope.docs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var doc = _step.value;

            delete doc._rev;
            delete doc._id;
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
      });
    };
  });

  _app2.default.controller('collectionController', angularModule);

  // FOR x IN @@collection LET att = SLICE(ATTRIBUTES(x), 0, 25) SORT TO_NUMBER(x._key) == 0 ? x._key : TO_NUMBER(x._key) LIMIT @offset, @count RETURN KEEP(x, att)"
});