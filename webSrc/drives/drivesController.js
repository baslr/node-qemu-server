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

});

app.controller('drivesController', angularModule);
