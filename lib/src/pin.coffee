
os   = require 'os'
exec = require('child_process').exec

curPin  = 0
pinMask = for [1..os.cpus().length] then 0

module.exports = (pid, cpuCount) ->
  if os.platform() isnt 'linux'
    console.log "PIN: pinning is only supported with gnu/linux"
    return

  cpuList = ''
  for [1..cpuCount]
    for pin,i in pinMask
      if curPin is pin
        if cpuList.length
          cpuList    = "#{cpuList},#{i}"
        else cpuList = "#{i}"
        pinMask[i]++
        
        if i is pinMask.length-1
          curPin++
        break
  
  exec "taskset -c -p #{cpuList} #{pid}", {maxBuffer: 10*1024}, (e, stdout, stderr) ->
    if e? then console.dir e
    else console.log "taskset for pid #{pid} with cpulist #{cpuList} executed"
