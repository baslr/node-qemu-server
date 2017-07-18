define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', '$http', '$routeParams', '$timeout', 'messageBrokerService', '$interpolate', 'queriesService']; /***
                                                                                                                                  * (c) 2016 by duo.uno
                                                                                                                                  *
                                                                                                                                  ***/

  angularModule.push(function (scope, http, params, timeout, messageBroker, interpolate, queries) {

    http.put('/_db/' + params.currentDatabase + '/_api/query/properties', { slowQueryThreshold: 0, enabled: true, trackSlowQueries: true });

    console.log('init aqlController');

    var collections = [];
    var curTimeout = undefined;
    scope.queryResults = [];
    scope.lastError = '';

    scope.selectedQuery = queries.currentName();
    scope.savedQueries = queries.queries;
    scope.options = scope.savedQueries[scope.selectedQuery].options;
    $('TEXTAREA#aqlEditor').val(scope.savedQueries[scope.selectedQuery].query);

    http.get('/_db/' + params.currentDatabase + '/_api/collection').then(function (data) {
      return collections = data.data.collections.map(function (col) {
        return col.name;
      });
    });
    var words = ['LET', 'IN', 'RETURN', 'TO_NUMBER', 'TO_STRING', 'IS_NULL', 'NOT_NULL', 'FILTER', 'FOR'];

    $('TEXTAREA#aqlEditor').on('keydown', function (ev) {
      if (ev.keyCode != 13) return;

      return;

      // check if we can expand txt

      var txt = $('TEXTAREA#aqlEditor').val();
      var sPos = $('TEXTAREA#aqlEditor').prop('selectionStart');
      var ePos = $('TEXTAREA#aqlEditor').prop('selectionEnd');

      if (sPos == ePos) return;

      var partText = txt.slice(sPos, ePos);
      if (~partText.search(/\s/)) return;

      var i = sPos - 1;
      while (txt[i]) {
        if (0 == txt[i].search(/\s/)) break;
        partText = txt[i] + partText;
        i--;
      }
      var ssPos = sPos - (sPos - i) + 1;

      i = ePos;
      while (txt[i]) {
        if (0 == txt[i].search(/\s/)) break;
        partText = partText + txt[i];
        i++;
      }

      console.log('PARTTEXT', [partText]);

      if (~words.indexOf(partText.toUpperCase())) {
        $('TEXTAREA#aqlEditor').val(txt.slice(0, ssPos) + partText.toUpperCase() + txt.slice(ePos));
        $('TEXTAREA#aqlEditor').prop('selectionStart', ePos);
        $('TEXTAREA#aqlEditor').prop('selectionEnd', ePos);
      }

      // check if word expansion

      // how to?
      // from selection to right unit \n xor space

      console.log(ev);
      // ev.stopPropagation();
      // ev.stopImmediatePropagation();
      ev.preventDefault();
    });

    $('TEXTAREA#aqlEditor').on('blur', function (ev) {
      if (scope.options.eval != 'blur') return;
      sendAqlQuery($('TEXTAREA#aqlEditor').val());
    });

    $('TEXTAREA#aqlEditor').on('keyup', function (ev) {
      return scope.$apply(function () {
        var txt = $('TEXTAREA#aqlEditor').val();
        var txtArr = txt.split('\n');
        var pos = $('TEXTAREA#aqlEditor').prop('selectionStart');
        var ePos = $('TEXTAREA#aqlEditor').prop('selectionEnd');

        // fooo

        scope.evalOptions(txtArr[0]);

        if (scope.options.eval === 'asap') {
          sendAqlQuery(txt);
        } else if (!isNaN(scope.options.eval)) {
          timeout.cancel(curTimeout);

          curTimeout = timeout(function () {
            sendAqlQuery(txt);
          }, scope.options.eval);
        } // if

        return;

        if (~[8, 37, 38, 39, 40].indexOf(ev.keyCode)) return;
        console.log('-------------------------------', ev);

        console.log('after end is:', [txt[ePos]]);
        if (txt[ePos] && ! ~txt[ePos].search(/\s/)) return;

        var before = txt.slice(0, pos),
            after = txt.slice(pos);
        var beforeArray = before.split(' ');
        var afterArray = after.split(' ');

        console.log('beforeArray afterArray');
        console.log(beforeArray);
        console.log(afterArray);

        var beforeFirst = beforeArray.slice(-1).pop();
        var afterFirst = afterArray.slice(0, 1).pop();

        var i = pos - 1,
            partText = txt.slice(pos, ePos);;
        while (txt[i]) {
          if (0 == txt[i].search(/\s/)) break;
          partText = txt[i] + partText;
          i--;
        }

        i = ePos;
        while (txt[i]) {
          if (0 == txt[i].search(/\s/)) break;
          partText = partText + txt[i];
          i++;
        }

        var cursorWord = partText;

        console.log('cursorWord is', [cursorWord]);

        console.log('beforeFirst afterFirst', [beforeFirst, afterFirst]);

        if (beforeFirst.length) {
          // check first if cursor word matches
          var noMatch = true;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = words[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _word = _step.value;

              if (_word.toLowerCase() != cursorWord.toLowerCase()) continue;
              noMatch = false;
              break;
            } // for
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

          if (noMatch) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = words[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var word = _step2.value;

                // if (word.toLowerCase() == beforeFirst.toLowerCase()) continue;
                if (0 == word.toLowerCase().indexOf(beforeFirst.toLowerCase())) {
                  console.log('word match', word);

                  console.log('would insert', word.slice(beforeFirst.length));

                  var newStr = before + word.slice(beforeFirst.length) + after;
                  console.log('newstr', newStr);

                  $('TEXTAREA#aqlEditor').val(newStr);

                  $('TEXTAREA#aqlEditor').prop('selectionStart', pos);
                  $('TEXTAREA#aqlEditor').prop('selectionEnd', pos + word.slice(beforeFirst.length).length);

                  break;
                }
              } // for 
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }
        } // if

        console.log(beforeFirst, before, after);
      });
    });

    var sendAqlQuery = function sendAqlQuery(txt) {
      var lines = txt.split('\n');
      var queries = [];
      var idx = undefined;

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = lines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var line = _step3.value;

          if (0 == line.trim().toLowerCase().search(/^\/\/\ *query$/)) if (idx == undefined) queries[idx = 0] = '';else queries[++idx] = '';
          if (idx == undefined) continue;
          queries[idx] += line + '\n';
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      scope.queryResults.length = idx = 0;

      var _buildResult = function _buildResult(qData, httpTime, qSlow) {
        scope.lastError = '';
        var result = scope.queryResults[idx] = {};
        result.httpTime = httpTime;
        result.execTime = qSlow ? qSlow.runTime * 1000 : 'No timing available';
        Object.assign(result, qData.data);
        result.resultJson = JSON.stringify(qData.data.result, false, 2);
        if (scope.options.table) {
          result.keys = [];
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = result.result[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var doc = _step4.value;
              var _iteratorNormalCompletion5 = true;
              var _didIteratorError5 = false;
              var _iteratorError5 = undefined;

              try {
                for (var _iterator5 = Object.keys(doc)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                  var key = _step5.value;

                  if (~result.keys.indexOf(key)) continue;
                  result.keys.push(key);
                }
              } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                  }
                } finally {
                  if (_didIteratorError5) {
                    throw _iteratorError5;
                  }
                }
              }

              ;
            } // for
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        } // if
        _send(++idx);
      };

      var _send = function _send() {
        if (!queries[idx]) return;

        var start = performance.now();
        http.post('/_db/' + params.currentDatabase + '/_api/cursor?qid=' + start, {
          batchSize: scope.options.max, query: '// qid:' + start + '\n' + queries[idx]
        }).then(function (qData) {
          var end = performance.now();

          http.get('/_db/' + params.currentDatabase + '/_api/query/slow').then(function (data) {
            for (var i = data.data.length - 1; i >= 0; i--) {
              var slowq = data.data[i];
              if (0 != slowq.query.indexOf('// qid:' + start + '\n')) continue;
              _buildResult(qData, end - start, slowq);
              break;
            } // for
          }, function () {
            return _buildResult(qData, end - start);
          });
        }, function (data) {
          return scope.lastError = data.data.errorMessage;
        });
      };
      _send(0);
    };

    scope.evalOptions = function (optionLine) {
      var sPos = $('TEXTAREA#aqlEditor').prop('selectionStart');
      var len = optionLine.length;

      // check for name
      if (len < sPos) {
        var result = optionLine.match(/name:(\S+)/);
        var name = result[1] || 'unsaved';
        scope.options['name'] = name;
        scope.selectedQuery = name;
        scope.savedQueries[name] = { name: name, query: $('TEXTAREA#aqlEditor').val() };
      } // if

      optionLine = optionLine.trim().toLowerCase();
      if (! ~optionLine.search(/^\/\//)) return; // cancel if its not a starting comment line

      var options = [{ name: 'eval', q: /eval\:(asap|blur|\d+ms)/, f: function f(m) {
          return 0 === m.search(/^\d+ms$/) ? Number(m.slice(0, -2)) : m;
        } }, { name: 'max', q: /max\:(all|\d+)/, f: function f(m) {
          return isNaN(m) ? m : Number(m);
        } }, { name: 'table', q: /table:(true|false)/, f: function f(m) {
          return JSON.parse(m);
        } }];
      var opts = {};
      for (var key in options) {
        var option = options[key];
        var _result = optionLine.match(option.q);
        if (null == _result) continue;
        opts[option.name] = option.f ? option.f(_result[1]) : _result[1];
      } // for
      scope.options = scope.savedQueries[scope.selectedQuery].options = opts;
      queries.save();
    }; // evalOptions()

    scope.changedQuery = function () {
      scope.queryResults.length = 0;
      var queryName = scope.selectedQuery;
      $('TEXTAREA#aqlEditor').val(scope.savedQueries[queryName].query);
      scope.evalOptions(scope.savedQueries[queryName].query.split('\n')[0]);

      if (scope.options.eval == 'asap') {
        sendAqlQuery(scope.savedQueries[queryName].query);
      }
    };

    scope.copyToClipboard = function (result) {
      var keys = result.keys;
      var lines = [keys.join('\t')];

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = result.result[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var doc = _step6.value;

          var line = [];
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = keys[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var key = _step7.value;

              line.push(interpolate('{{doc[key]}}')({ doc: doc, key: key }));
            } // for
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          lines.push(line.join('\t'));
        } // for
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      document.oncopy = function (e) {
        e.clipboardData.setData('text/plain', lines.join('\n'));
        e.preventDefault();
        document.oncopy = null;
      }; // oncopy()
      document.execCommand('copy');
    };

    scope.$on('$destroy', function () {
      return $('TEXTAREA#aqlEditor').off('keyup', 'keydown', 'blur');
    });
  });

  _app2.default.controller('aqlController', angularModule);
});