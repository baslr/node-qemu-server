
class ImageViewModel
  constructor: ->
    @images  = ko.observableArray()

  changePercentage: (name, newPercent) ->
    for n,i in @images()
      if n.name is name
        ncp = $.extend {}, n
        ncp.percentUsed = newPercent
        @images.replace n, ncp
        
  add: (image) ->
    @images.push image

imagesVM = new ImageViewModel()


($ document).ready ->
  console.log "DOC -> ready"
  sock = io.connect "http://#{document.location.hostname}:#{document.location.port}"
  
  sock.on 'connect', ->
    console.log 'SOCK -> connected'
    
    sock.emit 'images'
  
    ($ 'FORM#createImageForm A#createImage').click ->
      img = name:($ 'FORM#createImageForm INPUT#imageName').val()
      img.size = ($ 'FORM#createImageForm INPUT#imageSize').val()
      
      sock.emit 'createImage', img
      
      
  sock.on 'msg', (msg) ->
    $.notification msg:msg.msg, type:msg.type, fixed:true
    
  sock.on 'image', (image) ->
    console.log image
  
    image['percentUsed'] = "#{100/image['virtual_size'] * image['disk_size']}%"
    imagesVM.add image
    
  ko.applyBindings imagesVM, ($ 'DIV#imagesList').get 0
  

#     ($ 'DIV#listImagesTab').append ($ '<div/>').addClass('well').text "#{image.name}, #{image.disk_size}, #{image.virtual_size}"
#     
#     <div class="progress progress-info">
#       <div class="bar" style="width: 20%"></div>
#     </div>