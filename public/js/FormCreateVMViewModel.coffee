
define (require, exports, module) ->

  macAddr = require 'mac-addr'
  socket  = require 'socket'
  ko      = require 'ko'

  class FormCreateVMViewModel
    constructor: ->
      @socket = socket.getSocket()
      @disks = ko.observableArray()
      @isos  = ko.observableArray ['none']
      
      @bootDevices = ['disk',        'iso']
      @keyboards   = ['ar', 'da', 'de',  'de-ch', 'en-gb', 'en-us', 'es', 'et', 'fi', 'fo', 'fr', 'fr-be', 'fr-ca', 'fr-ch', 'hr', 'hu', 'is', 'it', 'ja', 'lt', 'lv', 'mk', 'nl', 'nl-be', 'no', 'pl', 'pt', 'pt-br', 'ru', 'sl', 'sv', 'th', 'tr']
      @netCards    = ['e1000', 'i82551', 'i82557b', 'i82559er', 'ne2k_pci', 'pcnet', 'rtl8139', 'virtio']
      @graphics    = ['none', 'std', 'qxl']
  
      @cpuModels = [  {value:'QEMU 32-bit Virtual CPU version 1.6.1',     qValue:'qemu32',      tokens:['32bit', 'qemu']}
                    , {value:'QEMU 64-bit Virtual CPU version 1.6.1',     qValue:'qemu64',      tokens:['64bit', 'qemu']}
                    , {value:'Common 32-bit KVM processor',               qValue:'kvm32',       tokens:['32bit', 'kvm']}
                    , {value:'Common 64-bit KVM processor',               qValue:'kvm64',       tokens:['64bit', 'kvm']}
                    , {value:'Intel® Pentium I',                          qValue:'pentium',     tokens:['32bit', 'intel', 'pentium']}
                    , {value:'Intel® Pentium II',                         qValue:'pentium2',    tokens:['32bit', 'intel', 'pentium']}
                    , {value:'Intel® Pentium III',                        qValue:'pentium3',    tokens:['32bit', 'intel', 'pentium']}
                    , {value:'Intel® Core(TM) Duo CPU T2600 @ 2.16GHz',   qValue:'coreduo',     tokens:['32bit', 'intel', 'core', 'duo']}
                    , {value:'Intel® Core(TM)2 Duo CPU T7700 @ 2.40GHz',  qValue:'core2duo',    tokens:['64bit', 'intel', 'core', '2', 'duo', 'Merom']}
                    , {value:'Intel® Core(TM)2 Duo CPU P9xxx',            qValue:'Penryn',      tokens:['64bit', 'intel', 'core', '2', 'duo', 'Penryn']}
                    , {value:'Intel® Xeon E312xx (Sandy Bridge)',         qValue:'SandyBridge', tokens:['64bit', 'intel', 'sandy', 'bridge']}
                    , {value:'Intel® Core Processor (Haswell)',           qValue:'Haswell',     tokens:['64bit', 'intel', 'haswell']}
                    , {value:'KVM processor with all supported host features (only available in KVM mode)', qValue:'host', tokens:['host', '64bit']} ]
  
  # x86           qemu64  QEMU Virtual CPU version 1.6.1
  # x86           qemu32  QEMU Virtual CPU version 1.6.1
  # x86            kvm64  Common KVM processor
  # x86            kvm32  Common 32-bit KVM processor
  
  # x86          pentium
  # x86         pentium2
  # x86         pentium3
  # x86          coreduo  Genuine Intel(R) CPU           T2600  @ 2.16GHz
  # x86         core2duo  Intel(R) Core(TM)2 Duo CPU     T7700  @ 2.40GHz
  # x86           Penryn  Intel(R) Core(TM)2 Duo CPU     P9xxx
  # x86      SandyBridge  Intel Xeon E312xx (Sandy Bridge)
  # x86          Haswell  Intel Core Processor (Haswell)
  # x86             host
  
  
  
  
  
  # x86              486
  # x86             n270  Intel(R) Atom(TM) CPU N270   @ 1.60GHz
  # x86           Conroe  Intel Celeron_4x0 (Conroe/Merom Class Core 2)
  # x86          Nehalem  Intel Core i7 9xx (Nehalem Class Core i7)
  # x86         Westmere  Westmere E56xx/L56xx/X56xx (Nehalem-C)
  # x86           athlon  QEMU Virtual CPU version 1.6.0
  # x86           phenom  AMD Phenom(tm) 9550 Quad-Core Processor
  # x86       Opteron_G1  AMD Opteron 240 (Gen 1 Class Opteron)
  # x86       Opteron_G2  AMD Opteron 22xx (Gen 2 Class Opteron)
  # x86       Opteron_G3  AMD Opteron 23xx (Gen 3 Class Opteron)
  # x86       Opteron_G4  AMD Opteron 62xx class CPU
  # x86       Opteron_G5  AMD Opteron 63xx class CPU
      
      
      @memory = []
      @memory.push    {num:i, mem:"#{i} MiByte"} for i in [128,256,512,1024,2048,4096,6144,8192,16384]
      
      @cpuModel       = ko.observable()
      
      @sockets        = (i for i in [1..4])
      @socketCount    = ko.observable()
      
      @cores          = (i for i in [1..20])
      @coreCount      = ko.observable()
      
      @threads        = (i for i in [1..20])
      @threadCount    = ko.observable()
      
      @selectedMemory = ko.observable()
      
      @graphic        = ko.observable()
      
      @diskOrPartition = ko.observable()
      @partition       = ko.observable()
      @disk            = ko.observable()
      @selectedIso     = ko.observable()
      
      @keyboard       = ko.observable()
      
      @guestName      = ko.observable()
      @bootGuest      = ko.observable()
      @bootDevice    = ko.observable()
      @enableVNC     = ko.observable()
      @enableSpice   = ko.observable()
      
      
      @enableNet = ko.observable()
      @macAddr   = ko.observable()
      @netCard   = ko.observable()
      
      @usbList     = ko.observableArray()
      @selectedUsb = ko.observableArray()
      @usbs        = ko.observableArray()
      
      # NUMA START
      @hostCpuNode = ko.observable()
      @hostMemNode = ko.observable()
      
      @guestNumaNodes = ko.observableArray()
      # NUMA END
  
      @reset()
  
      @checkCreate = ko.computed ->
        if 2 < @guestName().length and
           ( (@diskOrPartition() is 'partition' and 1 < @partition().length) or 
             (@diskOrPartition() is 'disk'      and @disk() isnt undefined) )
          return true
        return false
      , this
  
    reset: ->
      @cpuModel       @cpuModels[1]
      @socketCount    1
      @coreCount      2
      @threadCount    4
      
      @selectedMemory @memory[4]
      
      @graphic        @graphics[0]
      
      @diskOrPartition 'disk'
      @partition       '/dev/sd'
      @disk            ''
      @selectedIso     @isos[0]
      
      @keyboard       @keyboards[2]
      
      @guestName     ''
      @bootGuest     false
      @bootDevice    @bootDevices[0]
      @enableVNC     true
      @enableSpice   true
      
      @enableNet false
      @generateMacAddr()
      @netCard   @netCards[6]
      
      @selectedUsb undefined
      @usbs.removeAll()
      
      # NUMA START
      @hostCpuNode '0'
      @hostMemNode '0'
      
      @guestNumaNodes.removeAll()
      # NUMA END
    
    getCpuModels: ->
      return @cpuModels
  
    addDisk: (newDisk) ->
      for disk in @disks()
        if disk is newDisk
          return
      @disks.push newDisk
      
    addIso: (isoName) ->
      for iso in @isos()
        if iso is isoName
          return
      @isos.push isoName
      
    deleteIso: (isoName) ->
      @isos.remove (iso) ->
        return iso is isoName
        
    deleteDisk: (diskName) ->
      @disks.remove (disk) ->
        return disk is diskName
        
    relistUsb: =>
      @usbList.removeAll()
      @usbList.push {text: 'Updating USB-Device...'}
      @socket.emit 'relist-usb'
      
    setUsbs: (usbs) ->
      @usbList.removeAll()
      @usbs.removeAll()
      @usbList.push u for u in usbs
      
    addUsb: =>
      if typeof @selectedUsb() is 'object'
        @usbs.push @selectedUsb()
        @usbList.remove @selectedUsb()
        @selectedUsb ''
    
    create: ->
      console.log "create VM"
      guest = { name : @guestName() }
      guest.hardware = {}
      hardware = guest.hardware
      hardware.cpu = {model:@cpuModel().qValue, sockets:@socketCount(), cores:@coreCount(), threads:@threadCount()}
      hardware.ram = @selectedMemory().num
      
      hardware.disk      = if @diskOrPartition() is 'disk'      then @disk()      else false
      hardware.partition = if @diskOrPartition() is 'partition' then @partition() else false
      hardware.iso       = if @selectedIso() isnt 'none' then @selectedIso() else false
  
      hardware.net = {mac: @macAddr(), nic:@netCard()} if @enableNet()
      hardware.usb = @usbs()[..]                       if @usbs().length # copy !ref
      
      hardware.vgaCard = @graphic()
  
      guest.settings = {
               boot       : @bootGuest()
               bootDevice : @bootDevice()
               vnc        : @enableVNC()
               spice      : @enableSpice()
               keyboard   : @keyboard() }
      guest.settings.numa = { cpuNode:@hostCpuNode(), memNode:@hostMemNode() }
      
      console.dir guest
  #    app.socket.emit 'create-VM', guest
  #    @disks.remove @disk()
  
    generateMacAddr: ->    
#       array = new Uint8Array 24
#       window.crypto.getRandomValues array
#       hex = ''
#       hex += n.toString 16 for n in array
#       
#       mac = hex.slice(0,12).match(/.{2}/g).join(':')
#       bin = "0000#{parseInt(mac.charAt(1), 16).toString 2}".slice -4 # at position, from 0, 1 convert from base 16 to base 2
#       bin = "#{bin.slice 0,3}0"
#   
#       @macAddr "#{mac.charAt 0}#{parseInt(bin, 2).toString 16}:#{mac.slice 3}"
#       
#       console.log mac
      @macAddr macAddr.getUnicast()
      console.log @macAddr()
      
  
  module.exports = FormCreateVMViewModel
  
  undefined
