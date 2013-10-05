
imagesVM       = new app.c.ImageViewModel()
formCreateVMVM = new app.c.FormCreateVMViewModel()
isosVM         = new app.c.IsosViewModel()
vmsVM          = new app.c.VmsViewModel()
hostVM         = new app.c.HostViewModel()

app.formCreateVMVM = formCreateVMVM
app.vmsVM          = vmsVM
app.hostVM         = hostVM

($ document).ready ->
  console.log "DOC -> ready"
  app.socket = io.connect "http://#{document.location.hostname}:#{document.location.port}"
  
  app.socket.on 'connect', ->
    console.log 'SOCK -> connected'
      
  app.socket.on 'msg', (msg) ->
    $.notification msg:msg.msg, type:msg.type, fixed:true
    
  app.socket.on 'set-host', (host) ->
    hostVM.set host


  app.socket.on 'set-vm', (vm) ->
    console.dir vm
    vmsVM.add vm
    
    if vm.hardware.disk
      formCreateVMVM.deleteDisk vm.hardware.disk
  
  app.socket.on 'set-vm-status', (vmName, status) ->
    console.log "VM status #{vmName} #{status}"
    vmsVM.setStatus vmName, status

  app.socket.on 'set-disk', (disk) ->
    console.log 'set-disk'
    console.dir  disk
    imagesVM.add disk
    imagesVM.changePercentage disk, disk.percentUsed
    
    if ! vmsVM.diskUsed disk.name
      formCreateVMVM.addDisk disk.name

  app.socket.on 'set-iso', (iso) ->
    formCreateVMVM.addIso iso.name
    isosVM.add iso
    
  app.socket.on 'delete-iso', (isoName) ->
    isosVM.delete            isoName
    formCreateVMVM.deleteIso isoName
    console.log "deleted iso: #{isoName} from GUI"
    
  app.socket.on 'delete-disk', (diskName) ->
    imagesVM.delete           diskName
    formCreateVMVM.deleteDisk diskName
    console.log "deleted disk: #{diskName} from GUI"
  
  app.socket.on 'reset-create-vm-form', ->
    formCreateVMVM.reset()
    
  app.socket.on 'reset-create-disk-form', ->
    ($ 'FORM#formDiskCreate INPUT#diskName').val ''
    ($ 'FORM#formDiskCreate INPUT#diskSize').val ''
    
  ($ 'FORM#formDiskCreate BUTTON#createDisk').click ->
    disk = { name:($ 'FORM#formDiskCreate INPUT#diskName').val(), size:($ 'FORM#formDiskCreate INPUT#diskSize').val() }
    
    console.dir disk
    app.socket.emit 'create-disk', disk
  
  hostVM.set {hostname:'-', cpus:0, ram:0, freeRam:0, l:[0,0,0]}

  ko.applyBindings imagesVM,       ($ 'TBODY#imagesList').get  0
  ko.applyBindings formCreateVMVM, ($ 'FORM#formVMcreate').get 0
  ko.applyBindings isosVM,         ($ 'TBODY#isosList').get    0
  ko.applyBindings vmsVM,          ($ 'TBODY#vmList').get      0
  ko.applyBindings hostVM,         ($ 'TBODY#hostTable').get   0
  
  uploadCB = (res) ->
    console.log res.data.status

  ($ 'DIV#uploadArea').uploader {progressBar:'DIV#isoUploadProgressBar', post:'iso-upload', callback: uploadCB}
  
  typeahead = ($ 'INPUT#cpuModelName').typeahead local:app.formCreateVMVM.getCpuModels(), limit:10 
  typeahead.on 'typeahead:selected', (evt, data) ->
    app.formCreateVMVM.cpuModel data.qValue

