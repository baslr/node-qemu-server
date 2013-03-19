http       = require 'http'
exec       = require('child_process').exec
fs         = require 'fs'
nodeStatic = require 'node-static'
qemu       = require './lib/qemu'

staticS    = new nodeStatic.Server "./public"
webServer  = http.createServer()
webServer.listen 4224, '0.0.0.0'
ioServer   = require('socket.io').listen(webServer)
ioServer.set('log level', 1)

webServer.on 'request', (req, res) ->
  if  -1 is req.url.search '/socket.io/1'                                       # request to us
      staticS.serve req, res                                                    # we only serve files, all other stuff via websockets
  
socks  = {}
vms    = {}
images = {}

ioServer.sockets.on 'connection', (sock) ->

  socks[sock.id] = sock
  console.log "SOCK -> CON #{sock.handshake.address.address}"
  
  console.log "SOCK -> count: #{Object.keys(socks).length}"

  sock.on 'disconnect', ->
    console.log "SOCK -> DIS #{sock.id} #{sock.handshake.address.address}"
    delete socks[sock.id]
    
  sock.on 'status', (vmName) ->
    console.log "status #{vmName}"
    
  sock.on 'createImage', (img) ->
    qemu.createImage img, (ret) ->
      if      ret.status is 'success'
        sock.emit 'msg', {type:'success', msg:'image successfully created'}
        
        images[ret.image.name] = ret.image
        ret.image.info (ret) ->
          emitToAll 'image', ret.data
        
      else if ret.status is 'error'
        sock.emit 'msg', {type:'error',   msg:'image not created'}
        
  sock.on 'images', ->
    for i,img of images
      img.info (ret) ->
        sock.emit 'image', ret.data
        
  sock.on 'deleteImage', (image) ->
    if images[image.name]?
      images[image.name].delete (ret) ->
        if ret.status is 'success'
          sock.emit 'msg', {type:'success', msg:'image deleted'}
          delete images[image.name]
        else if ret.status is 'error'
          sock.emit 'msg', {type:'error', msg:'cant delete image'}

webServer.on 'error', (e) ->
  console.error "webServer error: #{e}"
  
emitToAll = (msg, data) ->
  for i,sock of socks
    sock.emit msg, data

###
#   read images
###

exec "cd images && ls -v *.img", (err, stdout, stderr) ->
  imgs = stdout.split '\n'
  imgs.pop()

  for img in imgs
    img = img.split('.')[0]
    images[img] = new qemu.Image img



# load vm stats from database

#-v     Natürliche Sortierung von (Versions)nummern im Text

# mongoOne = new qemu.QemuVm 'mongo-one'
# vms['mongo-one'] = mongoOne
# 
# mongoOne.reconnectQmp 4442, ->
#   console.log "reconnected to qmp mongoOne"