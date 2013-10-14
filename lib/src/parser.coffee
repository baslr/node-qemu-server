os     = require 'os'
qemu   = require '../qemu'
Args   = require('./args').Args

osType = os.type().toLowerCase()

#
# @call   cfg, cb
#
# @return cb ret, new args Obj
#
module.exports.vmCfgToArgs = (cfg, cb = ->) ->
  if      typeof cfg  isnt 'object'
    throw 'cfg must be an object'
  else if typeof cfg.name     isnt 'string'
    throw 'cfg.name must be an string'  
  else if typeof cfg.hardware isnt 'object'
    throw 'cfg.hardware must be an object'
  else if typeof cfg.settings isnt 'object'
    throw 'cfg.settings must be an object'

  conf = cfg
  args = new Args()

  args.nodefconfig()
      .nodefaults()
#       .noStart()
#       .noShutdown()

  args.accel('kvm').kvm() if osType is 'linux'
  
  args.ram( cfg.hardware.ram)
      .vga( cfg.hardware.vgaCard)
      .qmp( cfg.settings.qmpPort)
      .keyboard(cfg.settings.keyboard)
  
  
  # CPU CONF
  # cpu: Object
  #   cores: 8
  #   model: "Haswell"
  #   sockets: 4
  #   threads: 8
  cpu = conf.hardware.cpu
  
  # MODEL // -cpu model
  args.cpuModel cpu.model
  
  # SMP // -smp [cpus=]n[,cores=cores][,threads=threads][,sockets=sockets][,maxcpus=maxcpus]
  args.cpus "cores=#{cpu.cores},threads=#{cpu.threads},sockets=#{cpu.sockets}"

  # NET CONF
  if conf.hardware.net?
    net = conf.hardware.net
    args.net net.mac, net.nic

  
  ipAddr = []
  for interfaceName,intfce of os.networkInterfaces()
    for m in intfce
      if m.family is 'IPv4' and m.internal is false and m.address isnt '127.0.0.1'
        ipAddr.push m.address
  console.log ipAddr
  
  if cfg.settings.spice
    if osType is 'linux'
      args.spice cfg.settings.spice, ipAddr[0] #    -spice port=5900,addr=192.168.178.63,disable-ticketing
    else
      console.log "SPICE only supported with linux"
  
  if      cfg.hardware.disk
    args.hd cfg.hardware.disk
  else if cfg.hardware.partition
    args.partition cfg.hardware.partition

  if cfg.hardware.iso
    args.cd cfg.hardware.iso
  
  if cfg.settings.vnc
    args.vnc cfg.settings.vnc
    
  if cfg.settings.boot then switch cfg.settings.bootDevice
      when 'disk' then args.boot 'hd', false
      when 'iso'  then args.boot 'cd', false
      
  return args

# os         : windows_x86,windows_x86_64 linux_x86_64 fürs disk interface