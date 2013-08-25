
$ = jQuery

defaults =
  progressBar : 'DIV#progressBar'
  parallel    : false
  post        : '/api/upload'
  callback    : ->

$.fn.extend
  uploader: (options) ->
    settings  = $.extend defaults, options
    filesList = []
    
    uploader = =>
      @.get(0).addEventListener 'drop', uploaderDrop, false
      
      @.get(0).addEventListener 'dragover', (e) ->
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        return false
      , false

    uploaderDrop = (e) ->
      e.stopPropagation()
      e.preventDefault()
      
      url = e.dataTransfer.getData 'url'
      
      if url
        "url ziehen lassen nicht verbaut :S"
      else
        files = e.dataTransfer.files
        postPath = if "function" is typeof settings.post then settings.post() else settings.post
        
        for file in files
          filesList.push file:file,post:postPath                                                    # push every file into array
          
          if settings.parallel                                                                      # if parallel upload something
            uploaderUpload()        

        if settings.parallel is false
          uploaderUpload()

    uploaderUpload = ->
      if filesList.length
        file = filesList.shift()
  
        console.log "upload: #{file.file.name}, #{filesList.length} left"
        
        xhr = new XMLHttpRequest()
        xhr.open 'POST', "#{file.post}/#{file.file.name}", true # isFile isDirectory
        
        xhr.upload.onprogress = (e) ->      
          percentPerByte = 100/e.total
          percentLoaded  = percentPerByte * e.loaded
          ($ "#{settings.progressBar} DIV.progress-bar").css 'width', "#{percentLoaded}%"
          
        xhr.onreadystatechange = ->
          if 4 is @readyState
            settings.callback {data:JSON.parse(@responseText), name:file.file.name}
            
            if false is settings.parallel
              ($ "#{settings.progressBar} DIV.progress-bar").css 'width', "0%"
              setTimeout uploaderUpload, 250
  
        xhr.setRequestHeader 'Content-Type', 'application/octet-stream'
        xhr.send file.file

    uploader()