
vmHandler = require './vmHandler'
ioServer  = undefined
Disk      = require './src/disk'

socks  = {}

module.exports.start = (httpServer) ->
  ioServer = require('socket.io').listen httpServer
  ioServer.set('log level', 1)
  
  ioServer.sockets.on 'connection', (sock) ->
    socks[sock.id] = sock
    console.log "SOCK -> CON #{sock.handshake.address.address}"
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
      
    sock.on 'boot', (vmName) ->
      console.log "Boot #{vmName}"
      vmHandler.boot vmName, (ret) ->
        sock.emit 'msg', ret
        if ret.type is 'success'
          vmHandler.setVmStatus vmName, 'running'
          ioServer.sockets.emit 'set-vm-status', vmName, 'running'
          
    sock.on 'vm-reset', (vmName) ->
      console.log "VM reset #{vmName}"
      vmHandler.resetVm vmName, (ret) ->
        if ret.status is 'success'
          sock.emit 'msg', {type:'success', msg:'System resetted.'}
        else
          sock.emit 'msg', {type:'error',   msg:'System reset not possible.'}
          
    sock.on 'vm-pause', (vmName) ->
      console.log "VM pause #{vmName}"
      vmHandler.pauseVm vmName, (ret) ->
        if ret.status is 'success'
          sock.emit 'msg', {type:'success', msg:'VM paused'}
          vmHandler.setVmStatus vmName, 'paused'
          ioServer.sockets.emit 'set-vm-status', vmName, 'paused'
        else
          sock.emit 'msg', {type:'error', msg:'Cant pause VM'}
    
    sock.on 'vm-resume', (vmName) ->
      console.log "VM resume #{vmName}"
      vmHandler.resumeVm vmName, (ret) ->
        if ret.status is 'success'
          sock.emit 'msg', {type:'success', msg:'VM resumed'}
          vmHandler.setVmStatus vmName, 'running'
          ioServer.sockets.emit 'set-vm-status', vmName, 'running'
        else
          sock.emit 'msg', {type:'error', msg:'Cant resume VM'}
  
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
      console.dir vmCfg
      vmHandler.createVm vmCfg, (ret) ->
        sock.emit 'msg', ret
        
        if ret.status is 'success'
          sock.emit 'reset-create-vm-form'

module.exports.toAll = (msg, args...) ->
  ioServer.sockets.emit msg, args...