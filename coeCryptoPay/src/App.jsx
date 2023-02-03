import React, { useState } from "react"
import './App.css'
import { ReactComponent as CaretIcon } from "./assets/caret.svg";
import Web3 from "web3"
import { getEthPriceNow } from "get-eth-price"

const getWeb3 = async () => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        resolve(web3)
      } catch (error) {
        reject(error)
      }
    }
  })
}


function App() {
  const [open, setOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentAmount, setPaymentAmount] = useState()
  const [boughtAC, setBoughtAC] = useState(0)

  const handlePayment = async (method) => {
    let web3 = {}
    try {
      web3 = await getWeb3() // Attempts to get Web3 instance
    } catch (error) {
      console.log(error)
    }
    let accounts = await web3.eth.getAccounts()
    let ethPrice = await fetch("https://api.coincap.io/v2/assets")
      .then(response => response.json())
      .then(response => response.data)
      .then(data => data[1].priceUsd)
    let ethToTransfer = paymentAmount / ethPrice
    let weiToTransfer = await web3.utils.toWei(ethToTransfer.toFixed(6).toString())

    let txHash = await web3.eth.sendTransaction({
      from: accounts[0],
      to: "0x0C77526A828825D35Db9BFD06A23d91fbc3a5E8e",
      value: weiToTransfer
    }).then(res => res.transactionHash)
      .catch(error => console.log(error))

    let confirmedTransaction = await confirmTransaction(txHash, web3)
    if (confirmedTransaction) {
      setBoughtAC(paymentAmount)
    }
  }

  const confirmTransaction = async (txHash, web3) => {
    let chain = await web3.eth.getChainId()
    console.log(chain)
    let confirmed = await web3.eth.getTransactionReceipt(txHash)
      .then(res => res.status)
    return confirmed
  }

  return (
    <div className="App w-full h-full flex flex-col items-center">
      <div className='h-2/6 w-4/6 bg-stone-400 mt-20 grid grid-cols-4'>
        <div className=" col-span-1">
          <div className='h-1/6 w-5/6 bg-stone-700 mt-5 ml-5 flex flex-row pr-5 justify-center'>
            <a href="/#" onClick={() => setOpen(!open)}>
              <h3 className="text-2xl mt-1">Pay with crypto</h3>
            </a>
            <a href="/#" className="icon-button" onClick={() => setOpen(!open)}>
              <CaretIcon className="h-5/6 mt-1 animate-bounce" />
            </a>
          </div>
          <div className='h-1/6 w-5/6 mt-5 ml-5 flex flex-row pr-5'>
            {open && <>
              <div className="dropdown">
                <a href="/#" className="menu-item" onClick={() => handlePayment("USDT")}>
                  USDT
                </a>
                <a href="/#" className="menu-item" onClick={() => handlePayment("USDC")}>
                  USDC
                </a>
                <a href="/#" className="menu-item" onClick={() => handlePayment("ETH")}>
                  ETH
                </a>
              </div>
            </>}
          </div>
        </div>
        <div className=" col-span-3 grid grid-cols-3 grid-rows-2 pt-8 justify-items-center">
          <div className={`h-1/2 w-1/3 bg-stone-600 ${paymentAmount == 2.5 ? "bg-stone-900" : ""}`}><a onClick={() => setPaymentAmount(2.5)}>1000AC - $2.5</a></div>
          <div className={`h-1/2 w-1/3 bg-stone-600 ${paymentAmount == 5 ? "bg-stone-900" : ""}`}><a onClick={() => setPaymentAmount(5)}>2000AC - $5</a></div>
          <div className={`h-1/2 w-1/3 bg-stone-600 ${paymentAmount == 10 ? "bg-stone-900" : ""}`}><a onClick={() => setPaymentAmount(10)}>4400AC - $10</a></div>
          <div className={`h-1/2 w-1/3 bg-stone-600 ${paymentAmount == 20 ? "bg-stone-900" : ""}`}><a onClick={() => setPaymentAmount(20)}>9000AC - $20</a></div>
          <div className={`h-1/2 w-1/3 bg-stone-600 ${paymentAmount == 50 ? "bg-stone-900" : ""}`}><a onClick={() => setPaymentAmount(50)}>23200AC - $50</a></div>
          <div className={`h-1/2 w-1/3 bg-stone-600 ${paymentAmount == 100 ? "bg-stone-900" : ""}`}><a onClick={() => setPaymentAmount(100)}>50000AC - $100</a></div>
        </div>
      </div>
      <div className='h-2/6 w-4/6 mt-20 flex justify-center'>
        {boughtAC != 0 && <h1 className="text-6xl font-mono mt-20">Congrats! You just bought {boughtAC}$ worth of AC</h1>}
      </div>
    </div>
  )
}

export default App
