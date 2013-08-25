exec = require('child_process').exec

module.exports = (disk, cb) ->
  exec "cd disks && ls #{disk.name}.img", (err, stdout, stderr) =>
    if err? and stdout is ''
      exec "qemu-img create -f qcow2 disks/#{disk.name}.img #{disk.size}G", (err, stdout, stderr) =>    
        if err? or stderr isnt ''
          cb {status:'error', data:[err,stderr]}
        else
          cb {status:'success', data:disk}
    else
      cb {status:'error', data:['disk already existing']}