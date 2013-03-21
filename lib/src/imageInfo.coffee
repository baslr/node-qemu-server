exec         = require('child_process').exec
exports.info = (name, callback) ->
  exec "qemu-img info images/#{name}.img", (err, stdout, stderr) =>    
    if err? or stderr isnt ''
      callback {status:'error', data:[err,stderr]}
    else
      b = {}
      for row in stdout.split('\n')
        if row is ''
          continue
        b[row.split(':')[0].replace(' ', '_')] = row.split(':')[1].replace ' ', ''

      b['name']         = name
      b['virtual_size'] = b['virtual_size'].split('(')[1].split(' ')[0]
      
      size   = b['disk_size'].split ''
      letter = size.pop()
      size   = size.join ''
      
      if      letter is 'K'
        size = size * 1024
      else if letter is 'M'  
        size = size * 1024 * 1024
      else if letter is 'G'
        size = size * 1024 * 1024 * 1024
      b['disk_size']   = size
      b['percentUsed'] = 100/b['virtual_size']*b['disk_size']

      callback status:'success', data:b