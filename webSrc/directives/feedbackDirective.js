/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'


let angularDirective = ['messageBrokerService'];

angularDirective.push(() => {
  return {
    restrict: 'E',
    scope: {
      listenTo: '@test'
    },
    link: () => console.log('directive link called'),
    template: `<div data-ng-repeat="msg in msgs" class="alert alert-success"  data-ng-class="'alert-'+msg.type" role="alert"><center><strong>{{msg.msg}}</strong></center></div>`,
    controller:['$scope', '$timeout', 'messageBrokerService', (scope, timeout, messageBroker) => {
      scope.msgs = [];

      messageBroker.sub(scope.listenTo, scope);
      scope.$on(scope.listenTo, (ev, msg) => {
        msg = Object.assign({id:Date.now()+''+Math.random(), type:'info'}, msg);
        msg.timeout = timeout(() => {
          for(let idx in scope.msgs) {
            if(scope.msgs[idx].id == msg.id) {
              scope.msgs.splice(idx, 1);
              break;
            } // if
          } // for
        }, 10000);
        scope.msgs.push(msg);
      });
      scope.$on('$destroy', () => {
        for(let msg of scope.msgs) {
          timeout.cancel(msg.timeout);
        } // for
      });
    }]
  }
});

app.directive('feedbackMsgs', angularDirective);

// feedbafeedbackDirective
