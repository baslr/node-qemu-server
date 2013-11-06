
define (require, exports, module) ->
  
  ko = require 'ko'
  
  class ImageModel
    constructor: (@image) ->
      @name        = image.name
      @percentUsed = image.percentUsed
      @format      = image.file_format
  
      @used = ko.computed ->
        return (@image.disk_size / 1024 / 1024 / 1024).toFixed 3
      , this
      
      @size = ko.computed ->
        return (@image.virtual_size / 1024 / 1024 / 1024).toFixed 3
      , this
      
      @left = ko.computed ->
        return ((@image.virtual_size - @image.disk_size) / 1024 / 1024 / 1024).toFixed 3
      , this
  
  module.exports = ImageModel
  
  undefined
