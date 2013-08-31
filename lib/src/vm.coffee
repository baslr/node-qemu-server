proc   = require './process'
qmp    = require './qmp'
vmConf = require('./vmCfg')

class Vm
  constructor: (@cfg, cb) ->
    if      typeof cfg is 'string'
      @name = cfg
    else if typeof cfg is 'object'
      @name = cfg.name

    @process   = new proc.Process()
    @qmp       = new qmp.Qmp @name

    vmConf.save @cfg
  
  setStatus: (status) ->
    @cfg.status = status
    @saveConfig()
  
  saveConfig: ->
    vmConf.save @cfg

  start: (cb) ->
    @process.start @cfg
    @qmp.connect   @cfg.settings.qmpPort, cb
  
  connectQmp: (cb) ->
    @qmp.connect   @cfg.settings.qmpPort, cb
    
  stopQMP: ->
    console.log "VM #{@name}: stopQMP called"
    delete @qmp
    @qmp   = new qmp.Qmp @name
  
  ###
  #   QMP commands
  ###  
  pause: (cb) ->
    @qmp.pause cb

  reset: (cb) ->
    @qmp.reset cb
    
  resume: (cb) ->
    @qmp.resume cb

  shutdown: (cb) ->
    @qmp.shutdown cb

  stop: (cb) ->
    @qmp.stop cb
    
  status: ->
    @qmp.status()

exports.Vm = Vm
  


# qVM.gfx()
#    .ram(1024)
#    .cpus(2)
#    .accel('kvm')
#    .vnc(2)
#    .mac('52:54:00:12:34:52')
#    .net()
#    .qmp(4442)
#    .hd('ub1210.img')
#    .keyboard('de')


# console.dir qVM.startArgs
# 
# # qVM.start ->
# #   console.log "qemu VM startet"
# 
# qVM.reconnectQmp 4442, ->
#   console.log "reconnected to qmp"  
  
  # qemu  -cpu kvm64


###    
  
#       @qmpSocket.write '{"execute":"query-commands"}'  

###


#     bHdCreation = flase
#     hds         = []
#     for hd in cfg.hardware.hds  
#       if      typeof hd is 'object'
#         nNumOfHdsToCreate++
#         bHdCreation = true
#       else if typeof hd is 'string'
#         hds.push hd
# 
#   for hd in cfg.hardware.hds
#     if typeof hd is 'object'
#       bHdCreation = true
#       qemu.createImage hd, (ret) ->
#         nNumOfHdsToCreate--
#         if ret.status is 'success'
#           hds.push cfg.name
#           cfg.hardware.hds = hds
#           if nNumOfHdsToCreate is 0
#             cb {status:'success', data:'cfg parsed to args'}, args
#         else
#           cb {status:'error', data:"cant create hd image"}
#           
#   if bHdCreation is false
