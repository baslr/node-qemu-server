
define (require, exports, module) ->

  ImageModel = require 'ImageModel'
  ko         = require 'ko'

  class ImageViewModel
    constructor: ->
      @images  = ko.observableArray()
  
    changePercentage: (disk, newPercent) ->
      for n,i in @images()
        if n.name is disk.name
          ncp = new ImageModel disk
          ncp.percentUsed = "#{newPercent}%"
          @images.replace n, ncp
          
    add: (image) ->
      console.dir image
      for n in @images()
        if n.name is image.name
          return
      @images.push new ImageModel image
      @images.sort (left, right) ->
        return left.name is right.name ? 0 : (left.name < right.name ? -1 : 1)
      
    remove: (disk) ->
      console.log "delete disk: #{disk.name}"
      app.socket.emit 'delete-disk', disk.name
    
    delete: (diskName) ->
      @images.remove (disk) -> return disk.name is diskName

  module.exports = ImageViewModel
  
  undefined
