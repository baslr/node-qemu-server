http       = require 'http'
exec       = require('child_process').exec
fs         = require 'fs'
os         = require 'os'
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

qmpStartPort = 15001

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
          ioServer.emit 'image', ret.data        
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
          
  sock.on 'isos', ->
    exec "cd isos && ls -v *.iso", (err, stdout, stderr) ->
      isos = stdout.split '\n'
      isos.pop()
    
      for iso in isos
        sock.emit 'iso', iso.split('.')[0]
        
  sock.on 'createVm', (vm) ->
    boot = ->
      if vm.boot?
        vmObj.start ->
          console.log "vm #{vm.name} started"

    console.log vm
    vms[vm.name] = qemu.createVm vm.name
    vmObj = vms[vm.name]
    args  = new qemu.Args()
    vmObj.setArgs args
    
    args.cpus(vm.cpus)
        .ram(vm.m)
        .gfx()
        .qmp(qmpStartPort)
        .keyboard('de')
        .mac('52:54:00:12:34:52')
        
    if os.type().toLowerCase() is 'linux'
      args.accel 'kvm'
        
    console.dir args
         
    if vm['bootOnce']?
      args.cd vm['bootOnce']
      args.boot 'cd'
      
    if vm.vnc is true
      args.vnc qmpStartPort-15000
      
    if vm['image']?
      args.hd vm['image']

    if vm['newImageSize']?
      qemu.createImage {name:vm.name, size:vm.newImageSize}, (ret) ->
        if ret.status is 'success'
          args.hd vm.name
          images[vm.name] = ret.image 
          boot()
    else
      boot()
    qmpStartPort++

#    .net()

setInterval ->
  for i,img of images
    img.info (ret) ->
      ioServer.sockets.emit 'image', ret.data
, 1000


webServer.on 'error', (e) ->
  console.error "webServer error: #{e}"

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