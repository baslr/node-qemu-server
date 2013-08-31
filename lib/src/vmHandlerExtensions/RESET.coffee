
socketServer = require '../../socketServer'

module.exports = (vm) ->
  console.log "vmHandler Extension received RESET event"

  vm.setStatus 'running'
  socketServer.toAll 'set-vm-status', vm.name, 'running'
  socketServer.toAll 'msg', {type:'success', msg:"VM #{vm.name} reset."}
