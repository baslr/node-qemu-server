proc      = require 'child_process'
pin       = require './pin'
parser    = require './parser'
vmHandler = require '../vmHandler'

class Process
  constructor: ->
    @process = undefined
    @bin     = 'qemu-system-x86_64'

  start: (vmConf) ->
    try
      args     = parser.vmCfgToArgs vmConf
      @process = proc.spawn @bin, args.args, {stdio: 'inherit', detached: true}

      console.log "QEMU-Process: Start-Parameters: #{args.args.join(' ')}"
      console.log "pinnig QEMU-Process"
      pin @process.pid, vmConf.cpus

      @process.on 'exit', (code, signal) ->
        if code is 0 then console.log   "QEMU-Process: exit clean."
        else              console.error "QEMU-Process: exit with error: #{code}, signal: #{signal}"
        vmHandler.SHUTDOWN vmConf.name
    catch e
      console.error "process:start:e"
      console.dir    e
      vmHandler.SHUTDOWN vmConf.name
      vmHandler.stopQMP  vmConf.name

module.exports.Process = Process
