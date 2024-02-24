import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [newOwner, setNewOwner] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [showOwnerAddress, setShowOwnerAddress] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const transferOwnership = async () => {
    if (atm) {
      let tx = await atm.transferOwnership(newOwner);
      await tx.wait();
      setNewOwner("");
    }
  };

  const showOwnerAddressHandler = async () => {
    if (atm) {
      const owner = await atm.owner();
      setOwnerAddress(owner);
      setShowOwnerAddress(true);
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
          <style jsx>
            {`
              button {
                background: white;
                border: none;
                color: #000;
                font-weight: bold;
                padding: 0.5rem 1rem;
              }
            `}
          </style>
        </button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div className="container">
        <div className="account-info">
          {account.map((address, index) => (
            <>
              {" "}
              <div key={index}>Connected Account: {address}</div>
              <hr />
            </>
          ))}
          <p>Your Balance: {balance}</p>
        </div>
        <div className="transaction-buttons">
          <button className="deposit-btn" onClick={deposit}>
            Deposit 1 ETH
          </button>

          <button className="withdraw-btn" onClick={withdraw}>
            Withdraw 1 ETH
          </button>
          <button className="owner-btn" onClick={showOwnerAddressHandler}>
            Show Owner Address
          </button>
          {showOwnerAddress && (
            <div className="owner-address">
              Current Owner Address: {ownerAddress}
            </div>
          )}
        </div>
        <div className="transfer-ownership">
          <label>New owner address</label>
          <input
            className="owner-input"
            placeholder="Enter new owner address"
            type="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <button className="transfer-btn" onClick={transferOwnership}>
            Transfer Ownership
          </button>
        </div>
        <style jsx>{`
          .container {
            text-align: left;
            margin: 50px auto;
            max-width: 400px;
          }

          .account-info {
            margin-bottom: 20px;
          }
          .transaction-buttons {
            margin-bottom: 20px;
          }

          .deposit-btn,
          .withdraw-btn {
            background-color: #4caf50;
            border: none;
            color: white;
            padding: 8px 16px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
          }

          .deposit-btn:hover,
          .withdraw-btn:hover {
            background-color: #45a049;
          }
          .owner-input {
            margin-bottom: 10px;
            padding: 8px;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
            outline: none;
          }
          .owner-btn {
            margin-top: 1rem;
            background: #4caf50;
            border: none;
            color: #fff;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: bold;
          }

          .owner-address {
            margin-top: 1rem;
          }

          .owner-input:focus {
            border-color: #4caf50;
          }

          .transfer-btn {
            background: #4caf50;
            border: none;
            color: #fff;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: bold;
          }

          .transfer-btn:hover {
            background: #45a049;
          }
        `}</style>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
            background-color: #018001;
            display: flex;
            align-items: center;
            font-family: "Open-sans", sans-serif;
            flex-direction: column;
            height: 100vh;
            box-sizing: border-box;
          }
        `}
      </style>
    </main>
  );
}
