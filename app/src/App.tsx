import React, { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import CyberWorld from './contracts/Lock.sol/CyberWorld.json'
import Card from './components/Card';


const App = () => {

  const contractAddress: string = "0x357C6E95aDd32F1e0dc0985D2c310e728735acaf"

  const [ownedNfts, setOwnedNfts]: any[] = useState([])

  const [notificationMessage, setNotificationMessage]: any[] = useState("")

  let timer: any;


  const initContract = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    const tokenContract = new ethers.Contract(contractAddress, CyberWorld.abi, signer)
    return tokenContract
  }

  const createCharacter = async (classId: number, event: any) => {
    const tokenContract = await initContract()
    const priceInEht = ethers.utils.parseUnits("0.001", "ether")
    event.target.classList.toggle('is-loading')
    try {
      const transaction = await tokenContract.createNewCharacter(classId, { value: priceInEht })

      await transaction.wait()
      await getNftLinks()
    } catch (e) {
      console.log(e)
    }
    event.target.classList.toggle('is-loading')
  }

  const getNftLinks = async () => {
    const tokenContract = await initContract()
    const links = []
    const provider = await new ethers.providers.Web3Provider(window.ethereum)
    const tokenIds = await tokenContract.walletOfOwner(await provider.getSigner().getAddress())
    for (const tokenId of tokenIds) {
      let url = await tokenContract.tokenURI(tokenId)
      url = url.replace("ipfs://", "https://ipfs.io/ipfs/")
      let result = await (await fetch(url)).json()
      result.image = result.image.replace("ipfs://", "https://ipfs.io/ipfs/")
      result.tokenId = tokenId
      links.push(result)
    }
    console.log(links)
    setOwnedNfts(links)
  }

  const upgradeCharacter = async (tokenId: any) => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    const tokenContract = new ethers.Contract(contractAddress, CyberWorld.abi, signer)
    const priceInEht = ethers.utils.parseUnits("0.0005", "ether")
    const transaction = await tokenContract.upgradeCharacter(tokenId, { value: priceInEht })
    console.log("Starting transaction")
    await transaction.wait()
    console.log("Transaction finished")
    await getNftLinks()
  }

  const determineClass = (classId: number) => {
    switch (classId) {
      case 0:
        return "Cop"

      case 1:
        return "Psycho"

      case 2:
        return "Nomad"
    }
  }

  useEffect(() => {
    const getLinks = async () => {
      const tokenContract = await initContract()
      tokenContract.on("CharacterCreated", (owner, classId) => {
        setNotificationMessage("User " + owner + " has just minted " + determineClass(classId) + "!")
        clearTimeout(timer)
        timer = setTimeout(() => {
          setNotificationMessage("")
        }, 5000)
        console.log(owner, classId)
      })
      tokenContract.on("CharacterUpgraded", (owner, classId) => {
        setNotificationMessage("User " + owner + " has just upgraded " + determineClass(classId) + "!")
        clearTimeout(timer)
        timer = setTimeout(() => {
          setNotificationMessage("")
        }, 5000)
        console.log(owner, classId)
      })
      await getNftLinks()
    }
    getLinks()
  }, [])

  return (
    <div className="container is-fluid pt-5">
      {notificationMessage.length > 0 ?
        <div className="notification is-success">
          {notificationMessage}
        </div>
        : <></>
      }

      <div className="level">
        <div className='level-item'>
          <button onClick={(event) => createCharacter(0, event)} className="button is-primary">Create Cop</button>
        </div>
        <div className='level-item'>
          <button onClick={(event) => createCharacter(1, event)} className="button is-info">Create Psycho</button>
        </div>
        <div className='level-item'>
          <button onClick={(event) => createCharacter(2, event)} className="button is-warning">Create Nomad</button>
        </div>
      </div>
      <div className='columns is-multiline'>
        {
          ownedNfts.map((element: any) => (
            <div className='column is-one-quarter' key={element.tokenId}>
              <Card imgUrl={element.image} description={element.description} name={element.name} level={element.attributes[0].value} tokenId={element.tokenId} upgradeFunction={upgradeCharacter}></Card>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
