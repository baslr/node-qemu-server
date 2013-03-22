
Args  = require('./src/args').Args
Image = require('./src/image').Image
Vm    = require('./src/vm').Vm

exports.Args  = Args
exports.Image = Image
exports.Vm    = Vm

exports.createImage = (cnf, callback) ->
  img = new Image cnf
  img.create callback
  
exports.createVm = (cnf) ->
  return new Vm cnf.name