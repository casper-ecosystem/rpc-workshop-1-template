

function sendSign() {
  Signer.sendConnectionRequest();
}


async function setHighscore() {
  const client = CasperServiceByJsonRPC;
    if (!client) {
      console.log("Error");
      throw new Error("Client not set");
    }

    const receiverClPubKey = CLPublicKey.fromHex(
      "01cbef0b626684ec9b016868332a29267c30ca75db4c1ace2f4db8ee1d0376eb94"
    );
    const senderKey = CLPublicKey.fromHex(activeKey);
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(senderKey, "casper-test", 1, 1800000),
      DeployUtil.ExecutableDeployItem.newTransfer(
        amount,
        receiverClPubKey,
        null,
        randomNumericId()
      ),
      DeployUtil.standardPayment(DEPLOY_GAS_PAYMENT_FOR_NATIVE_TRANSFER)
    );

    const deployJSON = DeployUtil.deployToJson(deploy);

    const targetPubKey = deploy.session.transfer ? (deploy.session.transfer?.args.args.get("target")).toHex() : activeKey;

    const signedDeployJSON = await Signer.sign(deployJSON, activeKey, targetPubKey);

    const reconstructedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();

    const { deploy_hash: deployHash } = await client.deploy(reconstructedDeploy);

    setDeployHash(deployHash);
}

function buttonPressed() {
  if (Signer.isConnected()) {
    setHighscore();
  } else {
    sendSign();
  }
}

/* EVENT LISTENERS */
/* FIRE WHEN SIGNER STATE CHANGES */

window.addEventListener("signer:locked", (msg) => {
  setActiveKeyLabel("Not Connected");
  setActiveKey("");
});
window.addEventListener("signer:unlocked", (msg) => {
  if (msg.detail.isConnected) {
    setActiveKeyLabel(msg.detail.activeKey);
    setActiveKey(msg.detail.activeKey);
  }
});
window.addEventListener("signer:activeKeyChanged", (msg) => {
  if (msg.detail.isConnected) {
    setActiveKeyLabel(msg.detail.activeKey);
    setActiveKey(msg.detail.activeKey);
  }
});
window.addEventListener("signer:connected", (msg) => {
  setActiveKeyLabel(msg.detail.activeKey);
  setActiveKey(msg.detail.activeKey);
});
window.addEventListener("signer:disconnected", (msg) => {
  setActiveKeyLabel("Not Connected");
  setActiveKey("");
});


function setActiveKeyLabel(address) {
  document.getElementById("connected-account").textContent = "Connected Account: " + address;
}
