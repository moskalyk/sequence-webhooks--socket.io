import React, { useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import { sequence } from '0xsequence'
import './App.css'

const ENDPOINT = "http://localhost:3000";  // Change this to your server's address

function App() {
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);

  const [socket, setSocket] = useState<any>(null);
  const [accountAddress, setAccountAddress] = useState<any>(null);
  const [driveOff, setDriveOff] = useState(false);

  sequence.initWallet({defaultNetwork: 'arbitrum'})

  const connect = async () => {
    const wallet = sequence.getWallet()
    const details = await wallet.connect({app: 'demo', authorize: true})
    if(details.connected){
      setStartTime(Date.now())
      setAccountAddress(details.session?.accountAddress)
      setSocket(socketIOClient(ENDPOINT, {
          query: {
            address: details.session?.accountAddress,
            token: details.proof?.proofString  // Replace with your actual token
          }
      }))

      // TODO: perform onchain transaction to be caught by webhook

    }
  }

  useEffect(() => {
    if(socket){
      socket.on(`message`, (data: any) => {
        console.log(data)
        setDriveOff(true)
        setEndTime(Date.now())
      });
    }
  }, [socket, accountAddress])

  return (
    <div className="App">
      <div className='center'>
        <p>
          <p>ttl of tx + webhook + socket: {Math.round(endTime - startTime) / 1000 + "s"}</p>
          <div className={`racecar-container ${driveOff ? 'drive-off' : ''}`}>
          <p>🏎️</p>
          </div>
          <button onClick={() => {connect()}}>connect</button>
        </p>
      </div>
    </div>
  );
}

export default App;