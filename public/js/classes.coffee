@app = socket:undefined, c:{}

class ImageModel
  constructor: (@image) ->
    @name        = image.name
    @percentUsed = image.percentUsed
    @format      = image.file_format

    @used = ko.computed ->
      return @image.disk_size / 1024 / 1024 / 1024
    , this
    
    @size = ko.computed ->
      return @image.virtual_size / 1024 / 1024 / 1024
    , this
    
    @left = ko.computed ->
      return (@image.virtual_size - @image.disk_size) / 1024 / 1024 / 1024
    , this

class ImageViewModel
  constructor: ->
    @images  = ko.observableArray()

  changePercentage: (name, newPercent) ->
    for n,i in @images()
      if n.name is name
#        ncp = $.extend {}, n
#        ncp.percentUsed = "#{newPercent}%"

        ncp = new ImageModel n.image
        ncp.percentUsed = "#{newPercent}%"
        @images.replace n, ncp
        
  add: (image) ->
    console.dir image
    for n,i in @images()
      if n.name is image.name
        return
    @images.push new ImageModel image
    
  remove: (image) =>
    @images.remove image
    app.socket.emit 'deleteImage', image
    
class FormCreateVMViewModel
  constructor: ->
    @disks = ko.observableArray()
    @isos  = ko.observableArray ['none'] # ['debian', 'ubuntu' ]
    
    @bootDevices = ['disk',    'iso'    ]
    @keyboards   = ['de',      'en-us'  ]
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
    
  addIso: (newIso) ->
    for iso in @isos()
      if iso is newIso
        return
    @isos.push newIso
  
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
