fs          = require 'fs'
imageInfo   = require './image/info'
imageCreate = require './image/create'

class Image
  constructor: (img = undefined, size = undefined) ->
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
  #
  # @call   imgCfg, cb
  # @call   cb
  #
  # @return cb ret, this
  #
  create: (img, cb) ->
    if typeof img is 'object'
      @name = img.name
      @size = img.size

    if typeof img is 'function'
      cb = img

    if @name is '' and @size is ''
      cb {status:'error', data:'no name and size set'}
    else
      imageCreate.create this, cb
  ###
  # @call   cb
  #
  # @return cb ret        
  ###
  info: (cb) ->
    imageInfo.info @name, cb
        
  delete: (cb) ->
    fs.unlink "images/#{@name}.img", (err) ->
      if err?
        cb {status:'error', data:err}
      else
        cb status:'success'

exports.Image = Image