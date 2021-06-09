import BCBC from '../abis/BCBC.json'
import NFBody from '../abis/NFBody.json'
import React, { Component } from 'react';
// import Identicon from 'identicon.js';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import ENSForm from './ENSForm';

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
      // hard coded the deployed to polygon new contract address
      const nfb = new web3.eth.Contract(NFBody.abi, '0x8Fc5AD4463688C5141e96919e81E7b3b01506D39')
      this.setState({ nfb })
      const bcbc = new web3.eth.Contract(BCBC.abi, '0x4C7fd038F14154B9a0C38BC4d53e567317DdB45a')
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
      window.alert('Proof-of-Workout is deployed on Polygon Mumbai, check your MetaMask settings.')
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

  uploadWorkout = (description, title) => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.bcbc.methods.uploadWorkout(result[0].hash, title, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
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

  validateWorkout(id) {
    this.setState({ loading: true })
    this.state.bcbc.methods.validateWorkout(id).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  killWorkout(id) {
    this.setState({ loading: true })
    this.state.bcbc.methods.killWorkout(id).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }


  // try to connect to chainlink vrf thingy
  getRandomNumber(seed, title) {
    this.setState({ loading: true })
    this.state.nfb.methods.getRandomNumber(seed, title).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  // randomResult() {
  //   this.state.nfb.methods.randomResult().call()
  // }

  setEns(ens){
    this.setState({ens: ens})
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      bcbc: null,
      nfb: null,
      workouts: [],
      loading: true,
      challengeWords: "",
      ens: null
    }

    this.uploadWorkout = this.uploadWorkout.bind(this)
    this.tipWorkoutCreator = this.tipWorkoutCreator.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.validateWorkout = this.validateWorkout.bind(this)
    this.killWorkout = this.killWorkout.bind(this)
    this.getRandomNumber = this.getRandomNumber.bind(this)
    this.setEns = this.setEns.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} accountEns={this.state.ens}/>
        <br></br>
        <br></br>
        <ENSForm setEns={this.setEns}/>
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              challengeWords={this.state.challengeWords}
              workouts={this.state.workouts}
              captureFile={this.captureFile}
              uploadWorkout={this.uploadWorkout}
              tipWorkoutCreator={this.tipWorkoutCreator}
              validateWorkout={this.validateWorkout}
              killWorkout={this.killWorkout}
              getRandomNumber={this.getRandomNumber}
            />
        }
        <br></br>
        <button
          onClick={async (event) => {
            console.log("clicked")
            console.log(await this.state.nfb.methods.randomResult().call())
          }}
        >
          console.log random number
        </button>
        https://github.com/tippi-fifestarr/proof-of-workout
      </div>
    );
  }
}

export default App;