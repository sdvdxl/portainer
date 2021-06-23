#!/bin/bash
set -e
cd api/cmd/portainer
GOOS=linux GOARCH=amd64 go build
cd -
echo $PWD
cp api/cmd/portainer/portainer build/
docker build . -t iot-app-hub
