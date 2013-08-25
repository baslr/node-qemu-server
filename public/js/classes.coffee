@app = socket:undefined, c:{}

class VmsViewModel
  constructor: ->
    @vms = ko.observableArray()
    
  add: (vmIn) ->
    for vm in @vms()
      if vm.name is vmIn.name
        return
    vmIn.status = ko.observable vmIn.status
    @vms.push vmIn
    
  boot: (vm) ->
    console.log "Boot: #{vm.name}"
    app.socket.emit 'vm-boot', vm.name
    
  reset: (vm) ->
    console.log "Reset: #{vm.name}"
    app.socket.emit 'vm-reset', vm.name
    
  pause: (vm) ->
    console.log "Pause: #{vm.name}"
    app.socket.emit 'vm-pause', vm.name
  
  resume: (vm) ->
    console.log "Resume: #{vm.name}"
    app.socket.emit 'vm-resume', vm.name
    
  stop: (vm) ->
    console.log "Stop: #{vm.name}"
    app.socket.emit 'vm-stop', vm.name

  setStatus: (vmName, status) ->
    for vm in @vms()
      if vm.name is vmName
        vm.status status


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

    @cpus   = []
    @cpus.push {num:i, cpu:"#{i} cpus"} for i in [1..48]

    @memory = []
    @memory.push {num:i*128, mem:"#{i*256} MiByte"} for i in [1..128]

    @selectedCpu    = ko.observable()
    @selectedMemory = ko.observable()
    @disk           = ko.observable()
    @selectedIso    = ko.observable()
    @keyboard       = ko.observable()

    @vmName        = ko.observable()
    @bootVM        = ko.observable()
    @bootDevice    = ko.observable()
    @enableVNC     = ko.observable()
    
    @enableVGACard = ko.observable()
    @vgaCard       = ko.observable()

    @enableNet = ko.observable()
    @macAddr   = ko.observable()
    @netCard   = ko.observable()

    @reset()

    @checkCreate = ko.computed ->
      if @vmName().length > 3 and @disks().length
        return true
      return false
    , this

  reset: ->
    @selectedCpu    @cpus[1]
    @selectedMemory @memory[7]
    @disk           ''
    @selectedIso    @isos[0]
    @keyboard       @keyboards[0]

    @vmName        ''
    @bootVM        false
    @bootDevice    @bootDevices[0]
    @enableVNC     true
    
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
             cpus    : @selectedCpu().num
             ram     : @selectedMemory().num
             disk    : @disk()
             iso     : if @selectedIso() isnt 'none' then @selectedIso() else false
             macAddr : if @enableNet()  and @macAddr().length is 17 then @macAddr() else false
             netCard : if @enableNet()  and @macAddr().length is 17 then @netCard() else false
             vgaCard : if @enableVGACard() then @vgaCard()                          else 'none' }
         , settings: {
             boot       : @bootVM()
             bootDevice : if @bootVM() then @bootDevice() else false
             vnc        : @enableVNC()
             keyboard   : @keyboard() }}

    app.socket.emit 'create-VM', vm
#    @images.remove @disk()

  generateMacAddr: ->    
    array = new Uint8Array 24
    window.crypto.getRandomValues array
    hex = ''
    hex += n.toString 16 for n in array
    
    @macAddr hex.slice(0,12).match(/.{2}/g).join(':')


app.c.ImageModel            = ImageModel
app.c.ImageViewModel        = ImageViewModel
app.c.FormCreateVMViewModel = FormCreateVMViewModel
app.c.IsosViewModel         = IsosViewModel
app.c.VmsViewModel          = VmsViewModel
