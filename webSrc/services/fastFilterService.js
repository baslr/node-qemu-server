/***
 * (c) 2016 by duo.uno
 *
 ***/
 
import app from 'app'

let angularModule = ['$http', '$q', 'messageBrokerService'];


angularModule.push((http, q, messageBroker) => {
  let collectionName = '';


  http.get('collections').then(result => {
    collectionName = result.data.settings;
    reloadFilters();
  });

  let reloadFilters = () => {
    http.get(`/_db/_system/_api/document/${collectionName}/fastFilter`).then(data => {

      for(let key in data.data.rules) {
        fastFilter.rules[key] = data.data.rules[key];
      } // for
    });
  }

  let fastFilter = {
    rules: { 'none': {name:'none', rule:`// none`}},
    currentRule: () => fastFilter.rules[messageBroker.last('current.fastFilter')].rule,
    save: () => {
      http.patch(`/_db/_system/_api/document/${collectionName}/fastFilter`, {rules:fastFilter.rules});
    }
  }

  return fastFilter;
});

app.service('fastFilterService', angularModule);
