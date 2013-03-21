
crypto = require 'crypto'

class Args
  constructor: ->
    @args    = []
    @qmpPort = 0
    @macAddr = crypto.randomBytes(6).toString('hex').match(/.{2}/g).join ':'

  ###
  #   QEMU START OPTIONS  
  ###      
  pushCmd: (cmd, opts) ->
    @args.push cmd
    @args.push opts
  
  hd: (img) ->
    @pushCmd '-drive', "file=images/#{img}.img,media=disk"
    return this
  cd: (img) ->
    @pushCmd '-drive', "file=isos/#{img}.iso,media=cdrom"
    return this

  boot: (type, once = true) ->
    args = ''
    if once is true
      args += 'once='

    if      type is 'hd'
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
    @args.push '-enable-kvm'
    return this
    
  accel: (accels) ->
    @pushCmd '-machine', "accel=#{accels}"
    return this
    
  vnc: (port) ->
    @pushCmd '-vnc', ":#{port}"
    return this
    
  mac: (addr) ->
    @macAddr = addr
    return this

  net: ->
    @pushCmd '-net', "nic,macaddr=#{@macAddr}"
    @pushCmd '-net', 'tap'
    return this
    
  gfx: (gfx = false) ->
    if gfx is false
      @args.push '-nographic'
    return this
      
  qmp: (port) ->
    @qmpPort = port
    @pushCmd '-qmp', "tcp:127.0.0.1:#{port},server"
    return this
    
  keyboard: (keyboard) ->
    @pushCmd '-k', keyboard
    return this
    
  daemon: ->
    @args.push '-daemonize'
    return this
    
exports.Args = Args