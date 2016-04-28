define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularDirective = ['$interpolate', '$sce']; /***
                                                    * (c) 2016 by duo.uno
                                                    *
                                                    ***/

  angularDirective.push(function (interpolate, sce) {
    return {
      restrict: 'E',
      scope: {
        data: "="
      },
      link: function link(scope, element) {

        window.requestAnimationFrame(function () {
          var table = document.createElement('table');
          table.className = 'table table-sm';

          var thead = document.createElement('thead');
          var tr = document.createElement('tr');
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = scope.data.keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var key = _step.value;

              var th = document.createElement('th');
              th.textContent = key;
              tr.appendChild(th);
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

          thead.appendChild(tr);
          table.appendChild(thead);

          var tbody = document.createElement('tbody');

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = scope.data.result[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var doc = _step2.value;

              var _tr = document.createElement('tr');
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = scope.data.keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var _key = _step3.value;

                  var td = document.createElement('td');
                  td.textContent = interpolate('{{doc[key]}}')({ doc: doc, key: _key });
                  _tr.appendChild(td);
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

              tbody.appendChild(_tr);
            }
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

          table.appendChild(tbody);
          element.get(0).appendChild(table);
        });
      }
    };
  });

  _app2.default.directive('aqlResultTable', angularDirective);
});