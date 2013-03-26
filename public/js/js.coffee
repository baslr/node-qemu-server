
sock = undefined

class ImageModel
  constructor: (@image) ->
    @name        = image.name
    @percentUsed = image.percentUsed

    @diskSize = ko.computed ->
      return @image.disk_size / 1024 / 1024 / 1024
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
    for n,i in @images()
      if n.name is image.name
        return
    @images.push new ImageModel image
    
  remove: (image) =>
    @images.remove image
    sock.emit 'deleteImage', image
    
class VmViewModel
  constructor: ->
    @images    = ko.observableArray()
    @isos      = ko.observableArray() #  [{name:'deiban'},{name:'ubuntu'}]
    @keyboards = ko.observableArray ['de']
    @cpus      = []
    for i in [1..8]
      @cpus.push {num:i, cpu:"#{i} cpus"}
      
    @memory = []
    for i in [1..32]
      @memory.push {num:i*128, mem:"#{i*128} MiByte"}

    @selectedCpu      = ko.observable @cpus[1]
    @selectedMemory   = ko.observable @memory[7]
    @selectedImage    = ko.observable()
    @selectedIso      = ko.observable()
    @selectedKeyboard = ko.observable 'de'
    @vmName           = ko.observable ''
    @imageSize        = ko.observable 100
    @createImage      = ko.observable false
    @bootOnceIso      = ko.observable true
    @startVm          = ko.observable false
    @vncEnabled       = ko.observable true

    @netEnabled       = ko.observable false
    @macAddr          = ko.observable ''
    
    @checkCreate    = ko.computed ->
      if @vmName().length > 3 and ( @images().length or @createImage())
        return true
      return false
    , this
  
  add: (image) ->
    for n,i in @images()
      if n is image
        return
    @images.push image
  
  create: (a) ->
    vm = { name : @vmName()
         , hardware: {
             cpus : @selectedCpu().num
             ram  : @selectedMemory().num
             hds  : []
             isos : []
             mac  : '' }
         , settings: {
             boot     : @startVm()
             bootOnce : @bootOnceIso()
             vnc      : @vncEnabled()
             keyboard : @selectedKeyboard() }}

    if @bootOnceIso()
      vm.hardware.isos.push @selectedIso()
    
    if @createImage()
      console.log {name:@vmName(), size:@imageSize()}
      vm.hardware.hds.push {name:@vmName(), size:@imageSize()}
    else
      vm.hardware.hds.push @selectedImage()

    if @netEnabled() and @macAddr().length is 17
      vm.hardware.mac = @macAddr()

    console.dir vm
    sock.emit 'createVm', vm

#      @images.remove @selectedImage()



imagesVM = new ImageViewModel()
vmVM     = new VmViewModel()

($ document).ready ->
  console.log "DOC -> ready"
  sock = io.connect "http://#{document.location.hostname}:#{document.location.port}"
  
  sock.on 'connect', ->
    console.log 'SOCK -> connected'
    
    sock.emit 'images'
    sock.emit 'isos'
      
  sock.on 'msg', (msg) ->
    $.notification msg:msg.msg, type:msg.type, fixed:true
    
  sock.on 'image', (image) ->
    imagesVM.add image
    imagesVM.changePercentage image.name, image.percentUsed

    vmVM.add image.name
    
  sock.on 'iso', (name) ->
    vmVM.isos.push name
    
  ($ 'FORM#createImageForm A#createImage').click ->
    img = name:($ 'FORM#createImageForm INPUT#imageName').val()
    img.size = ($ 'FORM#createImageForm INPUT#imageSize').val()
      
    sock.emit 'createImage', img  
  
  ko.applyBindings imagesVM, ($ 'DIV#imagesList').get    0
  ko.applyBindings vmVM,     ($ 'FORM#createVmForm').get 0