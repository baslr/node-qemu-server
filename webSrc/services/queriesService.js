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
    reloadQueries();
  });

  let reloadQueries = () => {
    http.get(`/_db/_system/_api/document/${collectionName}/savedQueries`).then(data => {

      for(let key in data.data.queries) {
        queries.queries[key] = data.data.queries[key];
      } // for
    });
  }

  let queries = {
    queries: {unsaved: {name:'unsaved', options:{eval:'blur', max:1000}, query:'// eval:asap max:all table:true name:unsaved\n// query\n'}},
    currentName: () => queries.queries[messageBroker.last('current.query')].name,
    save: () => {
      http.patch(`/_db/_system/_api/document/${collectionName}/savedQueries`, {queries:queries.queries});
    }
  }

  return queries;
});

app.service('queriesService', angularModule);
