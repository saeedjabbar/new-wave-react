import React, { useEffect, useState } from "react";
import { Button, Row, Col } from 'react-bootstrap';

import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [totalCount, setWaveCounter] = useState(0);
  const [miningMsg, setMiningMsg] = useState("Messages from the blockverse...")
  const [winningMsg, setWinningMsg] = useState("")



  const contractAddress = "0x753bd94E37B7838e674fD06155A86e97b190980b"
  const contractABI = abi.abi;


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  //form for user msg

  const initialFormData = Object.freeze({
    usermessage: ""
  })

  const [formData, updateFormData] = React.useState(initialFormData)

  const handleChange = (e) => {
    updateFormData({
      ...formData,
      [e.target.name]: e.target.value.trim()
    })
    console.log('formdata', formData)
    console.log('e.target.value', e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('event2', e)
    console.log('form data2',formData)
    // ... submit to API or something
    //call wave and pass in pessage
    wave(formData.usermessage)
  }



  const wave = async (usermessage) => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();

        /*
        * Execute the actual wave from your smart contract
        */
       //pass in usr msg here
        const waveTxn = await wavePortalContract.wave(usermessage, {
          gasLimit: 900000,
        })


        
        console.log("Mining...", waveTxn.hash);
        setMiningMsg("Mining...")

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setMiningMsg("Mined...")
        count = await wavePortalContract.getTotalWaves();
        getAllWaves()
        console.log("Retrieved total wave count...", count.toNumber());
        setWaveCounter(count.toNumber());
        waveCounter()
        setWinningMsg("You've won some fake eth.")
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const waveCounter = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaveCounter(count.toNumber());

      }

    } catch (error) {
      console.log(error)
    }
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves()

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = []
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          })
        })

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned)
        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message)

          setAllWaves((prevState) => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ])
        })
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    waveCounter();
    getAllWaves();
  }, [])

  return (
    <div className="mainContainer container">
      <div className="dataContainer">
        <div className="header">Welcome to the New Wave 🌊</div>

        <div className="bio">To play the game, say hi by waving 👋</div>
        <div className="mx-0 w-100">
          <div className="mb-3">
            <textarea
              name="usermessage"
              className="form-control"
              placeholder="Write Your Message to Post to the Blockchain..."
              rows="3"
              onChange={handleChange}
            ></textarea>
            <button
              onClick={handleSubmit}
              className="btn btn-primary purpleButton mt-3 w-100"
            >
              Wave at Saeed
              <span role="img" aria-label="wave">
                👋
              </span>
            </button>
            <div className="mt-5 fs-5">{winningMsg}</div>
          </div>
        </div>
        <Row className="bio">Total Waves: {totalCount}</Row>
        <Row className="bio">{miningMsg}</Row>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <div>
            <button
              className="waveButton w-100 btn btn-secondary"
              onClick={connectWallet}
            >
              Connect Wallet to Play the Game
            </button>
            <p className="mt-3 white fs-5">
              1) Download{" "}
              <a target="_blank" rel="noreferrer" href="https://metamask.io/">
                MetaMask Chrome/Brave Addon.
              </a>{" "}
              <br />
              2) Chose the Rinkeby Test Network
              <br />
              3) Click Connect :) <br />
              4) Donot use real ethereum or share your passphrase.
            </p>
          </div>
        )}

        <div className="row mt-2">
          {allWaves.reverse().map((wave, index) => {
            return (
              <div key={index} className="card shadow-sm mb-3 p-3 fs-6 msgBox">
                <div className="cardBody">
                  <div className="card-text">
                    <strong>Address:</strong> {wave.address}
                  </div>
                  <div className="card-text">
                    <strong>Time:</strong> {wave.timestamp.toString()}
                  </div>
                  <div className="card-text">
                    <strong>Message:</strong> {wave.message}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App