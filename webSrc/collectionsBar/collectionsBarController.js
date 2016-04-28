/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'

let angularModule = ['$scope', '$http', '$interval', 'messageBrokerService'];


angularModule.push((scope, http, interval, messageBroker) => {
  console.log('define collectionsBarController');

  messageBroker.sub('collectionsbar.status collections.reload current.collection current.database', scope);
  scope.cfg = {};
  scope.status = 1;
  scope.collections = [];
  scope.currentCollection = '';
  scope.currentDatabase   = '';

  scope.setCurrentCollection = () => {
    for(let col of scope.collections) {
      if(col.name == scope.currentCollection) {
        col.current = true;
      }
      else
        col.current = false;
    }
  }

  scope.reloadCollections = () => http.get(`/_db/${scope.currentDatabase}/_api/collection`).then(data => {scope.collections = data.data.collections; scope.setCurrentCollection();});

  scope.$on('collectionsbar.status', (e,status) => scope.status = status);

  scope.$on('collections.reload', () => scope.reloadCollections());

  scope.$on('current.collection', (e, currentCollection) => { scope.currentCollection = currentCollection; scope.setCurrentCollection();});

  scope.$on('current.database', (e, database) => {
    if(database === scope.currentDatabase) return;
    scope.currentDatabase = database;
    scope.reloadCollections();
  });
});


app.controller('collectionsBarController', angularModule);
