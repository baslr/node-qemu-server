
vmHandler    = require './lib/vmHandler'
webServer    = require './lib/webServer'
socketServer = require './lib/socketServer'

webServer.start()
socketServer.start webServer.getHttpServer()

vmHandler.loadExtensions()

vmHandler.loadFiles()
vmHandler.reconnectVms()
