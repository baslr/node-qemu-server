@app = socket:undefined, c:{}

class HostViewModel
  constructor: ->
    @host = ko.observable()
    
  set: (host) ->
    host.freeRam = "#{(host.freeRam/1024/1024).toFixed 3} MiB"
    host.ram     = "#{(host.ram/1024/1024).toFixed 3} MiB"
    @host host

class VmsViewModel
  constructor: ->
    @vms = ko.observableArray()
  
  expandStatus: (item) ->
    console.log "expand Status"
    item.expandedStatus !item.expandedStatus()
    
  expandIso: (item) ->
    console.log "expand Iso"
    item.expandedIso !item.expandedIso()
  
  add: (vmIn) ->
    for vm in @vms()
      if vm.name is vmIn.name
        return
    vmIn.status = ko.observable vmIn.status
    vmIn.expandedStatus = ko.observable false
    vmIn.expandedIso    = ko.observable false

    @vms.push vmIn
    
    @vms.sort (left, right) ->
      return left.vms.name == right.name ? 0 : (left.name < right.name ? -1 : 1)
  
  start: (vm) ->
    console.log "Start: #{vm.name}"
    app.socket.emit 'qmp-command', 'start', vm.name
  
  reset: (vm) ->
    console.log "Reset: #{vm.name}"
    app.socket.emit 'qmp-command', 'reset', vm.name
  
  pause: (vm) ->
    console.log "Pause: #{vm.name}"
    app.socket.emit 'qmp-command', 'pause', vm.name
  
  resume: (vm) ->
    console.log "Resume: #{vm.name}"
    app.socket.emit 'qmp-command', 'resume', vm.name
  
  stop: (vm) ->
    console.log "Stop: #{vm.name}"
    app.socket.emit 'qmp-command', 'stop', vm.name
  
  setStatus: (vmName, status) ->
    for vm in @vms()
      if vm.name is vmName
        vm.status status
  
  diskUsed: (diskName) ->
    for vm in @vms()
      if vm.hardware.disk is diskName
        return true
    return false


class IsosViewModel
  constructor: ->
    @isos = ko.observableArray()
    
  add : (iso) ->
    iso.size = (iso.size / 1024 / 1024 / 1024).toFixed 3
    @isos.push iso
    
  remove: (iso) ->
    console.log "delete iso #{iso.name}"
    app.socket.emit 'delete-iso', iso.name
    
  delete: (isoName) ->
    @isos.remove (iso) ->
      return iso.name is isoName


class ImageModel
  constructor: (@image) ->
    @name        = image.name
    @percentUsed = image.percentUsed
    @format      = image.file_format

    @used = ko.computed ->
      return (@image.disk_size / 1024 / 1024 / 1024).toFixed 3
    , this
    
    @size = ko.computed ->
      return (@image.virtual_size / 1024 / 1024 / 1024).toFixed 3
    , this
    
    @left = ko.computed ->
      return ((@image.virtual_size - @image.disk_size) / 1024 / 1024 / 1024).toFixed 3
    , this


class ImageViewModel
  constructor: ->
    @images  = ko.observableArray()

  changePercentage: (disk, newPercent) ->
    for n,i in @images()
      if n.name is disk.name
        ncp = new ImageModel disk
        ncp.percentUsed = "#{newPercent}%"
        @images.replace n, ncp
        
  add: (image) ->
    for n,i in @images()
      if n.name is image.name
        return
    @images.push new ImageModel image
    
  remove: (disk) ->
    app.socket.emit 'delete-disk', disk.name
  
  delete: (diskName) ->
    @images.remove (disk) ->
      return disk.name is diskName


class FormCreateVMViewModel
  constructor: ->
    @disks = ko.observableArray()
    @isos  = ko.observableArray ['none'] # ['debian', 'ubuntu' ]
    
    @bootDevices = ['disk',        'iso']
    @keyboards   = ['de',        'en-us']
    @netCards    = ['virtio',  'rtl8139']
    @vgaCards    = ['none', 'std', 'qxl']

    @cpuModels = ['qemu32', 'qemu64', 'kvm32', 'kvm64', 'core2duo', 'SandyBridge', 'Haswell']
    @cpus      = []
    @cpus.push {num:i, cpu:"#{i} cpus"} for i in [1..48]


    @memory = []
    @memory.push {num:i*256, mem:"#{i*256} MiByte"} for i in [1..128]

    @cpuCount       = ko.observable()
    @enableCpuModel = ko.observable()
    @cpuModel       = ko.observable()

    @selectedMemory = ko.observable()

    @diskOrPartition = ko.observable()
    @partition       = ko.observable()
    @disk            = ko.observable()
    @selectedIso     = ko.observable()
    
    @keyboard       = ko.observable()

    @vmName        = ko.observable()
    @bootVM        = ko.observable()
    @bootDevice    = ko.observable()
    @enableVNC     = ko.observable()
    @enableSpice   = ko.observable()
    
    @enableVGACard = ko.observable()
    @vgaCard       = ko.observable()

    @enableNet = ko.observable()
    @macAddr   = ko.observable()
    @netCard   = ko.observable()

    @reset()

    @checkCreate = ko.computed ->
      if 2 < @vmName().length and
         ( (@diskOrPartition() is 'partition' and 1 < @partition().length) or 
           (@diskOrPartition() is 'disk'      and @disk() isnt undefined) )
        return true
      return false
    , this

  reset: ->
    @cpuCount       @cpus[1]
    @enableCpuModel false
    @cpuModel       @cpuModels[3]

    @selectedMemory @memory[7]

    @diskOrPartition 'disk'
    @partition       '/dev/sd'
    @disk            ''
    @selectedIso     @isos[0]

    @keyboard       @keyboards[0]

    @vmName        ''
    @bootVM        false
    @bootDevice    @bootDevices[0]
    @enableVNC     true
    @enableSpice   true
    
    @enableVGACard false
    @vgaCard       @vgaCards[0]

    @enableNet false
    @macAddr   ''
    @netCard   @netCards[1]

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
  
  create: ->
    console.log "create VM"
    vm = { name : @vmName()
         , hardware: {
             cpus      : @cpuCount().num
             cpu       : if @enableCpuModel() then @cpuModel() else false
             ram       : @selectedMemory().num
             disk      : if @diskOrPartition() is 'disk'      then @disk()      else false
             partition : if @diskOrPartition() is 'partition' then @partition() else false
             iso       : if @selectedIso() isnt 'none' then @selectedIso() else false
             macAddr   : if @enableNet()  and @macAddr().length is 17 then @macAddr() else false
             netCard   : if @enableNet()  and @macAddr().length is 17 then @netCard() else false
             vgaCard   : if @enableVGACard() then @vgaCard()                          else 'none' }
         , settings: {
             boot       : @bootVM()
             bootDevice : @bootDevice()
             vnc        : @enableVNC()
             spice      : @enableSpice()
             keyboard   : @keyboard() }}

    app.socket.emit 'create-VM', vm
#    @images.remove @disk()

  generateMacAddr: ->    
    array = new Uint8Array 24
    window.crypto.getRandomValues array
    hex = ''
    hex += n.toString 16 for n in array
    
    mac = hex.slice(0,12).match(/.{2}/g).join(':')
    bin = "0000#{parseInt(mac.charAt(1), 16).toString 2}".slice -4 # at position, from 0, 1 convert from base 16 to base 2
    bin = "#{bin.slice 0,3}0"

    @macAddr "#{mac.charAt 0}#{parseInt(bin, 2).toString 16}:#{mac.slice 3}"
    
    console.log mac
    console.log @macAddr()

app.c.ImageModel            = ImageModel
app.c.ImageViewModel        = ImageViewModel
app.c.FormCreateVMViewModel = FormCreateVMViewModel
app.c.IsosViewModel         = IsosViewModel
app.c.VmsViewModel          = VmsViewModel
app.c.HostViewModel         = HostViewModel
