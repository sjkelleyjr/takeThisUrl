import { useEffect, useRef, useState } from "react";
import initWeb3 from "./utils/web3";
import { abi, contractAddress } from "./utils/url";
import "./App.css";

const { ethereum } = window;

function App() {
  const GANACHE_NETWORK_ID = '0x539';
  const urlContract = useRef(null);
  const [web3, setWeb3] = useState(null);
  const [doneCheckingForMetaMask, setDoneCheckingForMetaMask] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isGanacheChain, setIsGanacheChain] = useState(false);

  const [currentUrl, setCurrentUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [currentBidValue, setCurrentBidValue] = useState("");

  const [message, setMessage] = useState("");

  const [settingNewUrl, setSettingNewUrl] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initWeb3WithProvider() {
      if (web3 === null) {
        if (!cancelled) {
          setDoneCheckingForMetaMask(false);
          const web3Instance = await initWeb3();
          setWeb3(web3Instance);

          // Transactions done in this app must be done on the Rinkeby test network.
          // TODO: set this to mainnet after deploying the smart contract.
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          if (chainId === GANACHE_NETWORK_ID) {
            setIsGanacheChain(true);
          }

          setDoneCheckingForMetaMask(true);

          if (web3Instance !== null) {
            // Create Contract JS object.
            urlContract.current = new web3Instance.eth.Contract(abi, contractAddress);

            // Check to see if user is already connected.
            try {
              const accounts = await ethereum.request({ method: "eth_accounts" });
              if (accounts.length > 0 && ethereum.isConnected()) {
                setConnected(true);
              }
            } catch (error) {
              console.error(error);
            }

            // Implement `accountsChanged` event handler.
            ethereum.on("accountsChanged", handleAccountsChanged);
          }
        }
      }
    }

    initWeb3WithProvider();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (connected) {
      async function handler() {
        const url = await urlContract.current.methods.url().call();
        setCurrentUrl(url);
        if (!cancelled) {
          await updateMaxBidAndUrl();
        }
      }
      handler();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const getAccount = async (_event) => {
    setConnecting(true);
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {}
    setConnecting(false);
  };

  const handleAccountsChanged = (_accounts) => {
    window.location.reload();
  };

  /**
   * Define a function to update the current max bid and the url in the page view
   * without the user having to perform a manual page reload.
   */
  const updateMaxBidAndUrl = async () => {
    const maxBid = await urlContract.current.methods.maxBid().call();
    const url = await urlContract.current.methods.url().call();
    setMaxBid(web3.utils.fromWei(maxBid, 'ether'));
    setCurrentUrl(url);
  };

  const isValidHttpUrl = (string) => {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    
    if (!isValidHttpUrl(newUrl)) {
      showMessage('Invalid URL (hint: must start with http or https)');
      return;
    }

    setSettingNewUrl(true);
    const accounts = await web3.eth.getAccounts();
    showMessage("Waiting on transaction success...");
    try {
      await urlContract.current.methods.setThisUrl(newUrl).send({
        from: accounts[0],
        value: web3.utils.toWei(currentBidValue, 'ether')
      });
      showMessage('')
    } catch (e) {
      showMessage(`Error setting a new URL: "${e.message}"`);
    } finally {
      setSettingNewUrl(false);
      updateMaxBidAndUrl();
    }
  };

  const showMessage = async (msg) => {
    setMessage(msg);
  };

  return (
    <div className="App">
      {web3 === null && !doneCheckingForMetaMask && (
        <div className="page-center">
          <div className="alert info">
            <h1 className="no-margin-top">Own This URL</h1>
            <p className="no-margin">Checking for MetaMask Ethereum Provider...</p>
          </div>
        </div>
      )}

      {web3 === null && doneCheckingForMetaMask && (
        <div className="page-center">
          <div className="alert error">
            <h1 className="no-margin-top">Own This URL</h1>
            <p className="no-margin">
              MetaMask is required to run this app! Please install MetaMask and then refresh this
              page.
            </p>
          </div>
        </div>
      )}

      {web3 !== null && doneCheckingForMetaMask && !isGanacheChain && (
        <div className="page-center">
          <div className="alert error">
            <h1 className="no-margin-top">Own This URL</h1>
            <p className="no-margin">
              You must be connected to the <strong>Ganache test network</strong> for Ether
              transactions made via this app.
            </p>
          </div>
        </div>
      )}

      {web3 !== null && !connected && isGanacheChain && (
        <div className="page-center">
          <section className="card">
            <h1 className="no-margin-top">Own This URL</h1>
            <p>
              Want to set this URL? Connect with MetaMask and start bidding for this space right away!
            </p>
            <div className="center">
              <button
                className="btn primaryBtn"
                type="button"
                onClick={getAccount}
                disabled={connecting}
              >
                Connect with MetaMask
              </button>
            </div>
          </section>
        </div>
      )}

      {web3 !== null && connected && isGanacheChain && (
        <div className="page-center">
          <section className="card">
            <h1 className="no-margin-top">Own This URL</h1>
            <p style={{textAlign: "center"}}>
              The top bidder can set the URL to anything.
            </p>

            <div style={{textAlign: "center"}} >
              <a href={currentUrl}>
                {currentUrl}
              </a>
            </div>

            <p style={{textAlign: "center"}}>
              The top bid is currently {maxBid} ether.
            </p>
            <hr />

            <form onSubmit={onSubmit}>
              <h4>Set The URL</h4>
              <div>
                <label>URL:</label>
                <input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} />
                <label>Bid (ether):</label>
                <input value={currentBidValue} onChange={(event) => setCurrentBidValue(event.target.value)} />
                <button className="btn primaryBtn" type="submit" disabled={settingNewUrl}>
                  Enter
                </button>
              </div>
            </form>

            <h2>{message}</h2>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
