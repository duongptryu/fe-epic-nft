import React, {useState} from 'react';
import './styles/App.css';
import twitterLogo from './assets/logo.png';
import {ethers} from "ethers"
const myEpicNft = require("./utils/MyEpicNFT.json")

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xD6b23fDd1AD34399186ac3956d85b4892DE3eFc2"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("")
  
  const checkIfConnectToWallet = async () => {
    const { ethereum } = window
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    }else {
      console.log("We have the ethereum object, ", ethereum)
    }

    const accounts = await ethereum.request({method: "eth_accounts"})

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account)
      setCurrentAccount(account)
      setupEventListener()
    }else {
      console.log("No authorizaed account found")
    }
  }

  const connectWallet = async () => {
    try{
      const { ethereum } = window

      if (!ethereum) {
        alert("You must have metamask to connect wallet")
        return
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected ", accounts[0]);
      setCurrentAccount(accounts[0])
      setupEventListener()
    }catch(error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const mintNft = async () => {
    try{
      const {ethereum} = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        console.log("Going to pop wallet now to pay gas ...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining ... ")
        await nftTxn.wait()

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      }else {
        console.log("Ethereum object does not exist")
      }
    }catch(error) {
      console.log(error)
    }
  }


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={mintNft}>
      Mint NFT
    </button>
  );

  useState(() => {
    checkIfConnectToWallet()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {!currentAccount && renderNotConnectedContainer()}
          {currentAccount && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;