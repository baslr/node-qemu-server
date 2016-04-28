/***
 * (c) 2016 by duo.uno
 *
 ***/

let stat = `LET r = (FOR d IN _statistics sort d.time desc limit @time RETURN d)
let x = MERGE(FOR t IN ['http', 'client', 'system']
let z = MERGE(FOR a IN ATTRIBUTES(r[0][t])
filter !CONTAINS(a, 'Percent')
RETURN {[a]: sum(r[*][t][a]) / @time})
RETURN {[t]:z}) RETURN x`

import app from 'app'

let angularModule = ['$scope', '$http', '$interval', 'formatService', 'messageBrokerService', '$location'];


angularModule.push((scope, http, interval, format, messageBroker, location) => {
  console.log('init navBarController');
  scope.format = format;

  scope.collectionsBarStatus = 1;
  scope.changeCollectionsBarStatus = () => {
    scope.collectionsBarStatus++; if(scope.collectionsBarStatus>1)scope.collectionsBarStatus=0; messageBroker.pub('collectionsbar.status', scope.collectionsBarStatus);}

  http.get('/_db/_system/_api/version').then(data => {
    scope.cfg.arango = data.data;
    http.jsonp(`https://www.arangodb.com/repositories/versions.php?jsonp=JSON_CALLBACK&version=${scope.cfg.arango.version}&callback=JSON_CALLBACK`).then(data => {
      scope.cfg.availableVersions = Object.keys(data.data).sort().map( (key) => `${data.data[key].version} ${key}`).join(', ');
      if(scope.cfg.availableVersions) {
        scope.cfg.availableVersions = `(${scope.cfg.availableVersions} available)`;
      } // if
    });
  });
  http.get('/_api/database').then(data => scope.cfg.dbs = data.data.result);
  
  scope.cfg = {};
  scope.cfg.arango = 'n/a';
  scope.cfg.dbs = [];
  scope.cfg.selectedDb = '';

  scope.databaseChanged = () => location.url(`/database/${scope.cfg.selectedDb}`);

  scope.$on('current.database', (e, database) => scope.cfg.selectedDb = database);
  messageBroker.sub('current.database', scope);

  scope.refreshStats = () => {
    http.post(`/_db/_system/_api/cursor`, {cache:false,query:stat,bindVars:{time:6}}).then(data => scope.cfg.stats = data.data.result[0]);
  }
  scope.refreshStats();
  interval(scope.refreshStats, 10 * 1000);
});

app.controller('navBarController', angularModule);
