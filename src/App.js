import React, { useEffect, useState } from "react";
import { Button, Row, Col } from 'react-bootstrap';

import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [totalCount, setWaveCounter] = useState(0);


  const contractAddress = "0xF848D08e296A23B81FCd347d979f1a1C88F73FA9";
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
    console.log("form data2", formData.usermessage)
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


        /*
        * Execute the actual wave from your smart contract
        */
       //pass in usr msg here
        const waveTxn = await wavePortalContract.wave(usermessage)


        
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWaveCounter(count.toNumber());
        waveCounter()
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
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
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
              Wave at Me
              <span role="img" aria-label="wave">
                👋
              </span>
            </button>
          </div>
        </div>
        <Row className="bio">Total Waves: {totalCount}</Row>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button
            className="waveButton btn btn-secondary"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
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