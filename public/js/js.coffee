
sock = undefined

class ImageViewModel
  constructor: ->
    @images  = ko.observableArray()

  changePercentage: (name, newPercent) ->
    for n,i in @images()
      if n.name is name
        ncp = $.extend {}, n
        ncp.percentUsed = "#{newPercent}%"
        @images.replace n, ncp
        
  add: (image) ->
    for n,i in @images()
      if n.name is image.name
        return
    @images.push image
    
  remove: (image) =>
    @images.remove image
    sock.emit 'deleteImage', image
    
class VmViewModel
  constructor: ->
    @images = ko.observableArray()
    @isos   = ko.observableArray() #  [{name:'deiban'},{name:'ubuntu'}]
    @cpus   = []
    for i in [1..8]
      @cpus.push {num:i, cpu:"#{i} cpus"}
      
    @memory = []
    for i in [1..32]
      @memory.push {num:i*128, mem:"#{i*128} MiByte"}

    @selectedCpu    = ko.observable @cpus[1]
    @selectedMemory = ko.observable @memory[7]
    @selectedImage  = ko.observable()
    @selectedIso    = ko.observable()
    @vmName         = ko.observable('')
    @imageSize      = ko.observable 100
    @vmImageChecked = ko.observable false
    @bootOnceIso    = ko.observable true
    @startVm        = ko.observable false
    
    @checkCreate    = ko.computed ->
      if @vmName().length > 3 and ( @images().length or @vmImageChecked())
        return true
      return false
    , this
  
  add: (image) ->
    for n,i in @images()
      if n is image
        return
    @images.push image
  
  create: (a) ->
    vm = {  name : @vmName()
          , cpus : @selectedCpu().num
          , m    : @selectedMemory().num
          , boot : @startVm() }
          
    if @bootOnceIso()
      vm['bootOnce'] = @selectedIso()
    
    if @vmImageChecked()
      vm['newImageSize'] = @imageSize()
    else
      vm['image']    = @selectedImage()
      @images.remove @selectedImage()
    sock.emit 'createVm', vm

imagesVM = new ImageViewModel()
vmVM     = new VmViewModel()

# setTimeout ->
#   vmVM.images.removeAll()
#   vmVM.images.push {text:'dd'}
# , 10000

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