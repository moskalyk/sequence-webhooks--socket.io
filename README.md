# sequence-webhook--socket.io
a simplest (so far) example of using an express backend webhook, to trigger an event from a smart contract in the sequence stack relayed into a frontend that times the whole cycle: tx + webhook + socket.io

## how to run
open 4 terminals

### terminal 1: socket server
```
$ cd server
$ pnpm demo
```

### terminal 2: client
```
$ cd client
$ pnpm dev
```

### terminal 3: ngrok secure tunnel
```
$ npx ngrok http 3000
```

### terminal 4: webhook registry (tbc)
update line XX in [this](./go-webhooks/main.go) file with ngrok tunnel http://<endpoint>/send

```
$ cd go-webhooks
$ go run main.go
```