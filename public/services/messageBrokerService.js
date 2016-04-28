define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var transactions = {}; /***
                          * (c) 2016 by duo.uno
                          *
                          ***/

  var lastData = {};

  var MessageBrokerService = {
    sub: function sub(msgs, scope) {
      console.log('SUB', msgs);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var msg = _step.value;

          (transactions[msg] || (transactions[msg] = [])).push(scope);
          scope.$on('$destroy', function () {
            return MessageBrokerService.usub(msg, scope);
          });
        };

        for (var _iterator = msgs.replace(/\+ /g, ' ').trim().split(' ')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
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
    },

    pub: function pub(msg, data) {
      console.log('PUB', msg, data);
      lastData[msg] = data;
      if (!transactions[msg]) return;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = transactions[msg][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var scope = _step2.value;

          scope.$emit(msg, data);
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
    },

    last: function last(msg) {
      return lastData[msg];
    },

    usub: function usub(msgs, scope) {
      for (var _msg in msgs.replace(/\ +/g, ' ').trim().split(' ')) {
        if (!transactions[_msg]) continue;
        for (var idx in transactions[_msg]) {
          var s = transactions[_msg][idx];
          if (s.$id === scope.$id) {
            transactions[_msg].splice(idx, 1);
            break;
          }
        }
      }
    }
  };

  var mbcall = function mbcall() {
    return MessageBrokerService;
  };

  _app2.default.service('messageBrokerService', [mbcall]);
});