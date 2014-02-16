requirejs.config
  config:
    'socket':
      auth: false

define (require, exports, module) ->

  require 'typeahead'
  require 'notification'
  require 'uploader'
  require 'notification'
  
  socket = require 'socket'
  ko     = require 'ko'
  $      = require 'jquery'
  
  module.exports = ->
    console.log 'app() called'
    
    formCreateVMVM = new (require 'FormCreateVMViewModel')()
    isosVM         = new (require 'IsosViewModel')()
    imagesVM       = new (require 'ImageViewModel')()
    vmsVM          = new (require 'VmsViewModel')()
    hostVM         = new (require 'HostViewModel')()
    detailsVM      = new (require 'GuestDetailsViewModel')()
    
    console.dir hostVM
    
    socket = socket.getSocket()
    
    socket.on 'msg', (msg) ->
      $.notification msg:msg.msg, type:msg.type, fixed:true
      
    socket.on 'set-host', (host) ->
      hostVM.set host
      
    socket.on 'set-usbs', (usbs) ->
      formCreateVMVM.setUsbs usbs
    
    socket.on 'set-vm', (vm) ->
      console.log 'set-vm'
      console.dir vm
      detailsVM.add vm
      vmsVM.add vm
    
      formCreateVMVM.deleteDisk vm.hardware.disk if vm.hardware.disk
    
    socket.on 'set-vm-status', (guestName, status) ->
      console.log "VM status #{guestName} #{status}"
      vmsVM.setStatus guestName, status
      detailsVM.setStatus guestName, status
      
    socket.on 'set-disk', (disk) ->
      console.log 'set-disk'
      console.dir  disk
      imagesVM.add disk
      imagesVM.changePercentage disk, disk.percentUsed
      
      formCreateVMVM.addDisk disk.name if ! vmsVM.diskUsed disk.name

    socket.on 'set-iso', (iso) ->
      formCreateVMVM.addIso iso.name
      isosVM.add iso

    socket.on 'delete-iso', (isoName) ->
      isosVM.delete            isoName
      formCreateVMVM.deleteIso isoName
      console.log "deleted iso: #{isoName} from GUI"
      
    socket.on 'delete-disk', (diskName) ->
      imagesVM.delete           diskName
      formCreateVMVM.deleteDisk diskName
      console.log "deleted disk: #{diskName} from GUI"

    socket.on 'delete-guest', (guestName) ->
      vmsVM.delete guestName
      console.log "deleted guest: #{guestName} from GUI"
      
    socket.on 'reset-create-vm-form', -> formCreateVMVM.reset()
    
    socket.on 'reset-create-disk-form', ->
      ($ 'FORM#formDiskCreate INPUT#diskName').val ''
      ($ 'FORM#formDiskCreate INPUT#diskSize').val ''

    ko.applyBindings formCreateVMVM, ($ 'FORM#formVMcreate').get 0    
    ko.applyBindings imagesVM,       ($ 'TBODY#imagesList').get  0  
    ko.applyBindings isosVM,         ($ 'TBODY#isosList').get    0
    ko.applyBindings vmsVM,          ($ 'TBODY#vmList').get      0
    ko.applyBindings hostVM,         ($ 'TBODY#hostTable').get   0
    ko.applyBindings detailsVM,      ($ 'DIV#guestDetails').get  0
    
    ($ 'FORM#formDiskCreate BUTTON#createDisk').click ->
      disk = { name:($ 'FORM#formDiskCreate INPUT#diskName').val(), size:($ 'FORM#formDiskCreate INPUT#diskSize').val() }
      console.dir disk
      socket.emit 'create-disk', disk
      
    uploadCB = (res) ->
      console.log res.data.status
  
    ($ 'DIV#uploadArea').uploader {progressBar:'DIV#isoUploadProgressBar', post:'iso-upload', callback: uploadCB}
    
    typeahead = ($ 'INPUT#cpuModel').typeahead local:formCreateVMVM.getCpuModels(), limit:10 
    typeahead.on 'typeahead:selected', (evt, data) -> formCreateVMVM.cpuModel data


  undefined
