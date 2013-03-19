
net  = require 'net'
proc = require 'child_process'

class QemuVm
  constructor: (@name) ->
    @qmpSocket    = 0
    @process      = 0
    @dataCallback = undefined

    # set from extern
    @qmpPort   = 0
    @startArgs = []
    
  start: (callback) ->
    @startVm()
    @connectQmp ->
      callback()
    
  startVm: ->
    @process = proc.spawn 'qemu', @startArgs, stdio: 'inherit', detached: true
    
    @process.on 'exit', (code, signal) ->
      console.log "qemuVM exit with code: #{code} and signal: #{signal}"

  ###
  #   qmq stuff
  ###
  connectQmp: (callback) ->
    @qmpSocket = net.connect @qmpPort
    
    @qmpSocket.on 'connect', =>
      console.log "qemuVm qmp connected"
      @qmpSocket.write '{"execute":"qmp_capabilities"}'
      
      callback()
      
    @qmpSocket.on 'data', (data) =>
      data = data.toString().split '\r\n'      
      data.pop()                                                                # remove last ''

      for json in data
        try
          parsedData = JSON.parse json.toString()
          if @dataCallback?
            if parsedData.error?
              @dataCallback 'error':parsedData.error
            else if parsedData.timestamp?
              continue
            else if parsedData.return?
              if 0 is Object.keys(parsedData.return).length
                @dataCallback status:'ok'
              else
                @dataCallback 'data':parsedData.return
            else
              console.error "cant process Data"
              console.error parsedData
            @dataCallback = undefined
          else
            console.log "no callback defined:"
            console.dir parsedData
        catch e
          console.error "cant parse returned json, Buffer is:"
          console.error json.toString()

    @qmpSocket.on 'error', (err) =>
      console.error "qmpConnectError try reconnect"
      @connectQmp callback
      
  qmpCommand: (cmd, callback) ->
    @dataCallback = callback
    @qmpSocket.write JSON.stringify execute:cmd
      
  reconnectQmp: (qmpPort, callback) ->
    @qmpPort = qmpPort
    @connectQmp callback      

  ###
  #   QEMU START OPTIONS  
  ###      
  pushCmd: (cmd, opts) ->
    @startArgs.push cmd
    @startArgs.push opts
  
  hd: (img) ->
    @pushCmd '-drive', "file=#{img},media=disk"
    return this
  cd: (img) ->
    @pushCmd '-drive', "file=#{img},media=cdrom"
    return this

  boot: (type, once = true) ->
    args = ''
    if once is true
      args += 'once='

    if type is 'hd'
      args = "#{args}c"
    else if type is 'cd'
      args = "#{args}d"
    else if type is 'net'
      args = "#{args}n"
    
    @pushCmd '-boot', args
    return this

  ram: (ram) ->
    @pushCmd '-m', ram
    return this
    
  cpus: (n) ->
    @pushCmd '-smp', n
    return this
    
  kvm: ->
    @startArgs.push '-enable-kvm'
    return this
    
  accel: (accels) ->
    @pushCmd '-machine', "accel=#{accels}"
    return this
    
  vnc: (vncPort) ->
    @pushCmd '-vnc', ":#{vncPort}"
    return this
    
  mac: (mac) ->
    @macAddr = mac
    return this

  net: ->
    @pushCmd '-net', "nic,macaddr=#{@macAddr}"
    @pushCmd '-net', 'tap'
    return this
    
  gfx: (gfx = false) ->
    if gfx is false
      @startArgs.push '-nographic'
    return this
      
  qmp: (qmpPort) ->
    @qmpPort = qmpPort
    @pushCmd '-qmp', "tcp:localhost:#{qmpPort},server"
    return this
    
  keyboard: (keyboard) ->
    @pushCmd '-k', keyboard
    return this
    
  daemon: ->
    @startArgs.push '-daemonize'
    
  ###
  #   QMP commands
  ###  
  pause: (callback) ->
    @qmpCommand 'stop', callback

  reset: (callback) ->
    @qmpCommand 'system_reset', callback
    
  resume: (callback) ->
    @qmpCommand 'cont', callback

  shutdown: (callback) ->
    @qmpCommand 'system_powerdown', callback

  stop: (callback) ->
    @qmpCommand 'stopp', callback
    

exports.QemuVm = QemuVm
  
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
# 
# setTimeout ->
#   qVM.pause (data) ->
#     if data.status is 'ok'
#       console.log "pause vm ok"
#     else
#       console.dir data
# , 10000
# 
# setTimeout ->
#   qVM.resume (data) ->
#     if data.status is 'ok'
#       console.log "resume vm ok"
#     else
#       console.dir data
# , 20000
# 
# 
# setTimeout ->
#   qVM.stop (data) ->
#     if data.status is 'ok'
#       console.log "stop vm ok"
#     else
#       console.dir data
# , 30000
# 
  
  # qemu  -cpu kvm64
  

###    
  
#       @qmpSocket.write '{"execute":"query-commands"}'  

###