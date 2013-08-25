os   = require 'os'
qemu = require '../qemu'
Args = require('./args').Args
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

  args = new Args()

  args.nodefconfig()
      .nodefaults()
  
  args.cpus(cfg.hardware.cpus)
      .ram( cfg.hardware.ram)
      .vga( cfg.hardware.vgaCard)
      .qmp( cfg.settings.qmpPort)
      .keyboard(cfg.settings.keyboard)

  if os.type().toLowerCase() is 'linux'
    args.accel('kvm')
        .kvm()

  args.hd cfg.hardware.disk

  if cfg.hardware.iso
    args.cd cfg.hardware.iso
      
  if cfg.hardware.macAddr.length is 17
    args.net cfg.hardware.macAddr, cfg.hardware.netCard

  if cfg.settings.vnc
    args.vnc cfg.settings.vnc
  
  if cfg.boot then switch cfg.bootDevice
      when 'disk' then args.boot 'hd', false
      when 'iso'  then args.boot 'cd', false
      
  return args

# os         : windows_x86,windows_x86_64 linux_x86_64