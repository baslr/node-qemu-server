define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = []; /***
                           * (c) 2016 by duo.uno
                           *
                           ***/

  angularModule.push(function () {
    return function (str) {
      var fix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      str = Number(str);
      if (ext) ext = ext.toLowerCase();

      if (str > 1000 * 1000 * 1000) {
        str = (str / 1000 / 1000 / 1000).toFixed(fix);
        switch (ext) {
          case 'it':
            ext = ' GB';
            break;
          case 'math':
            ext = ' G';
            break;
        } // switch
      } else if (str > 1000 * 1000) {
        str = (str / 1000 / 1000).toFixed(fix);
        switch (ext) {
          case 'it':
            ext = ' MB';
            break;
          case 'math':
            ext = ' M';
            break;
        } // switch
      } else if (str > 1000) {
        str = (str / 1000).toFixed(fix);
        switch (ext) {
          case 'it':
            ext = ' KB';
            break;
          case 'math':
            ext = ' K';
            break;
        } // switch
      } else {
        str = str.toFixed(fix);
        switch (ext) {
          case 'it':
            ext = ' B';
            break;
          case 'math':
            ext = '';
            break;
        } // switch
      }
      if (ext) str = '' + str + ext;
      return str;
    };
  });

  _app2.default.service('formatService', angularModule);
});