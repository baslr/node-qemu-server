define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularDirective = []; /***
                              * (c) 2016 by duo.uno
                              *
                              ***/

  angularDirective.push(function () {
    return {
      restrict: 'A',
      require: '?ngModel',
      scope: {
        base: '@'
      },
      link: function link(scope, element, attrs, ngModel) {
        if (!ngModel) return;

        ngModel.$formatters.push(function (value) {
          if (!isNaN(value)) {
            if (scope.base == '10') return value / 1000 / 1000;else return value / 1024 / 1024;
          }
        });

        ngModel.$parsers.push(function (value) {
          if (isNaN(value)) return;
          if (scope.base == '10') return value * 1000 * 1000;else return value * 1024 * 1024;
        });
      }
    };
  });

  _app2.default.directive('journalSize', angularDirective);

  // feedbafeedbackDirective


  // angular.module('customControl', ['ngSanitize']).
  // directive('contenteditable', ['$sce', function($sce) {
  //   return {
  //     restrict: 'A', // only activate on element attribute
  //     require: '?ngModel', // get a hold of NgModelController
  //     link: function(scope, element, attrs, ngModel) {
  //       if (!ngModel) return; // do nothing if no ng-model

  //       // Specify how UI should be updated
  //       ngModel.$render = function() {
  //         element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
  //       };

  //       // Listen for change events to enable binding
  //       element.on('blur keyup change', function() {
  //         scope.$evalAsync(read);
  //       });
  //       read(); // initialize

  //       // Write data to the model
  //       function read() {
  //         var html = element.html();
  //         // When we clear the content editable the browser leaves a <br> behind
  //         // If strip-br attribute is provided then we strip this out
  //         if ( attrs.stripBr && html == '<br>' ) {
  //           html = '';
  //         }
  //         ngModel.$setViewValue(html);
  //       }
  //     }
  //   };
  // }]);
});