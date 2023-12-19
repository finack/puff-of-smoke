@app
wiring-hello-worl-ecf7

@aws
runtime nodejs18.x
# concurrency 1
# memory 1152
# profile default
# region us-west-1
# timeout 30

@http
/*
  method any
  src server

@plugins
plugin-remix
  src plugin-remix.js

@static

@tables
user
  pk *String

password
  pk *String # userId

note
  pk *String  # userId
  sk **String # noteId

device
  pk *String  # userId
  sk **String # deviceId

connector
  pk *String  # userId
  sk **String # connectorId

wire
  pk *String  # userId
  sk **String # wireId