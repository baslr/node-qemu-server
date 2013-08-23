
vmHandler    = require './lib/vmHandler'
webServer    = require './lib/webServer'
socketServer = require './lib/socketServer'

webServer.start()
socketServer.start webServer.getHttpServer()


vmHandler.readIsos()
vmHandler.readDisks()

vmHandler.readVmCfgs()

