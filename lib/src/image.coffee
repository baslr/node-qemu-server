
exec = require('child_process').exec

class Image
  constructor: (img, size) ->
    if      typeof img is 'object'    and typeof size is 'undefined'
      @name = img.name                
      @size = img.size                
    else if typeof img is 'string'    and typeof size is 'number'
      @name = img                     
      @size = size                    
    else if typeof img is 'string'    and typeof size is 'undefined'
      @name = img
    else if typeof img is 'undefined' and typeof size is 'undefined'
      @name = @size = ''

  create: (img, callback) ->
    if typeof img is 'object'
      @name = img.name
      @size = img.size

    if typeof img is 'function'
      callback = img

    exec "qemu-img create -f qcow2 images/#{@name}.img #{@size}G", (err, stdout, stderr) =>    
      if err? or stderr isnt ''
        callback {status:'error', data:[err,stderr]}
      else
        callback status:'success', image:this
        
  info: (callback) ->
    exec "qemu-img info images/#{@name}.img", (err, stdout, stderr) ->
      b = {}
      for row in stdout.split('\n')
        if row is ''
          continue
        b[row.split(':')[0].replace(' ', '_')] = row.split(':')[1]
    
      if err? or stderr isnt ''
        callback {status:'error', data:[err,stderr]}
      else
        callback status:'success', data:b

exports.Image = Image