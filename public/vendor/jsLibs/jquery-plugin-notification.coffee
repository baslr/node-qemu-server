
$ = jQuery

$.notification = (options) ->
  settings = 
    type:'info'
    msg:'info'
    time:3
    fixed:false
  
  settings = $.extend settings, options  

  notifications = 'error':'alert-danger', 'info':'alert-info', 'success':'alert-success'
  div = ($ '<DIV/>').css( display:'none', 'z-index':1040).attr('data-dismiss':'alert', 'data-type':'notification').addClass 'alert fade in '+notifications[settings.type]

  div.attr 'id':new Date().getTime()
  
  if settings.fixed
    div.css position:'fixed', top:'0px', left:'0px', width:($ window).width() # position:absolute top:window.pageYOffset
#     ($ window).scroll ->
#       div.css top:window.pageYOffset+'px'

  div.append ($ '<A/>').addClass('close').text '×'
  div.append ($ '<CENTER/>').append ($ '<STRONG/>').text settings.msg
  
  if ($ 'BODY DIV[data-type="notification"]').length
    ($ 'BODY DIV[data-type="notification"]').remove()
    ($ 'BODY').prepend div
    div.slideDown(600)
    setTimeout ->
      div.slideUp ->
        div.remove()
    , settings.time*1000
  else
    ($ 'BODY').prepend div
    div.slideDown()
    setTimeout ->
      div.slideUp ->
        div.remove()
    , settings.time*1000