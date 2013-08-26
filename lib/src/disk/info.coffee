exec = require('child_process').exec

module.exports = (name, cb) ->
  exec "qemu-img info --output=json #{process.cwd()}/disks/#{name}.img", (err, stdout, stderr) =>    
    if err? or stderr isnt ''
      cb {status:'error', data:[err,stderr]}
      return
      
    info = JSON.parse stdout.split('\n').join ''
    
    for i,n of info
      if 0 < i.search /\-/
        info[i.replace '-', '_'] = n
        delete info[i]
    
    info['disk_size'] = info['actual_size']

#    b['cluster_size'] = Number b['cluster_size']
    info['name']         = name
#    b['virtual_size'] = Number b['virtual_size'].split('(')[1].split(' ')[0]
    
#    size   = Number b['disk_size'].slice 0, -1
#    letter = b['disk_size'].slice -1
    
#     if      letter is 'K'
#       size = size * 1024
#     else if letter is 'M'  
#       size = size * 1024 * 1024
#     else if letter is 'G'
#       size = size * 1024 * 1024 * 1024
#     b['disk_size']   = size
    info['percentUsed'] = 100/info['virtual_size']*info['disk_size']
    
    console.dir info

    cb status:'success', data:info
