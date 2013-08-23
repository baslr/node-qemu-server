
imagesVM       = new app.c.ImageViewModel()
formCreateVMVM = new app.c.FormCreateVMViewModel()

app.formCreateVMVM = formCreateVMVM

($ document).ready ->
  console.log "DOC -> ready"
  app.socket = io.connect "http://#{document.location.hostname}:#{document.location.port}"
  
  app.socket.on 'connect', ->
    console.log 'SOCK -> connected'
      
  app.socket.on 'msg', (msg) ->
    $.notification msg:msg.msg, type:msg.type, fixed:true



  app.socket.on 'set-disk', (disk) ->
    imagesVM.add disk
    imagesVM.changePercentage disk.name, disk.percentUsed
    formCreateVMVM.addDisk disk.name

  app.socket.on 'set-iso', (name) ->
    formCreateVMVM.addIso name
  
  app.socket.on 'reset-create-vm-form', ->
    formCreateVMVM.reset()


    
  ($ 'FORM#formDiskCreate BUTTON#createDisk').click ->
    disk = name:($ 'FORM#formDiskCreate INPUT#diskName').val()
    disk.size = ($ 'FORM#formDiskCreate INPUT#diskSize').val()
    
    console.dir disk  
    #sock.emit 'createImage', img  
  
  ko.applyBindings imagesVM,       ($ 'DIV#imagesList').get    0
  ko.applyBindings formCreateVMVM, ($ 'FORM#formVMcreate').get 0
  
  formCreateVMVM.addDisk 'keksss.img'
  formCreateVMVM.addDisk 'stulle.img'
