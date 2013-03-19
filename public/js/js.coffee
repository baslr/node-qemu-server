
($ document).ready ->
  sock = io.connect "http://#{document.location.hostname}:#{document.location.port}"
  
  sock.on 'connect', ->
    console.log 'SOCK -> connected'
  
    ($ 'FORM#createImageForm A#createImage').click ->
      img = name:($ 'FORM#createImageForm INPUT#imageName').val()
      img.size = ($ 'FORM#createImageForm INPUT#imageSize').val()
      
      sock.emit 'createImage', img
      
      
  sock.on 'msg', (msg) ->
    $.notification msg:msg.msg, type:msg.type, fixed:true