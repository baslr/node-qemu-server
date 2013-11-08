
define (require, exports, module) ->
  
  ko = require 'ko'
  
  class HostViewModel
    constructor: ->
      @host = ko.observable({hostname:'', cpus:'', ram:'', freeRam:'', l:[0,0,0]})
      
    set: (host) ->
      host.freeRam = "#{(host.freeRam/1024/1024).toFixed 3} MiB"
      host.ram     = "#{(host.ram/1024/1024).toFixed 3} MiB"
      @host host
      
  module.exports = HostViewModel
  
  undefined
