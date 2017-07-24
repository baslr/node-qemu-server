/***
 * (c) 2017 by duo.uno
 *
 ***/

import app from 'app';


const angularModule = ['$scope', '$http'];

angularModule.push((scope, http) => {
  console.log('init drivesController');

  scope.editDrive = {};
  scope.selections = {
    formats:['raw', 'qcow2'],
    medias:['disk', 'cdrom'],
  };

  scope.createDrive = () => {
    http.post('/api/drives', scope.editDrive).then( (data) => {
      scope.reloadDrives();
      scope.editDrive = {};
    });
  }

  scope.reloadDrives = () => http.get('api/drives').then(data => scope.drives = data.data);
  scope.reloadDrives();
});

app.controller('drivesController', angularModule);
