http       = require 'http'
fs         = require 'fs'
nodeStatic = require 'node-static'
qemu       = require './lib/qemu'
qemuImage  = require './lib/qemuImage'

staticS    = new nodeStatic.Server "./public"
webServer  = http.createServer()
webServer.listen 4224, '0.0.0.0'
ioServer   = require('socket.io').listen(webServer)
ioServer.set('log level', 1)

webServer.on 'request', (req, res) ->
  if  -1 is req.url.search '/socket.io/1'                                       # request to us
      staticS.serve req, res                                                    # we only serve files, all other stuff via websockets
  
socks = {}
vms   = {}

ioServer.sockets.on 'connection', (sock) ->

  socks[sock.id] = sock
  console.log "SOCK -> CON #{sock.handshake.address.address}"

  sock.on 'disconnect', ->
    console.log "SOCK -> DIS #{sock.id} #{sock.handshake.address.address}"
    delete socks[sock.id]
    
  sock.on 'status', (vmName) ->
    console.log "status #{vmName}"
    
  sock.on 'createImage', (img) ->
    qemuImage.create img, (data) ->
      if      data.status is 'success'
        sock.emit 'msg', {type:'success', msg:'image successfully created'}
      else if data.status is 'error'
        sock.emit 'msg', {type:'error',   msg:'image not created'}

webServer.on 'error', (e) ->
  console.error "webServer error: #{e}"
  
  
# load vm stats from database


# mongoOne = new qemu.QemuVm 'mongo-one'
# vms['mongo-one'] = mongoOne
# 
# mongoOne.reconnectQmp 4442, ->
#   console.log "reconnected to qmp mongoOne"