
vmHandler = require './vmHandler'
ioServer  = undefined
Disk      = require './src/disk'
usb       = require './src/usb'

socks  = {}

module.exports.start = (httpServer) ->
  ioServer = require('socket.io').listen httpServer
  ioServer.set('log level', 1)
  
  ioServer.sockets.on 'connection', (sock) ->
    socks[sock.id] = sock
    console.log "SOCK -> CON #{sock.handshake.address.address} #{sock.id}"
    console.log "SOCK -> count: #{Object.keys(socks).length}"
  
    sock.emit('set-iso', iso) for iso in vmHandler.getIsos()                    # emit iso  names, client drops duplicates
    
    for disk in vmHandler.getDisks()                                            # emit disks, client drops duplicates
      Disk.info disk, (ret) ->
        sock.emit 'set-disk', ret.data
    
    sock.emit('set-vm', vm.cfg) for vm in vmHandler.getVms()                    # emit vms, client drops duplicates
    
    #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
  
    sock.on 'disconnect', ->
      console.log "SOCK -> DIS #{sock.id} #{sock.handshake.address.address}"
      delete socks[sock.id]
      
    sock.on 'qmp-command', (qmpCmd, vmName) ->
      console.log "QMP-Command #{qmpCmd}"
      vmHandler.qmpCommand qmpCmd, vmName
      
    sock.on 'relist-usb', ->
      console.log 'socket: relist-usb'
      usb.scan (usbs) -> sock.emit 'set-usbs', usbs

    sock.on 'create-disk', (disk) ->
      vmHandler.createDisk disk, (ret) ->
        sock.emit 'msg', ret
        if ret.status is 'success'
          sock.emit 'reset-create-disk-form'
          ioServer.sockets.emit 'set-disk', ret.data.data


    sock.on 'delete-disk', (diskName) ->
      if vmHandler.deleteDisk diskName
        sock.emit 'msg', {type:'success', msg:'image deleted'}
        ioServer.sockets.emit 'delete-disk', diskName
      else
        sock.emit 'msg', {type:'error',   msg:'cant delete image'}
          
    sock.on 'delete-iso', (isoName) ->
      if vmHandler.deleteIso isoName
        sock.emit 'msg', {type:'success', msg:"Deleted iso #{isoName}."}
        ioServer.sockets.emit 'delete-iso', isoName
      else
        sock.emit 'msg', {type:'error', msg:"Can't delete iso #{isoName}."}
          
    sock.on 'create-VM', (vmCfg) ->
      vmHandler.createVm vmCfg, (ret) ->
        sock.emit 'msg', ret
        
        sock.emit 'reset-create-vm-form' if ret.status is 'success'

module.exports.toAll = (msg, args...) ->
  ioServer.sockets.emit msg, args...
