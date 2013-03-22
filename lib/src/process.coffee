os   = require 'os'
proc = require 'child_process'

class Process
  constructor: ->
    @process = undefined
    @bin     = if os.type().toLowerCase() is 'darwin' then 'qemu-system-x86_64' else if os.type().toLowerCase() is 'linux' then 'qemu'
  
  start: (args) ->
    @process = proc.spawn @bin, args, {stdio: 'inherit', detached: true}
    
    @process.on 'exit', (code, signal) ->
      if code is 0
        console.log "qemu process exit clean."
      else
        console.error "qemu exit with error #{code} and signal: #{signal}"
  
exports.Process = Process