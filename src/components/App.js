import BCBC from '../abis/BCBC.json'
import React, { Component } from 'react';
// import Identicon from 'identicon.js';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = BCBC.networks[networkId]
    if(networkData) {
      const bcbc = new web3.eth.Contract(BCBC.abi, networkData.address)
      this.setState({ bcbc })
      const workoutCount = await bcbc.methods.workoutCount().call()
      this.setState({ workoutCount })
      //load challenge Words!
      const challengeWords = await bcbc.methods.challengeWords().call()
      this.setState({ challengeWords })

      // Load Videos
      for (var i = 1; i <= workoutCount; i++) {
        const workout = await bcbc.methods.workouts(i).call()
        this.setState({
          workouts: [...this.state.workouts, workout]
        })
      }
      // Sort Workout. Show highest tipped Workout first
      this.setState({
        workouts: this.state.workouts.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('bcbc contract not deployed to detected network.')
    }
  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadWorkout = description => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.bcbc.methods.uploadWorkout(result[0].hash, "Title", description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  tipWorkoutCreator(id, tipAmount) {
    this.setState({ loading: true })
    this.state.bcbc.methods.tipWorkoutCreator(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      bcbc: null,
      workouts: [],
      loading: true,
      challengeWords: ""
    }

    this.uploadWorkout = this.uploadWorkout.bind(this)
    this.tipWorkoutCreator = this.tipWorkoutCreator.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              challengeWords={this.state.challengeWords}
              workouts={this.state.workouts}
              captureFile={this.captureFile}
              uploadWorkout={this.uploadWorkout}
              tipWorkoutCreator={this.tipWorkoutCreator}
            />
        }
      </div>
    );
  }
}

export default App;