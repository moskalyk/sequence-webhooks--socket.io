import * as ethers from 'ethers'
import { ValidateSequenceWalletProof } from '@0xsequence/auth'
import { commons, v2 } from '@0xsequence/core'
import { ETHAuth } from '@0xsequence/ethauth'
import { trackers } from '@0xsequence/sessions'

import express from 'express';
import { createServer } from 'http';
import { Server as socketIoServer } from 'socket.io';
import cors from 'cors';

const app = express();

const httpServer = createServer(app);
const io = new socketIoServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

const loggedIn: any = {}
const rpcUrl = 'https://nodes.sequence.app/arbitrum'
const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

// create an EIP-6492-aware ETHAuth proof validator
const validator = ValidateSequenceWalletProof(
  () => new commons.reader.OnChainReader(provider),
  new trackers.remote.RemoteConfigTracker('https://sessions.sequence.app'),
  v2.DeployedWalletContext
)

const ethauth = new ETHAuth(validator)

io.use(async (socket, next) => {
    const token = socket.handshake.query.token as string
    const address = socket.handshake.query.address as string;
    await ethauth.configJsonRpcProvider(rpcUrl)
    try {
        const proof = await ethauth.decodeProof(token)
        loggedIn[socket.id] = {address: address, socket: null }
        console.log(`proof for address ${proof.address} is valid`)
        next()
      } catch (err) {
        console.log(`invalid proof -- do not trust address: ${err}`)
        next(new Error('Authentication error'))
      }
})

app.get('/send/:address', (req: any, res: any) => {
    const ids = Object.keys(loggedIn)
    let socketFound = false;
    console.log(loggedIn)
    for(let i = 0; i < ids.length; i++){
        if(loggedIn[ids[i]].address == req.params.address && loggedIn[ids[i]].socket){
            loggedIn[ids[i]].socket.emit(`message`, 'This is the message from the /send route.')
            socketFound = true;
            res.send('Message emitted!')
        } 
    }
    if(!socketFound) res.send(400)
})

io.on('connection', (socket: any) => {
    if(loggedIn[socket.id]) {
        loggedIn[socket.id] = {address: loggedIn[socket.id].address, socket: socket }
        socket.on('disconnect', () => {
            console.log('Client disconnected');
            delete loggedIn[socket.id]
        })
    }
})

httpServer.listen(3000, () => {
    console.log('Listening on port 3000');
})