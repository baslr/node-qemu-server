
Vm    = require('./src/vm').Vm
Image = require('./src/image').Image

exports.Vm    = Vm
exports.Image = Image


exports.createImage = (cnf, callback) ->
  img = new Image cnf
  img.create callback
  
exports.createVm = (cnf) ->
  return new Vm cnf.name