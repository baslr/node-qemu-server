http       = require 'http'
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
        
        emitToAll 'image', img.name

        ret.image.info (ret) ->
          console.dir ret
        
      else if ret.status is 'error'
        sock.emit 'msg', {type:'error',   msg:'image not created'}
        
  sock.on 'images', ->
    for i,img of images
      img.info (ret) ->
        sock.emit 'image', ret.data


webServer.on 'error', (e) ->
  console.error "webServer error: #{e}"
  
emitToAll = (msg, data) ->
  for i,sock of socks
    sock.emit msg, data

###
#   read images
###
for img in fs.readdirSync('images')
  if -1 < img.search(/\.img$/)
    img = img.split('.')[0]
    images[img] = new qemu.Image img



# load vm stats from database


# mongoOne = new qemu.QemuVm 'mongo-one'
# vms['mongo-one'] = mongoOne
# 
# mongoOne.reconnectQmp 4442, ->
#   console.log "reconnected to qmp mongoOne"