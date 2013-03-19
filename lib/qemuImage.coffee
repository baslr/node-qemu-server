
exec = require('child_process').exec

exports.create = (img, callback) ->
  exec "qemu-img create -f qcow2 #{img.name} #{img.size}G", (err, stdout, stderr) ->
    if err? or stderr isnt ''
      callback {status:'error', data:[err,stderr]}
    else
      callback status:'success'