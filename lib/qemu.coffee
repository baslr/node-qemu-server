
Vm     = require('./src/vm').Vm
Image  = require('./src/image').Image

exports.Vm    = Vm
exports.Image = Image

#
# @call   cfg, cb
#
# @return cb
createImage = (cfg, cb) ->
  img = new Image cfg
  img.create cb

#
# @call   vmCfg, cb
# 
# @return cb ret, new Vm Object
#
createVm = (cfg) ->
  vm = new Vm cfg
  return vm

exports.createVm    = createVm
exports.createImage = createImage
