os   = require 'os'
qemu = require '../qemu'
Args = require('./args').Args
#
# @call   cfg, cb
#
# @return cb ret, new args Obj
#
vmCfgToArgs = (cfg, cb = ->) ->
  if typeof cfg  isnt 'object'
    cb {status:'error', data:'cfg must be an object'} 
    return
  if typeof cfg.name     isnt 'string'
    cb {status:'error', data:'cfg.name must be an string'}  
    return
  if typeof cfg.hardware isnt 'object'
    cb {status:'error', data:'cfg.hardware must be an object'}
    return
  if typeof cfg.settings isnt 'object'
    cb {status:'error', data:'cfg.settings must be an object'}
    return
    
  args   = new Args()

  args.cpus(cfg.hardware.cpus)
      .ram( cfg.hardware.ram)
      .gfx()
      .qmp( cfg.settings.qmpPort)
      .keyboard(cfg.settings.keyboard)
      
  if os.type().toLowerCase() is 'linux'        # GNU / LINUX accelerate with kvm
    args.accel 'kvm'
      
  if cfg.hardware.isos?
    for iso in cfg.hardware.isos
      args.cd iso
  
  if cfg.settings.vnc
    args.vnc cfg.settings.vnc
    
  if cfg.hardware.mac?
    args.mac cgf.hardware.mac
    
  if cfg.settings.bootOnce
    args.boot 'cd', true

  bHdCreation       = false
  nNumOfHdsToCreate = 0
  for hd in cfg.hardware.hds
    if      typeof hd is 'string'
      args.hd hd
    else if typeof hd is 'object'
      nNumOfHdsToCreate++
      bHdCreation = true

  for hd in cfg.hardware.hds
    if typeof hd is 'object'
      bHdCreation = true
      qemu.createImage hd, (ret) ->
        nNumOfHdsToCreate--
        if ret.status is 'success'
          if nNumOfHdsToCreate is 0
            cb {status:'success', data:'cfg parsed to args'}, args
        else
          cb {status:'error', data:"cant create hd image"}
          
  if bHdCreation is false
    cb {status:'success', data:'cfg parsed to args'}, args
    
exports.vmCfgToArgs = vmCfgToArgs
