define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularDirective = ['messageBrokerService']; /***
                                                    * (c) 2016 by duo.uno
                                                    *
                                                    ***/

  angularDirective.push(function () {
    return {
      restrict: 'E',
      scope: {
        listenTo: '@test'
      },
      link: function link() {
        return console.log('directive link called');
      },
      template: '<div data-ng-repeat="msg in msgs" class="alert alert-success"  data-ng-class="\'alert-\'+msg.type" role="alert"><center><strong>{{msg.msg}}</strong></center></div>',
      controller: ['$scope', '$timeout', 'messageBrokerService', function (scope, timeout, messageBroker) {
        scope.msgs = [];

        messageBroker.sub(scope.listenTo, scope);
        scope.$on(scope.listenTo, function (ev, msg) {
          msg = Object.assign({ id: Date.now() + '' + Math.random(), type: 'info' }, msg);
          msg.timeout = timeout(function () {
            for (var idx in scope.msgs) {
              if (scope.msgs[idx].id == msg.id) {
                scope.msgs.splice(idx, 1);
                break;
              } // if
            } // for
          }, 10000);
          scope.msgs.push(msg);
        });
        scope.$on('$destroy', function () {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = scope.msgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var msg = _step.value;

              timeout.cancel(msg.timeout);
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
        });
      }]
    };
  });

  _app2.default.directive('feedbackMsgs', angularDirective);

  // feedbafeedbackDirective
});