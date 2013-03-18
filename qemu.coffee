
net  = require 'net'
proc = require 'child_process'

class QemuVm
  constructor: (@name) ->
    @qmpSocket = 0
    @process   = 0

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

  connectQmp: (callback) ->
    @qmpSocket = net.connect @qmpPort
    
    @qmpSocket.on 'connect', =>
      console.log "qemuVm qmp connected"
      @qmpSocket.write '{"execute":"qmp_capabilities"}'
      
      callback()
      
    @qmpSocket.on 'data', (data) ->
      console.log "qmpData"
      data = data.toString().split '\r\n'
      console.dir data
      
      for json in data
        try
          console.dir JSON.parse json.toString()
        catch e
          console.error "cant parse returned json, Buffer is:"
          console.error json.toString()

    @qmpSocket.on 'error', (err) =>
      console.error "qmpConnectError try reconnect"
      @connectQmp callback
      
  pushCmd: (cmd, opts) ->
    @startArgs.push cmd
    @startArgs.push opts

  reconnectQmp: (qmpPort, callback) ->
    @qmpPort = qmpPort
    @connectQmp callback

  ###
  #   QEMU START OPTIONS  
  ###
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
  pause: ->
    @qmpCommand 'stop'

  reset: ->
    @qmpCommand 'system_reset'
    
  resume: ->
    @qmpCommand 'cont'

  shutdown: ->
    @qmpCommand 'system_powerdown'

  stop: ->
    @qmpCommand 'quit'

  qmpCommand: (cmd) ->
    @qmpSocket.write JSON.stringify execute:cmd

  
qVM = new QemuVm 'mongo-one'

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


console.dir qVM.startArgs

# qVM.start ->
#   console.log "qemu VM startet"

qVM.reconnectQmp 4442, ->
  console.log "reconnected to qmp"  

# setTimeout ->
#   qVM.stop()
# , 60000
  
  # qemu  -cpu kvm64
  

###    
  
#       @qmpSocket.write '{"execute":"query-commands"}'  
  
  
inspired by 
https://github.com/hoffoo/qemulib

cmdlist = {
    boot    : "-boot",
    drive   : "-drive",
    kernel  : "-kernel",
    append  : "-append",
    initrd  : "-initrd",
    cdrom   : "-cdrom",
    hda     : "-hda",
    hdb     : "-hdb",
    hdc     : "-hdc",
    hdd     : "-hdd",
    nic     : "-net nic,",
    net     : "-net user,"
}


# main object managed here
vm = (qemu) ->
  qemu      : qemu
  # qmp socket loc (tcp or fifo)
  qmp       : null
  appended  : ''

  start   : (cb) ->
    this.qemu.start(this, cb)

  # internal stuff
  cmds : []
  cmdput : (cmd, arg) ->
    @cmds.push cmd
    @cmds.push arg

  makeArgs : ->
    res = @cmds

    if (this.appended)
      res.push this.appended
    res
  qAppend : (line) ->
    this.appended += ' ' + line



  # kernel related
  kernel  : (file) ->
    this.cmdput 'kernel', file
    this
  append  : (line) ->
    this.cmdput 'append', line
    this
  initrd  : (file) ->
    this.cmdput 'initrd', file
    this

  # drive related
  hda : (file) ->
    this.cmdput '-hda', file
    this
  hdb : (file) ->
    this.cmdput 'hdb', file
    this
  hdc : (file) ->
    this.cmdput 'hdc', file
    this
  hdd : (file) ->
    this.cmdput 'hdd', file
    this
  cdrom : (file) ->
    this.cmdput '-cdrom', file

  # qmp commands
  qmpSend : (data, callback) ->
    socket = net.connect({port: this.qmp})
    qemuOutput = null
    socket.on 'connect', ->
      socket.write('{"execute":"qmp_capabilities"}')
      socket.write(data)

    socket.on 'data', (resp) ->
      socket.end()
      qemuOutput = resp
    socket.on 'end', ->
      callback(qemuOutput)
  quit : (callback) ->
    this.qmpSend('{"execute":"quit"}', callback)

  drives  : []
  nics    : []


firstVm = new vm {}

firstVm.hda   'debianImg'
firstVm.cdrom 'abc'

# console.dir firstVm.makeArgs()
###