import React, { useEffect, useState } from "react";
import "./styles/App.css";
import "./styles/constants.css";
import { Web3ReactProvider } from "@web3-react/core";
import AddressInput from "./components/AddressInput";
import ConnectWallet from "./components/ConnectWallet";
import BalanceDetails from "./components/BalanceDetails";

import Footer from "./components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchDollar } from "@fortawesome/free-solid-svg-icons";
import Web3 from "web3";
import {
  masterChefPresets,
  PANCAKE_ROUTER,
  routerPresets,
} from "./utils/constants";

function getLibrary(provider: any, connector?: any) {
  return new Web3(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

const wa: any = window;

function App() {
  const [contractAddress, setContractAddress] = useState("");
  const [masterChefLabel, setMasterChefLabel] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [routercontractAddress, setRouterContractAddress] = useState(
    PANCAKE_ROUTER
  );
  const [address, setAddress] = useState<string>(
    wa.web3 ? "" : localStorage.getItem("address") || ""
  );
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    setShowDetails(contractAddress !== "" && routercontractAddress !== "");
    loadPortfolio();

    return () => {
      setShowDetails(false);
    };
  }, [routercontractAddress, contractAddress, showDetails]);

  function updateWalletAddress(_address: string) {
    setAddress(_address);
    localStorage.setItem("address", _address);
  }

  function loadPortfolio() {
    let portfolio = [];
    let portfolioString = localStorage.getItem("portfolio");
    if (
      portfolioString != "" &&
      portfolioString != undefined &&
      portfolioString != null
    ) {
      portfolio = JSON.parse(portfolioString);
    }
    setPortfolio(portfolio);
  }

  function removeFromPortfolio(
    address: string,
    contractAddress: string,
    masterChefLabel: string
  ) {
    let portfolio = [];
    let portfolioString = localStorage.getItem("portfolio");
    if (
      portfolioString != "" &&
      portfolioString != undefined &&
      portfolioString != null
    ) {
      portfolio = JSON.parse(portfolioString);
    }

    let newPortfolio = [];
    for (let item of portfolio) {
      if (
        item.address == address &&
        item.contractAddress == contractAddress &&
        item.masterChefLabel == masterChefLabel
      ) {
        // found item to delete
      } else {
        newPortfolio.push(item);
      }
    }

    localStorage.setItem("portfolio", JSON.stringify(newPortfolio));
  }

  function saveToPortfolio(
    address: string,
    contractAddress: string,
    masterChefLabel: string
  ) {
    let portfolio = [];
    let portfolioString = localStorage.getItem("portfolio");
    if (
      portfolioString != "" &&
      portfolioString != undefined &&
      portfolioString != null
    ) {
      portfolio = JSON.parse(portfolioString);
    }

    portfolio.push({
      address: address,
      contractAddress: contractAddress,
      masterChefLabel: masterChefLabel,
    });

    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }

  let balances = [];

  for (let item of portfolio) {
    let itemAny = item as any;
    balances.push(
      <BalanceDetails
        address={itemAny.address}
        contractAddress={itemAny.contractAddress}
        routerContractAddress={routercontractAddress}
        label={itemAny.masterChefLabel}
        remove={() =>
          removeFromPortfolio(
            itemAny.address,
            itemAny.contractAddress,
            itemAny.masterChefLabel
          )
        }
      />
    );
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="app-container">
        <div className="app-content-container">
          <div className="app-header">
            <div className="app-header-left">
              <FontAwesomeIcon icon={faSearchDollar} className="app-icon" />
              <h1>How much is my LP worth?</h1>
            </div>
            {wa.web3 && (
              <ConnectWallet callback={setAddress}>Connect</ConnectWallet>
            )}
          </div>
          {address || !wa.web3 ? (
            <>
              <AddressInput
                placeholder="Enter your address"
                label="Your address"
                defaultValue={address}
                callback={updateWalletAddress}
              />

              <AddressInput
                placeholder="Enter Masterchef address"
                label="MasterChef address"
                presets={masterChefPresets}
                callback={setContractAddress}
              />

              <div className="address-input-header">
                <label className="address-input-label">MasterChef Label"</label>
              </div>
              <div className="address-input-container">
                <input
                  className={"address-input"}
                  value={masterChefLabel}
                  placeholder={"Label"}
                  onChange={(e) => {
                    setMasterChefLabel(e.target.value);
                  }}
                />
              </div>

              <button
                disabled={
                  address == "" ||
                  contractAddress == "" ||
                  masterChefLabel == ""
                    ? true
                    : false
                }
                onClick={() =>
                  saveToPortfolio(address, contractAddress, masterChefLabel)
                }
              >
                Save To Portfolio
              </button>
              <div className="app-details-section">
                {showDetails ? (
                  <>
                    <BalanceDetails
                      address={address}
                      contractAddress={contractAddress}
                      routerContractAddress={routercontractAddress}
                      label="Current:"
                    />
                  </>
                ) : (
                  <p>Fill contract addresses above to see details here.</p>
                )}
                <h1> TOTALS FOR PORTFOLIO </h1>
                {balances}
              </div>
            </>
          ) : (
            <p className="app-connect-wallet-first">
              Connect wallet to use the app.
            </p>
          )}
          <Footer showDonate={address !== ""} />
        </div>
      </div>
    </Web3ReactProvider>
  );
}

export default App;
