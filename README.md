node-qemu-server
================

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
          {"name": "query-status"}
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

### example
    qVm = new new QemuVm 'my-name'

    qVm.gfx()             # no gfx
    qVm.ram(2048)	      # 2 GiByte ram
    qVm.cpus(4)		      # 4 cpus
    qVm.hd('myImage.img') # img file
    qVm.vnc(2)			  # vnc on port 5902
    qVm.qmp(4442)		  # qmp port
    
    qVm.start ->
      # do something
      
### vm config
    name: string                                         # string
      hardware:
        ram  : uint
        cpus : uint
        hds  : []{name:strings,size:uint},string         # if hd not existence create, with size
        isos : []strings
        mac  : '11:22:33:44:55:66'
  
      settings:
        qmpPort  : uint                                  # not exposed to user
        keyboard : string
        vnc      : unit                                  # vnc port, port = vncPort + 5900
        bootOnce : true xor false
        boot     : true xor false
