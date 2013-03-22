proc = require './process'
qmp  = require './qmp'

class Vm
  constructor: (@name) ->
    @process   = new proc.Process()
    @qmp       = new qmp.Qmp()

    # set from extern    
    @args = undefined

  start: (cb) ->
    @process.start @args.args
    @qmp.connect   @args.qmpPort, cb

  setArgs: (args) ->
    @args = args
    
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