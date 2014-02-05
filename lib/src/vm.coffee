config = require '../config'
proc   = require './process'
qmp    = require './qmp'
vmConf = require('./vmCfg')

class Vm
  constructor: (@cfg) ->
    @name    = @cfg.name
    @process = new proc.Process()
    @qmp     = new qmp.Qmp @name

    vmConf.save @cfg
  
  setStatus: (status) ->
    @cfg.status = status
    vmConf.save @cfg

  start: (cb) ->
    @process.start @cfg
    config.setPid @process.getPid(), @name
    
    @qmp.connect   @cfg.settings.qmpPort, (ret) =>
      cb ret
      @status()
  
  connectQmp: (cb) ->
    @qmp.connect   @cfg.settings.qmpPort, (ret) =>
      cb ret
      @status()
    
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
