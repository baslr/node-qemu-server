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
        stat(vm.uuid).status = 'stopped';
        scope.vms.push(vm);
      });
    });

    scope.expanded = {};
    scope.stats = {};

    scope.showButton = function (vm, type) {
      switch (type) {
        case 'start':
          return stat(vm.uuid).status == 'stopped';
        case 'pause':
          return stat(vm.uuid).status != 'stopped' && stat(vm.uuid).status != 'paused' && stat(vm.uuid).status != 'prelaunch';
        case 'resume':
          return stat(vm.uuid).status == 'paused' || stat(vm.uuid).status == 'prelaunch';
        case 'stop':
        case 'reset':
        case 'down':
          return stat(vm.uuid).status != 'stopped';
        // return stat(vm.uuid).status != 'stopped';
        // return stat(vm.uuid).status != 'stopped';
      } // switch()
    };

    scope.runAction = function (vmUuid, action) {
      switch (action) {
        case 'start':
          return http.get('/api/vm/' + vmUuid + '/start');
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
      } // siwtch
      /*
        pause: (cb) -> @sendCmd 'stop', cb
        reset: (cb) -> @sendCmd 'system_reset', cb
        resume: (cb) -> @sendCmd 'cont', cb
        shutdown: (cb) -> @sendCmd 'system_powerdown', cb
        stop: (cb) -> @sendCmd 'quit', cb
      */
    };

    var stat = scope.stat = function (uuid) {
      return scope.stats[uuid] ? scope.stats[uuid] : scope.stats[uuid] = {};
    };

    scope.vms = [{
      "name": "linux test",
      "status": "stopped",
      "uuid": "9666778c-4941-6b05-8279-1db540bd7e72",
      "hardware": {
        "ram": 256,
        "vga": "std",
        "net": {
          "macAddr": "8a:30:f7:76:a0:cc",
          "nic": "rtl8139",
          "mode": "host"
        },
        "cpu": {
          "model": "qemu64",
          "sockets": 1,
          "cores": 1,
          "threads": 1
        },
        "drives": [{ "type": "cdrom", "path": "isos/debian.iso", "interface": "ide" }]
      },
      "settings": {
        "uuid": "9666778c-4941-6b05-8279-1db540bd7e72",
        "keyboard": "de",
        "autoBoot": true,
        "qmp": {
          "port": 12222
        },
        "vnc": {
          "port": 0
        },
        "qmp": {
          "port": 65000
        }
      } }];

    var eSource = new EventSource('/a');

    eSource.onmessage = function (msg) {
      if (msg.data != 'initial response') return;
      http.get('/api/vms/qmp/query-status');
      http.get('/api/vms/qmp/query-vnc');
    };

    eSource.onerror = function (e) {
      scope.$apply(function () {
        console.log('esource:e', e);
        for (var key in scope.stats) {
          delete scope.stats[key].status;
        }
      });
    };

    eSource.addEventListener('vm-status', function (e) {
      scope.$apply(function () {
        var msg = JSON.parse(e.data);
        console.log('vm-status');
        console.log(msg);

        if (msg.status == 'running' && msg.running) {
          stat(msg.vmUuid).status = 'running';
        } else if (msg.status == 'paused') {
          stat(msg.vmUuid).status = 'paused';
        } else if (msg.status == 'shutdown') {
          stat(msg.vmUuid).status = 'shutdown';
        } else {
          stat(msg.vmUuid).status = msg.status;
        } // else
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

        http.get('http://127.0.0.1:4224/api/vms/qmp/query-status');

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