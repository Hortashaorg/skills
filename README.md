# Spacetime

## Create a new server

`spacetime init --lang rust server`

## Publish to docker container

`spacetime publish --project-path server quickstart -s http://spacetimedb:3000`

## Call a function

`spacetime call quickstart send_message "Hello, World!" -s http://spacetimedb:3000`

## Logs

`spacetime logs quickstart -s http://spacetimedb:3000`
