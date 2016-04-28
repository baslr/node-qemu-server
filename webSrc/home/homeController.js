/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'


let angularModule = ['$scope', '$http'];

angularModule.push((scope, http) => {

  console.log('init homeController');
  scope.test = {};

  scope.changelog = '';

  http.get('/_db/_system/_api/version').then(data => {
    let version = data.data.version;
    if(0 == version.search(/^\d\.\d\.\d$/)) {
      version = version.split('.').slice(0,2).join('.');
    }
    http.get(`https://raw.githubusercontent.com/arangodb/arangodb/${version}/CHANGELOG`).then(data => scope.changelog = data.data);
  });
  http.get(`https://raw.githubusercontent.com/arangodb/arangodb/devel/CHANGELOG`).then(data => scope.changelog = data.data);


  // scope.test.selected = 'a';


  // scope.test.options = {
  //   kc: {name:'name c', rule:'rule c'},
  //   ka: {name:'name a', rule:'rule a'},
  //   kb: {name:'name b', rule:'rule b'},
  //   kd: {name:'name d', rule:'rule d'}
  // }

});

app.controller('homeController', angularModule);
