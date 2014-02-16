
define (require, exports, module) ->
  
  socket = require 'socket'
  ko     = require 'ko'
  
  class GuestDetailsViewModel
    constructor: () ->
      @socket = socket.getSocket()
      @names  = ko.observableArray []
      @guest  = ko.observable {name:'', status:ko.observable(), hardware:{cpu:{model:'',sockets:'',cores:'',threads:''},net:{nic:'',mode:'',mac:''}},settings:{vgaCard:'',vnc:'',spice:'',snapshot:'',keyboard:''}}
      @guests = {}
    
    selectGuest: (name) =>
      @guest @guests[name]
    
    add: (guest) ->
      return if @guests[guest.name]?
      
      @guests[guest.name] = JSON.parse JSON.stringify guest
      @guests[guest.name].status            = ko.observable guest.status
      @guests[guest.name].settings.snapshot = ko.observable guest.settings.snapshot
      @names.push guest.name
    
    setStatus: (guestName, status) ->
      console.log 'set status', guestName, status
      for i,n of @guests
        return n.status status if i is guestName
    
    changed: (access) =>
      console.log "changed: #{access}"
      setTimeout () =>
        try
          data = access.split '.'
          
          b = @guest()
          b = b[data.shift()] while data.length > 1
          
          last = data.shift()
          val = if typeof b[last] is 'function' then b[last]() else b[last]
          console.log val
          @socket.emit 'change-guest-conf-entry', @guest().name, {access:access, val:val}
      , 50
      undefined
        
    qmp: (command) =>
      @socket.emit 'qmp-command', command, @guest().name
    
      
  module.exports = GuestDetailsViewModel
  
  undefined
