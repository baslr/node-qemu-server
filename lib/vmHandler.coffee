fs   = require 'fs'
qemu = require './qemu'

Disk = require './src/disk'

config       = require './config'
socketServer = require './socketServer'

isos  = []
disks = []
vms   = []

module.exports.createDisk = (disk, cb) ->
  Disk.create disk, (ret) ->
    if      ret.status is 'error'
      cb {status:'error', msg:'disk not created'}

    else if ret.status is 'success'
      disks.push disk.name

      Disk.info disk.name, (ret) ->
        cb {status:'success', msg:'disk sucessfully created', data:ret}

###
#   create VM
###
module.exports.createVm = (vmCfg, cb) ->
  for vm in vms
    if vm.name is vmCfg.name
      cb status:'error', msg:"VM with the name '#{vmCfg.name}' already exists"
      return
  
  vmCfg.status = 'stopped'
  vmCfg.settings['qmpPort'] = config.getFreeQMPport()
  if vmCfg.settings.vnc
    vmCfg.settings.vnc      = config.getFreeVNCport()
  if vmCfg.settings.spice
    vmCfg.settings.spice    = config.getFreeSPICEport()

  obj = qemu.createVm vmCfg
  vms.push obj
  socketServer.toAll 'set-vm', vmCfg

  if vmCfg.settings.boot is true
    obj.start ->
      console.log "vm #{vmCfg.name} started"
      cb {status:'success', msg:'vm created and started'}
      socketServer.toAll 'set-vm-status', vmCfg.name, 'running'
      obj.cfg.status = 'running'
      obj.saveConfig()

  cb {status:'success', msg:'created vm'}


###
  NEW ISO
###  
module.exports.newIso = (isoName) ->
  newIso = {name:isoName, size:fs.statSync("#{process.cwd()}/isos/#{isoName}").size}
  isos.push newIso
  socketServer.toAll 'set-iso', newIso
  

module.exports.processExit = (vmName, code, signal) ->
  console.log "qemu process exit VM #{vmName}"

  for vm in vms
    if vm.name is vmName
      vm.cfg.status = 'stopped'
      vm.saveConfig()
      socketServer.toAll 'set-vm-status', vmName, 'stopped' # | running | paused 
    
setInterval ->
  for disk in disks
    Disk.info disk, (ret) ->
      socketServer.toAll 'set-disk', ret.data
, 60 * 1000


###

###
module.exports.boot = (vmName, cb) ->
  for vm in vms
    if vm.name is vmName
      vm.start cb
      return
  cb {type:'error', msg:'VM not available'}
  
module.exports.resetVm = (vmName, cb) ->
  for vm in vms
    if vm.name is vmName
      vm.reset cb
      return
  cb {type:'error', msg:'VM not available'}

module.exports.pauseVm = (vmName, cb) ->
  for vm in vms
    if vm.name is vmName
      vm.pause cb
      return
  cb {type:'error', msg:'VM not paused'}
  
module.exports.resumeVm = (vmName, cb) ->
  for vm in vms
    if vm.name is vmName
      vm.resume cb
      return
  cb {type:'error', msg:'VM not resumed'}  
  
module.exports.stopVm = (vmName, cb) ->
  for vm in vms
    if vm.name is vmName
      vm.stop cb
      return
  cb {type:'error', msg:'VM not stopped.'}  
  

module.exports.setVmStatus = (vmName, status) ->
  for vm in vms
    if vm.name is vmName
      vm.cfg.status = status
      vm.saveConfig()


###
  RETURN ISOS, DISKS, VMS
###
module.exports.getIsos = ->
  return isos

module.exports.getDisks = ->
  return disks
  
module.exports.getVms = ->
  return vms


###
  DELETE DISK, ISO
###
module.exports.deleteIso = (isoName) ->
  try
    fs.unlinkSync "#{process.cwd()}/isos/#{isoName}"
    
    for iso,i in isos
      if iso.name is isoName
        isos.splice i,1
        return true
  catch e
    return false
  return false

module.exports.deleteDisk = (diskName) ->
  for disk,i in disks
    if disk is diskName
      if Disk.delete disk
        disks.splice i, 1
        return true
      else
        return false
  return false


###
  SET UP ISOS, DISKS, VM CONFIGS
###
module.exports.loadFiles = ->
  for isoName in config.getIsoFiles()                                           # iso  files
    isos.push {name:isoName, size:fs.statSync("#{process.cwd()}/isos/#{isoName}").size}
  console.log "isos found in isos/"
  console.dir  isos
  
  disks.push diskName.split('.')[0] for diskName in config.getDiskFiles()       # disk files

  
  console.log "disks found in disks/"
  console.dir  disks    
  
  for vmCfgFile in config.getVmConfigs()                                        # vm config files
    vmCfg = JSON.parse fs.readFileSync "#{process.cwd()}/vmConfigs/#{vmCfgFile}"

    if vmCfg.settings.qmpPort
      config.setToUsed 'qmp',     vmCfg.settings.qmpPort
    if vmCfg.settings.vnc
      config.setToUsed 'vnc',     vmCfg.settings.vnc
    if vmCfg.settings.spice
      config.setToUsed 'spice', vmCfg.settings.spice

    vms.push qemu.createVm vmCfg
    
  console.log "vms found in vmConfigs/"
  console.dir  vms

module.exports.reconnectVms = ->
  for vm in vms
    if vm.cfg.status isnt 'stopped'
      console.log "VM #{vm.name} isnt stopped"
      vm.connectQmp (ret) ->
        console.dir ret
  