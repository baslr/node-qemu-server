define (require, exports, module) ->
  socket = require 'socket'
  ko =     require 'ko'
  
  class VmsViewModel
    constructor: ->
      @socket = socket.getSocket()
      @vms    = ko.observableArray()
    
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
        return left.name is right.name ? 0 : (left.name < right.name ? -1 : 1)
    
    start: (vm) =>
      console.log "Start: #{vm.name}"
      @socket.emit 'qmp-command', 'start', vm.name
    
    reset: (vm) =>
      console.log "Reset: #{vm.name}"
      @socket.emit 'qmp-command', 'reset', vm.name
    
    pause: (vm) =>
      console.log "Pause: #{vm.name}"
      @socket.emit 'qmp-command', 'pause', vm.name
    
    resume: (vm) =>
      console.log "Resume: #{vm.name}"
      @socket.emit 'qmp-command', 'resume', vm.name
    
    stop: (vm) =>
      console.log "Stop: #{vm.name}"
      @socket.emit 'qmp-command', 'stop', vm.name
    
    setStatus: (vmName, status) ->
      for vm in @vms()
        if vm.name is vmName
          vm.status status
    
    diskUsed: (diskName) ->
      for vm in @vms()
        if vm.hardware.disk is diskName
          return true
      return false
      
    remove: (guest) =>
      console.log "delete guest: #{guest.name}"
      @socket.emit 'delete-guest', guest.name
    
    delete: (guestName) ->
      @vms.remove (guest) -> return guest.name is guestName
