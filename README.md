node-qemu-server
================
node-qemu-server lets you control virtual machines in your webbrowser.

### Requirements

#### Linux
* LSB Linux x86_64 (tested with Debian (Sid) GNU/Linux)
* qemu-system-x86 v1.6.1
* nodejs v0.10.21
* npm
* packages: {numactl, usbutils} (usb and numa are only available on Linux)

#### OS X
* v10.8 / v10.9 x86_64 
* macports qemu v1.6.1

### Installation
Install node-qemu-server on Debian GNU/Linux and OS X (assume you have installed qemu, node, npm and numactl)

    $ git clone https://github.com/baslr/node-qemu-server
    $ cd node-qemu-server
    $ npm install
    $ ./cc
    $ node server
    
Now open your HTML5 Webbrowser and open http://127.0.0.1:4224

![gui_host](https://raw.github.com/baslr/node-qemu-server/feature/new-guest-creation/doc/host.png)
![gui_guests](https://raw.github.com/baslr/node-qemu-server/feature/new-guest-creation/doc/guests.png)
![gui_disks](https://raw.github.com/baslr/node-qemu-server/feature/new-guest-creation/doc/disks.png)
![gui_isos](https://raw.github.com/baslr/node-qemu-server/feature/new-guest-creation/doc/isos.png)
![guest_creation](https://raw.github.com/baslr/node-qemu-server/feature/new-guest-creation/doc/guest_creation.png)

---
setup and control qemu instances with Node.js

more to come in the future

vision:
setup and control qemu instances via web gui, lean and simple


### implemented qmp commands
    
#### system commands
##### pause, reset, resume, shutdown, stop
    
node-qemu command | qmp command
:--------------|:-------------------
qVm.pause()    | {"name": "stop"}
qVm.reset()    | {"name": "system_reset"}
qVm.resume()   | {"name": "cont"}
qVm.shutdown() | {"name": "system_powerdown"}
qVm.stop()     | {"name": "quit"}
qVm.status()   | {"name": "query-status"}


	# in work
          {"name": "qom-list-types"}
          {"name": "change-vnc-password"}
          {"name": "qom-get"}
          {"name": "qom-set"}
          {"name": "qom-list"}
          {"name": "query-block-jobs"}
          {"name": "query-balloon"}
          {"name": "query-migrate"}
          {"name": "query-uuid"}
          {"name": "query-name"}
          {"name": "query-spice"}
          {"name": "query-vnc"}
          {"name": "query-mice"}
          {"name": "query-kvm"}
          {"name": "query-pci"}
          {"name": "query-cpus"}
          {"name": "query-blockstats"}
          {"name": "query-block"}
          {"name": "query-chardev"}
          {"name": "query-commands"}
          {"name": "query-version"}
          {"name": "human-monitor-command"}
          {"name": "qmp_capabilities"}
          {"name": "add_client"}
          {"name": "expire_password"}
          {"name": "set_password"}
          {"name": "block_set_io_throttle"}
          {"name": "block_passwd"}
          {"name": "closefd"}
          {"name": "getfd"}
          {"name": "set_link"}
          {"name": "balloon"}
          {"name": "blockdev-snapshot-sync"}
          {"name": "transaction"}
          {"name": "block-job-cancel"}
          {"name": "block-job-set-speed"}
          {"name": "block-stream"}
          {"name": "block_resize"}
          {"name": "netdev_del"}
          {"name": "netdev_add"}
          {"name": "client_migrate_info"}
          {"name": "migrate_set_downtime"}
          {"name": "migrate_set_speed"}
          {"name": "migrate_cancel"}
          {"name": "migrate"}
          {"name": "xen-save-devices-state"}
          {"name": "inject-nmi"}
          {"name": "pmemsave"}
          {"name": "memsave"}
          {"name": "cpu"}
          {"name": "device_del"}
          {"name": "device_add"}

          {"name": "system_wakeup"}
          {"name": "screendump"}
          {"name": "change"}
          {"name": "eject"}
