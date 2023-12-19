@app
puff-of-smoke-9151

@aws
runtime nodejs18.x
# concurrency 1
# memory 1152
# profile default
region us-west-1
# timeout 30

@http
/*
  method any
  src server

@plugins
plugin-remix
  src plugin-remix.js
architect/plugin-budget-watch

@budget
limit "$10"
email "peter@finack.com"

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
  pk *String  # deviceId 
  sk **String # connectorId
