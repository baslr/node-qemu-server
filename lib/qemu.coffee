
Vm     = require('./src/vm').Vm


exports.Vm    = Vm
exports.Disk  = require './src/disk'


createVm = (cfg) ->
  vm = new Vm cfg
  return vm

exports.createVm    = createVm
