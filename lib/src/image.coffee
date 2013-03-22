fs        = require 'fs'
exec      = require('child_process').exec
imageInfo = require './imageInfo'

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
      
      exec "cd images && ls #{@name}.img", (err, stdout, stderr) =>
        if err? and stdout is ''
          exec "qemu-img create -f qcow2 images/#{@name}.img #{@size}G", (err, stdout, stderr) =>    
            if err? or stderr isnt ''
              callback {status:'error', data:[err,stderr]}
            else
              callback status:'success', image:this
        else
          callback {status:'error', data:['image already existing']}
        
  info: (cb) ->
    imageInfo.info @name, cb
        
  delete: (cb) ->
    fs.unlink "images/#{@name}.img", (err) ->
      if err?
        cb status:'error'
      else
        cb status:'success'

exports.Image = Image