
vmHandler = require './vmHandler'
ioServer  = undefined

socks  = {}

module.exports.start = (httpServer) ->
  ioServer = require('socket.io').listen httpServer
  ioServer.set('log level', 1)
  
  ioServer.sockets.on 'connection', (sock) ->
    socks[sock.id] = sock
    console.log "SOCK -> CON #{sock.handshake.address.address}"
    console.log "SOCK -> count: #{Object.keys(socks).length}"
  
    sock.emit('set-iso', iso)   for iso  in vmHandler.getIsos()                   # emit iso  names, client drops duplicates
    
    for i,disk of vmHandler.getDisks()                                            # emit disks, client drops duplicates
      disk.info (ret) ->
        sock.emit 'set-disk', ret.data
  
    sock.on 'disconnect', ->
      console.log "SOCK -> DIS #{sock.id} #{sock.handshake.address.address}"
      delete socks[sock.id]
      
    sock.on 'status', (vmName) ->
      console.log "status #{vmName}"
  
    sock.on 'create-disk', (disk) ->
      vmHandler.createDisk disk, (ret) ->
        sock.emit 'msg', ret
        if ret.status is 'success'
          ioServer.emit 'set-disk', ret.data
    
    sock.on 'deleteImage', (img) ->
      vmHandler.deleteImage img, (ret) ->
        if      ret.status is 'success'
          sock.emit 'msg', {type:'success', msg:'image deleted'}
        else if ret.status is 'error'
          sock.emit 'msg', {type:'error',   msg:'cant delete image'}
          
    sock.on 'create-VM', (vmCfg) ->
      console.dir vmCfg
      vmHandler.createVm vmCfg, (ret) ->
        sock.emit 'msg', ret
        
        if ret.status is 'success'
          sock.emit 'reset-create-vm-form'

module.exports.toAll = (msg, args...) ->
  ioServer.sockets.emit msg, args...