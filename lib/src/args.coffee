
crypto = require 'crypto'

class Args
  constructor: ->
    @args    = []
    @qmpPort = 0
    @macAddr = crypto.randomBytes(6).toString('hex').match(/.{2}/g).join ':'

  ###
  #   QEMU START OPTIONS  
  ###      
  pushArg: ->
    @args.push arg for arg in arguments
  
  hd: (img) ->
    @pushArg '-drive', "file=images/#{img}.img,media=disk"
    return this
  cd: (img) ->
    @pushArg '-drive', "file=isos/#{img}.iso,media=cdrom"
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
    
    @pushArg '-boot', args
    return this

  ram: (ram) ->
    @pushArg '-m', ram
    return this
    
  cpus: (n) ->
    @pushArg '-smp', n
    return this
    
  kvm: ->
    @pushArg '-enable-kvm'
    return this
    
  cpu: (cpu) ->
    @pushArg '-cpu', cpu
    return this
    
  accel: (accels) ->
    @pushArg '-machine', "accel=#{accels}"
    return this
    
  vnc: (port) ->
    @pushArg '-vnc', ":#{port}"
    return this
    
  mac: (addr) ->
    @macAddr = addr
    return this

  net: ->
    @pushArg '-net', "nic,macaddr=#{@macAddr}", '-net', 'tap'
    return this
    
  gfx: (gfx = false) ->
    if gfx is false
      @pushArg '-nographic'
    return this
      
  qmp: (port) ->
    @qmpPort = port
    @pushArg '-qmp', "tcp:127.0.0.1:#{port},server"
    return this
    
  keyboard: (keyboard) ->
    @pushArg '-k', keyboard
    return this
    
  daemon: ->
    @pushArg '-daemonize'
    return this
    
exports.Args = Args