os    = require 'os'

Args  = require('./src/args').Args
Image = require('./src/image').Image
Vm    = require('./src/vm').Vm

exports.Args  = Args
exports.Image = Image
exports.Vm    = Vm

createImage = (cnf, callback) ->
  img = new Image cnf
  img.create callback
  
createVm = (input, cb) ->
  if      typeof input is 'string'
    return new Vm input                                                         # name
  else if typeof input is 'object'
    vm   = new Vm input.name
    args = new Args()
    vm.setArgs args

    args.cpus(input.hardware.cpus)
        .ram(input.hardware.ram)
        .gfx()
        .qmp(input.settings.qmpPort)
        .keyboard(input.settings.keyboard)
        
    if os.type().toLowerCase() is 'linux'
      args.accel 'kvm'
        
    if input.hardware.isos?
      for iso in input.hardware.isos
        args.cd iso
    
    if input.settings.vnc?
      args.vnc input.settings.vnc
      
    if input.hardware.mac?
      args.mac input.hardware.mac
      
    if typeof input.settings.bootOnce?
      args.boot 'cd', true

    bHdCreation       = false
    nNumOfHdsToCreate = 0
    for hd in input.hardware.hds
      if      typeof hd is 'string'
        args.hd hd
      else if typeof hd is 'object'
        nNumOfHdsToCreate++
        bHdCreation = true

    for hd in input.hardware.hds
      if typeof hd is 'object'
        bHdCreation = true
        qemu.createImage hd, (ret) ->
          nNumOfHdsToCreate--
          if ret.status is 'success'
            if nNumOfHdsToCreate is 0
              cb {status:'success'}, vm
          else
            cb {status:'error', data:"cant create hd image"}
            
    if bHdCreation is false
      cb {status:'success'}, vm

# ok  name: string                                                                    # string
# --  hardware:
# ok    ram  : uint
# ok    cpus : uint
# ok    hds  : []{name:strings,size:uint}                                                       # if hd not existence create, with size
# ok    isos : []strings
# ok    mac  : '11:22:33:44:55:66'
#       
#     settings:
# ok    qmpPort  : uint                                                               # not exposed to user
# ok    keyboard : string
# ok    vnc      : unit                                                               # vnc port, port = vncPort + 5900
# ok    bootOnce : true xor undefined
#       boot     : true xor undefined

exports.createImage = createImage
exports.createVm    = createVm


