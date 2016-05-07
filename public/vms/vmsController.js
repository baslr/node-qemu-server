define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', '$http']; /***
                                            * (c) 2016 by duo.uno
                                            *
                                            ***/

  angularModule.push(function (scope, http) {
    console.log('init vmsController');

    http.get('/api/vms/confs').then(function (data) {
      scope.vms.length = 0;
      data.data.forEach(function (vm) {
        stat(vm.uuid).vmStatus = 'N/A';
        stat(vm.uuid).procStatus = 'N/A';
        scope.vms.push(vm);
      });
    });
    scope.settings = ['Summary', 'Name / keyboard / UUID', 'Machine / VGA / RAM / CPU', 'Drives', 'Networking', 'VNC / SPICE', 'Host/Guest-NUMA', 'Boot'];
    scope.expanded = {};
    scope.stats = {};
    scope.vms = [];
    scope.curSetting = { idx: 0 };
    scope.editVm = {};
    scope.selections = { cpus: [], vgas: ['std', 'qxl', 'virtio', 'none'], nics: [], machines: [], keyboards: ['ar', 'da', 'de', 'de-ch', 'en-gb', 'en-us', 'es', 'et', 'fi', 'fo', 'fr', 'fr-be', 'fr-ca', 'fr-ch', 'hr', 'hu', 'is', 'it', 'ja', 'lt', 'lv', 'mk', 'nl', 'nl-be', 'no', 'pl', 'pt', 'pt-br', 'ru', 'sl', 'sv', 'th', 'tr'] };

    scope.showButton = function (vm, type) {
      var status = stat(vm.uuid).status;
      var procStatus = stat(vm.uuid).procStatus;
      switch (type) {
        case 'start':
          return procStatus == 'terminated';

        // V M  S T A T U S
        case 'pause':
          return status == 'running'; // stopped' && stat(vm.uuid).status != 'paused' && stat(vm.uuid).status != 'prelaunch';
        case 'resume':
          return status == 'paused' || status == 'prelaunch';
        case 'stop':
        case 'reset':
          return status != 'N/A';
        case 'down':
          return status != 'shutdown' && status != 'N/A';
        // return stat(vm.uuid).status != 'stopped';
        // return stat(vm.uuid).status != 'stopped';
      } // switch()
    };

    scope.runAction = function (vmUuid, action) {
      switch (action) {
        case 'start':
          return http.get('/api/vm/' + vmUuid + '/proc/start');
        case 'pause':
          return http.get('/api/vm/' + vmUuid + '/stop');
        case 'resume':
          return http.get('/api/vm/' + vmUuid + '/cont');
        case 'reset':
          return http.get('/api/vm/' + vmUuid + '/system_reset');
        case 'stop':
          return http.get('/api/vm/' + vmUuid + '/quit');
        case 'down':
          return http.get('/api/vm/' + vmUuid + '/system_powerdown');
      } // switch
      /*
        pause: (cb) -> @sendCmd 'stop', cb
        reset: (cb) -> @sendCmd 'system_reset', cb
        resume: (cb) -> @sendCmd 'cont', cb
        shutdown: (cb) -> @sendCmd 'system_powerdown', cb
        stop: (cb) -> @sendCmd 'quit', cb
      */
    };

    scope.addPortFwd = function () {
      var arr = scope.editVm.hardware.net.guestPortFwd instanceof Array ? scope.editVm.hardware.net.guestPortFwd : scope.editVm.hardware.net.guestPortFwd = [];
      var split = scope.curSetting.newGuestPortFwd.split(',');
      arr.push({ hostIp: split[0], hostPort: split[1], vmPort: split[2] });
      scope.curSetting.newGuestPortFwd = '';
    };

    var stat = scope.stat = function (uuid) {
      return scope.stats[uuid] ? scope.stats[uuid] : scope.stats[uuid] = {};
    };

    var eSource = new EventSource('/a');

    eSource.onmessage = function (msg) {
      if (msg.data != 'initial response') return;
      http.get('/api/vms/qmp/query-vnc');
      http.get('/api/vms/proc/status');
    };

    eSource.onerror = function (e) {
      scope.$apply(function () {
        console.log('esource:e', e);
        for (var key in scope.stats) {
          delete scope.stats[key].status;
        }
      });
    };

    eSource.addEventListener('qemu-config', function (e) {
      return scope.$apply(function () {
        var msg = JSON.parse(e.data);
        console.log('qemu-config');
        console.log(msg);
        scope.selections[msg.selection] = msg.data;
      });
    });

    eSource.addEventListener('proc-status', function (e) {
      scope.$apply(function () {
        var msg = JSON.parse(e.data);
        console.log('proc-status');
        console.log(msg);
        stat(msg.vmUuid).procStatus = msg.status; // running xor terminated
        stat(msg.vmUuid).status = 'N/A';
        http.get('/api/vm/' + msg.vmUuid + '/query-status');
      });
    });

    eSource.addEventListener('vm-status', function (e) {
      scope.$apply(function () {
        var msg = JSON.parse(e.data);
        console.log('vm-status');
        console.log(msg);

        if (msg.status == 'running' && msg.running) {
          stat(msg.vmUuid).status = 'running';
        } else {
          stat(msg.vmUuid).status = msg.status;
        } // else
        if (msg.status == 'N/A') delete stat(msg.vmUuid).vnc;
      });
    });

    eSource.addEventListener('vm-generic', function (e) {
      scope.$apply(function () {
        var msg = JSON.parse(e.data);
        console.log('vm-generic');
        console.log(msg);
        switch (msg.wasCmd) {
          case 'query-vnc':
            return stat(msg.vmUuid).vnc = !!msg.clients.length;
        } // switch
      });
    });

    eSource.addEventListener('vm-event', function (e) {
      scope.$apply(function () {
        var msg = JSON.parse(e.data);
        console.log('vm-event');
        console.log(msg);

        http.get('/api/vm/' + msg.vmUuid + '/query-status');

        switch (msg.event) {
          // use the status instead
          // case 'POWERDOWN'
          // case 'STOP': 'paused';
          // case 'RESUME': 'running';
          // case 'SHUTDOWN': 'stopped';
          case 'VNC_DISCONNECTED':
            return delete stat(msg.vmUuid).vnc;
          case 'VNC_CONNECTED':
          case 'VNC_INITIALIZED':
            return stat(msg.vmUuid).vnc = true;
        } // switch
      });
    });
  });

  _app2.default.controller('vmsController', angularModule);
});