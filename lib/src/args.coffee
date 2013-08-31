os     = require 'os'
crypto = require 'crypto'

class Args
  constructor: ->
    @args    = [ '-nographic']
    @qmpPort = 0
    @macAddr = crypto.randomBytes(6).toString('hex').match(/.{2}/g).join ':'

  ###
  #   QEMU START OPTIONS  
  ###      
  pushArg: ->
    @args.push arg for arg in arguments
  
  ###
  #   no defaults, no default config
  ###
  nodefconfig: ->
    @pushArg '-nodefconfig'
    return this
  
  nodefaults: ->
    @pushArg '-nodefaults'
    return this

  ###
  #   set harddrive, set cdromdrive
  ###  
  hd: (img, intf='ide') ->
    @pushArg '-drive', "file=disks/#{img}.img,media=disk,if=#{intf}"
    return this
  partition: (partition, intf='ide') ->
    @pushArg '-drive', "file=#{partition},media=disk,if=#{intf},cache=none"
    return this
  cd: (img, intf='ide') ->
    @pushArg '-drive', "file=isos/#{img},media=cdrom,if=#{intf}"
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
  
  cpu: (cpu) ->
    @pushArg '-cpu', cpu
    return this
  
  accel: (accels) ->
    @pushArg '-machine', "accel=#{accels}"
    return this
  
  kvm: ->
    @pushArg '-enable-kvm'
    return this
  
  vnc: (port) ->
    @pushArg '-vnc', ":#{port}"
    return this
  
  spice: (port, addr, password = false) ->
    if password is false
      @pushArg "-spice port=#{port},addr=#{addr},disable-ticketing"
    else
      @pushArg "-spice port=#{port},addr=#{addr},password='#{password}'"
    return this  
  
  mac: (addr) ->
    @macAddr = addr
    return this
  
  net: (macAddr, card = 'rtl8139')->
    @mac macAddr
    
    if os.type().toLowerCase() is 'darwin'
      @pushArg '-net', "nic,model=#{card},macaddr=#{macAddr}", '-net', 'user'
    else
      @pushArg '-net', "nic,model=#{card},macaddr=#{macAddr}", '-net', 'tap'

    return this
  
  vga: (vga = 'none') ->
    @pushArg '-vga', vga
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
  
  balloon: ->
    @pushArg '-balloon', 'virtio'
    return this
    
  noStart: ->
    @pushArg '-S'
    return this
  
  noShutdown: ->
    @pushArg '-no-shutdown'
    return this
  
module.exports.Args = Args

# qemu-system-x86_64 -smp 2 -m 1024 -nographic -qmp tcp:127.0.0.1:15004,server -k de -machine accel=kvm -drive file=/...,media=cdrom -vnc :4 -net nic,model=virtio,macaddr=... -net tap -boot once=d -drive file=/dev/...,cache=none,if=virtio
