os   = require 'os'
proc = require 'child_process'

qmp  = require './qmp'

class Vm
  constructor: (@name) ->
    @qmpSocket    = 0
    @process      = 0
    @dataCallback = undefined
    @bin          = if os.type().toLowerCase() is 'darwin' then 'qemu-system-x86_64' else if os.type().toLowerCase() is 'linux' then 'qemu'

    # set from extern
    @startArgs = undefined
    @qmp       = new qmp.Qmp()
    
  start: (cb) ->
    @startVm()
    console.log @startArgs.qmpPort
    @qmp.connect @startArgs.qmpPort, cb
    
  startVm: ->
    @process = proc.spawn @bin, @startArgs.args, stdio: 'inherit', detached: true
    
    @process.on 'exit', (code, signal) ->
      console.log "qemuVM exit with code: #{code} and signal: #{signal}"

#   ###
#   #   qmq stuff
#   ###
#   connectQmp: (callback) ->
#     @qmpSocket = net.connect @startArgs.qmpPort
#     
#     @qmpSocket.on 'connect', =>
#       console.log "qemuVm qmp connected"
#       @qmpSocket.write '{"execute":"qmp_capabilities"}'
#       
#       callback()
#       
#     @qmpSocket.on 'data', (data) =>
#       data = data.toString().split '\r\n'      
#       data.pop()                                                                # remove last ''
# 
#       for json in data
#         try
#           parsedData = JSON.parse json.toString()
#           if @dataCallback?
#             if parsedData.error?
#               @dataCallback 'error':parsedData.error
#             else if parsedData.timestamp?
#               continue
#             else if parsedData.return?
#               if 0 is Object.keys(parsedData.return).length
#                 @dataCallback status:'ok'
#               else
#                 @dataCallback 'data':parsedData.return
#             else
#               console.error "cant process Data"
#               console.error parsedData
#             @dataCallback = undefined
#           else
#             console.log "no callback defined:"
#             console.dir parsedData
#         catch e
#           console.error "cant parse returned json, Buffer is:"
#           console.error json.toString()
# 
#     @qmpSocket.on 'error', (err) =>
#       console.error "qmpConnectError try reconnect"
#       @connectQmp callback
#       
#   qmpCommand: (cmd, callback) ->
#     @dataCallback = callback
#     @qmpSocket.write JSON.stringify execute:cmd
#       
#   reconnectQmp: (qmpPort, callback) ->
#     @startArgs.qmpPort = qmpPort
#     @connectQmp callback
    
  setArgs: (args) ->
    @startArgs = args
    
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
  
# qVM = new QemuVm 'mongo-one'

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