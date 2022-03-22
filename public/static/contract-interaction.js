

const client = new CasperClient("http://3.208.91.63:7777/rpc");
const contract = new Contracts.Contract(client);
var activeKey = null;
var button = document.getElementById("button");
var getDeployInterval = null;

if (Signer.isConnected()) {
  button.textContent = "Publish";
}

function sendSign() {
  Signer.sendConnectionRequest();
}

async function createDeploy() {
  if (activeKey == null) {
    alert("Please unlock the signer to continue");
    return;
  }

  const args = RuntimeArgs.fromMap({ 'score': CLValueBuilder.u512(score) });
  const pubkey = CLPublicKey.fromHex(activeKey);
  contract.setContractHash("hash-75143aa704675b7dead20ac2ee06c1c3eccff4ffcf1eb9aebb8cce7c35648041");
  const result = contract.callEntrypoint("add_highscore", args, pubkey, "casper-test", csprToMotes(1).toString(), [], 10000000);
  const deployJSON = DeployUtil.deployToJson(result);
  Signer.sign(deployJSON, activeKey).then((success) => {
    sendDeploy(success);
  }).catch((error) => {
    console.log(error);
  });
}

function sendDeploy(signedDeployJSON) {
  axios.post("/sendDeploy", signedDeployJSON, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    const hash = response.data;
    updateStatus("Deployed. <a href='https://testnet.cspr.live/deploy/" + hash + "'>View on cspr.live</a>");
    initiateGetDeployProcedure(hash);
  }).catch((error) => {
    alert(error);
  });
}

function initiateGetDeployProcedure(hash) {
  animateStatusByAppending("Waiting for execution");
  getDeploy(hash);
  getDeployInterval = setInterval(() => {
    getDeploy(hash);
  }, 5000);
}

async function getDeploy(deployHash) {
  axios.get("/getDeploy", {
    params: {
      hash: deployHash,
    }
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    //response.data[0] == execution_results
    if (response.data.length == 0) { //See if there's return data yet
      console.log("No Return data yet");
      console.log(response.data);
      return;
    }

    const executionResults = response.data[0]; //get execution_results from server.js
    console.log(executionResults);

    if (!executionResults.hasOwnProperty("result")) { //If executionResults doesn't contain the result key the deployment hasn't been executed by the node
      console.log("Doesnt have result yet");
      return;
    }

    const result = executionResults.result; //Get the result

    if (result.hasOwnProperty("Success")) {
      console.log("Success!");
      stopAnimation("Deployment Successful", "#2A9944");
      console.log("Execution Successful")
    } else if (result.hasOwnProperty("Failure")) {
      stopAnimation("Deployment Failure: " + result.Failure.error_message, "#F50102");
      console.log("Execution Failure");
    } else {
      stopAnimation("Unknown Error, result not containing Success or Failure", "#F50102");
      console.log("Unknown Error");
    }
    clearInterval(getDeployInterval);

  }).catch((error) => {
    alert(error);
    stopAnimation("Error deploying", "#CF000F");
    clearInterval(getDeployInterval);
  });
}

async function buttonPressed() {
  const isConnected = await Signer.isConnected();
  if (isConnected) {
    if (activeKey == null) {
      try {
        activeKey = await Signer.getActivePublicKey();
      } catch (error) {
        alert(error);
      }
      setActiveKeyLabel(activeKey);
      button.textContent = "Publish";
    } else {
      createDeploy();
    }

  } else {
    sendSign();
  }
}

/* EVENT LISTENERS */
/* FIRE WHEN SIGNER STATE CHANGES */

window.addEventListener("signer:locked", (msg) => {
  setActiveKeyLabel("Not Connected");
  activeKey = null;
});
window.addEventListener("signer:unlocked", (msg) => {
  if (msg.detail.isConnected) {
    setActiveKeyLabel(msg.detail.activeKey);
    activeKey = msg.detail.activeKey;
    button.textContent = "Publish";
  }
});
window.addEventListener("signer:activeKeyChanged", (msg) => {
  if (msg.detail.isConnected) {
    setActiveKeyLabel(msg.detail.activeKey);
    activeKey = msg.detail.activeKey;
  }
});
window.addEventListener("signer:connected", (msg) => {
  setActiveKeyLabel(msg.detail.activeKey);
  activeKey = msg.detail.activeKey;
  button.textContent = "Publish";
});
window.addEventListener("signer:disconnected", (msg) => {
  setActiveKeyLabel("Not Connected");
  activeKey = null;
  button.textContent = "Connect";
});


function setActiveKeyLabel(address) {
  document.getElementById("connected-account").textContent = "Connected Account: " + address;
}

function csprToMotes(cspr) {
  return cspr * 10**9;
}
