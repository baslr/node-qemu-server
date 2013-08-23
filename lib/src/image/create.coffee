exec = require('child_process').exec

create = (image, cb) ->
  exec "cd images && ls #{image.name}.img", (err, stdout, stderr) =>
    if err? and stdout is ''
      exec "qemu-img create -f qcow2 images/#{image.name}.img #{image.size}G", (err, stdout, stderr) =>    
        if err? or stderr isnt ''
          cb {status:'error', data:[err,stderr]}
        else
          cb {status:'success', data:image}
    else
      cb {status:'error', data:['image already existing']}

exports.create = create