exec       = require('child_process').exec
fs         = require 'fs'
vmHandler  = require './lib/vmHandler'
webServer  = require './lib/webServer'

webServer.start()

ioServer   = require('socket.io').listen webServer.getHttpServer() 
ioServer.set('log level', 1)

socks  = {}

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

  sock.on 'createImage', (img) ->
    vmHandler.createImage img, (ret) ->
      if      ret.status is 'success'
        sock.emit 'msg', {type:'success', msg:'image sucessfully created'}
        ioServer.emit 'image', ret.data
      else if ret.status 'error'
        sock.emit 'msg', {type:'error',   msg:'image not created'}

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


# setInterval ->
#   for i,img of images
#     img.info (ret) ->
#       ioServer.sockets.emit 'image', ret.data
# , 1000

vmHandler.readVmCfgs()
vmHandler.readImages()
vmHandler.readIsos()