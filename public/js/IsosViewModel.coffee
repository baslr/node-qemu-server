
define (require, exports, module) ->
  socket = require 'socket'
  ko     = require 'ko'
  
  class IsosViewModel
    constructor: ->
      @isos   = ko.observableArray()
      @socket = socket.getSocket()
      
    add : (iso) ->
      iso.size = (iso.size / 1024 / 1024 / 1024).toFixed 3
      @isos.push iso
      @isos.sort (left, right) -> return left.name is right.name ? 0 : (left.name < right.name ? -1 : 1)
    
    remove: (iso) ->
      console.log "delete iso: #{iso.name}"
      @socket.emit 'delete-iso', iso.name
    
    delete: (isoName) ->
      @isos.remove (iso) -> return iso.name is isoName

  module.exports = IsosViewModel
  
  undefined
