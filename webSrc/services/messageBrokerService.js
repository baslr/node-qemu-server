/***
 * (c) 2016 by duo.uno
 *
 ***/
 
import app from 'app'


  let transactions = {}
  let lastData = {}


 let MessageBrokerService = {
    sub: (msgs, scope) => {
      console.log('SUB', msgs);
      for(let msg of msgs.replace(/\+ /g, ' ').trim().split(' ')) {
        (transactions[msg] || (transactions[msg] = [])).push(scope);
        scope.$on('$destroy', () => MessageBrokerService.usub(msg, scope));
      }
    },

    pub: (msg, data) => {
      console.log('PUB', msg, data);
      lastData[msg] = data;
      if(!transactions[msg]) return;
      for(let scope of transactions[msg]) {
        scope.$emit(msg, data);
        
      }
    },

    last: (msg) => { return lastData[msg];
    },

    usub: (msgs, scope) => {
      for(let msg in msgs.replace(/\ +/g, ' ').trim().split(' ')) {
        if(!transactions[msg]) continue;
        for(let idx in transactions[msg]) {
          let s = transactions[msg][idx];
          if(s.$id === scope.$id) {
            transactions[msg].splice(idx, 1);
            break;
          }
        }
      }
    }
  }



let mbcall = () => MessageBrokerService;

  app.service('messageBrokerService', [mbcall]);
