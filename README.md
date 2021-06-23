[portainer](https://github.com/portainer/portainer)

## build

`./build-app.sh`

## 运行

`docker run --restart=always -h iot-app-hub -d --name iot-app-hub -v "/var/run/docker.sock:/var/run/docker.sock" -v /Users/du/data/iot-app-hub:/data -v /Users/du/data/iot-app-hub/registry:/var/lib/registry -p 5500:5000 -p 23234:9000 iot-app-hub`

registries 添加 localhost:5500， 注意端口是暴露出来的。
