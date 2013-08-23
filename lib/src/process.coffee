
proc      = require 'child_process'
parser    = require './parser'
vmHandler = require '../vmHandler'

class Process
  constructor: ->
    @process = undefined
    @bin     = 'qemu-system-x86_64'

  start: (cfg) ->
    try
      args     = parser.vmCfgToArgs cfg
      console.log "start qemu with #{args.args.join(' ')}"
      @process = proc.spawn @bin, args.args, {stdio: 'inherit', detached: true}

      @process.on 'exit', (code, signal) ->
        if code is 0
          console.log "qemu process exit clean."
        else
          console.error "qemu exit with error #{code} and signal: #{signal}"
        vmHandler.vmShutdown cfg, code, signal
    catch e
      console.error "process:start:e"
      console.dir    e
  
exports.Process = Process
