os     = require 'os'
qemu   = require '../qemu'
Args   = require('./args').Args


#
# @call   conf, cb
#
# @return cb ret, new args Obj
#
module.exports.guestConfToArgs = (conf) ->
  osType = os.type().toLowerCase()
  if      typeof conf  isnt 'object'
    throw 'conf must be an object'
  else if typeof conf.name     isnt 'string'
    throw 'conf.name must be an string'
  else if typeof conf.hardware isnt 'object'
    throw 'conf.hardware must be an object'
  else if typeof conf.settings isnt 'object'
    throw 'conf.settings must be an object'
  
  hw   = conf.hardware # h-w
  st   = conf.settings # s-t

  args = new Args()

  args.nodefconfig()
      .nodefaults()
#       .noStart()
#       .noShutdown()

  args.accel('kvm').kvm() if osType is 'linux'
  
  args.ram(     hw.ram)
      .vga(     hw.vgaCard)
      .qmp(     st.qmpPort)
      .keyboard(st.keyboard)
  
  # CPU CONF
  # cpu: Object
  #   cores: n
  #   model: s
  #   sockets: n
  #   threads: n
  cpu = hw.cpu
  
  # MODEL
  args.cpuModel cpu.model
  
  # CPU architecture
  args.cpus cpu.cores, cpu.threads, cpu.sockets 
                
  # NET CONF
  if hw.net?
    net = hw.net
    args.net net.mac, net.nic, net.mode
  
  ipAddr = []
  for interfaceName,intfce of os.networkInterfaces()
    for m in intfce
      if m.family is 'IPv4' and m.internal is false and m.address isnt '127.0.0.1'
        ipAddr.push m.address
  console.log ipAddr
  
  if osType is 'linux'
    args.spice st.spice, ipAddr[0] if st.spice #    -spice port=5900,addr=192.168.178.63,disable-ticketing
    
    args.usbOn()
    args.usbDevice u.vendorId, u.productId for u in (if hw.usb? then hw.usb else [])
    
    # NUMA CONF
    # numa: Object
    #   cpuNode: n
    #   memNode: n
    numa = st.numa
    args.hostNuma numa.cpuNode, numa.memNode
      
  
  if      hw.disk
    args.hd        hw.disk
  else if hw.partition
    args.partition hw.partition

  args.cd  hw.iso if hw.iso
  args.vnc st.vnc if st.vnc

    
  if st.boot then switch st.bootDevice
      when 'disk' then args.boot 'hd', false
      when 'iso'  then args.boot 'cd', false
  
  return args
