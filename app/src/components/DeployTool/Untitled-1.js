import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { SigningStargateClient, MsgSend, MsgDelegate, makeSignDoc, AminoTypes } from "@cosmjs/stargate";
import { SigningCosmosClient } from "@cosmjs/launchpad";
import { DirectSecp256k1HdWallet, Registry, Writer, Coin, Tx } from "@cosmjs/proto-signing";
import { AminoMsgSend, AminoMsgDelegate } from "@cosmjs/amino";
import { Any } from "@cosmjs/stargate/build/codec/google/protobuf/any";
import protobuf from "protobufjs/minimal";
import { MsgCloseDeployment, MsgRevokeCertificate, MsgCreateCertificate } from "./ProtoAkashTypes";

import rsa from 'js-x509-utils';


// import * as protoDeployment from '../../proto/gen/akash/deployment/v1beta1/deployment_pb';
// console.log(protoDeployment);
// var MsgCloseDeployment = new protoDeployment.MsgCloseDeployment();
// MsgCloseDeployment.create = function (obj) {
//     return { ...obj };
// }
// MsgCloseDeployment.encode = function (obj, writer) {
//     debugger;
//     return protoDeployment.MsgCloseDeployment.serializeBinaryToWriter(new protoDeployment.MsgCloseDeployment(obj), writer);
// }
// console.log(MsgCloseDeployment);
//import { SigningCosmWasmClient } from "secretjs";

// const baseCustomMsgDelegate = {
//     id: {
//         owner: "",
//         dseq: ""
//     }
// };
// const CustomMsgDelegate = {
//     // Adapted from autogenerated MsgDelegate implementation
//     encode(
//         message,
//         writer = protobuf.Writer.create(),
//     ) {
//         console.log("test");
//         console.log(message);
//         writer.string(JSON.stringify(message));
//         //writer.string(message.id.dseq);
//         //   writer.uint32(10).string(message.customDelegatorAddress ?? "");
//         //   writer.uint32(18).string(message.customValidatorAddress ?? "");
//         //   if (message.customAmount !== undefined && message.customAmount !== undefined) {
//         //     Coin.encode(message.customAmount, writer.uint32(26).fork()).ldelim();
//         //   }
//         return writer;
//     },

//     decode() {
//         throw new Error("decode method should not be required");
//     },

//     fromJSON() {
//         throw new Error("fromJSON method should not be required");
//     },

//     fromPartial(object) {
//         const message = { ...baseCustomMsgDelegate };
//         if (object.id.owner !== undefined && object.id.owner !== null) {
//             message.id.owner = object.id.owner;
//         } else {
//             message.id.owner = "";
//         }
//         if (object.id.dseq !== undefined && object.id.dseq !== null) {
//             message.id.dseq = object.id.dseq;
//         } else {
//             message.id.dseq = "";
//         }
//         return message;
//     },

//     toJSON() {
//         throw new Error("toJSON method should not be required");
//     },
// };
// const customAminoTypes = new AminoTypes({
//     additions: {
//         "/akash.deployment.v1beta1.MsgCloseDeployment": {
//             aminoType: "/akash.deployment.v1beta1.MsgCloseDeployment",
//             toAmino: (msg) => {
//                 return {
//                     id: {
//                         owner: msg.id.owner,
//                         dseq: msg.id.dseq
//                     }
//                 };
//             },
//             fromAmino: (msg) => ({
//                 id: {
//                     owner: msg.id.owner,
//                     dseq: msg.id.dseq
//                 }
//             }),
//         },
//     },
// });

const fee = {
    gas: "120000",
    amount: [{
        "denom": "akt",
        "amount": "0.0012"
    }]
}

async function getKeplr() {
    if (window.keplr) {
        return window.keplr;
    }

    if (document.readyState === "complete") {
        return window.keplr;
    }

    return new Promise((resolve) => {
        const documentStateChange = (event) => {
            if (
                event.target &&
                (event.target).readyState === "complete"
            ) {
                resolve(window.keplr);
                document.removeEventListener("readystatechange", documentStateChange);
            }
        };

        document.addEventListener("readystatechange", documentStateChange);
    });
}

const chainId = "akashnet-2";

export function DeployTool() {

    const [selectedWallet, setSelectedWallet] = useState(null);
    const [deployments, setDeployments] = useState([]);
    const [validCertificates, setValidCertificates] = useState([]);

    useEffect(async () => {
        const keplr = await getKeplr();
        await keplr.enable(chainId);

        const offlineSigner = window.getOfflineSigner(chainId);

        const key = await keplr.getKey(chainId);
        const accounts = await offlineSigner.getAccounts();
        console.log(accounts);

        setSelectedWallet(key);

        // const signed = await keplr.signDirect(key.bech32Address, offlineSigner, {
        //     bodyBytes: [0,1,3],
        //     chainId: chainId
        // });

        //     const amount = 1000;
        // const result = await cosmJS.sendTokens("cosmos1slzxpc23f62ezmmvhkrululttn6lpsq506e2uc", [{
        //     denom: "uakt",
        //     amount: amount.toString(),
        // }]);

        const txData = [
            {
                "id": {
                    "owner": "akash1ngz3pe5dat3xkv306r23kt7y8kns3sfxxtrzlm",
                    "dseq": "564141"
                }
            }
        ];

        //makeSignDoc([closeDeploymentJson], fee, chainId, "Test Akashlytics");


        // const registry = new Registry();
        // const client  = new SigningStargateClient(
        //     "http://public-rpc2.akash.vitwit.com",
        //     offlineSigner,
        //     { registry: registry }
        // );

        // const res = await client.queryClient.bank.allBalances(key.bech32Address);

        // console.log(client);

        const response = await fetch("/api/getDeploymentsByAddress/" + accounts[0].address);
        const deployments = await response.json();
        setDeployments(deployments);

        loadValidCertificates(accounts[0].address);
    }, []);

    async function loadValidCertificates(owner) {

        const apiEndpoint = "http://localhost:1317/http://135.181.60.250:1317";

        const response = await fetch(apiEndpoint + "/akash/cert/v1beta1/certificates/list?filter.state=valid&filter.owner=" + owner);
        const data = await response.json();

        setValidCertificates(data.certificates);
    }

    async function closeDeployment(deployment) {
        const keplr = await getKeplr();

        const offlineSigner = window.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();

        const endpoint = "http://localhost:1317/http://rpc.akash.forbole.com";

        const customRegistry = new Registry();
        //registry.register("/custom.MsgCustom", MsgSend);
        //customRegistry.register("/akash.deployment.v1beta1.MsgCloseDeployment", CustomMsgDelegate);
        debugger;
        //customRegistry.register("/akash.deployment.v1beta1.MsgCloseDeployment", MsgCloseDeployment);



        //customRegistry.register("MsgCloseDeploymentId", MsgCloseDeploymentId);
        customRegistry.register("/akash.deployment.v1beta1.MsgCloseDeployment", MsgCloseDeployment);


        const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
            registry: customRegistry,
            //aminoTypes: customAminoTypes
        });
        //client.registry.register("deployment/close-deployment", MsgDelegate);

        //const txResult = await client.sendTokens(selectedWallet.bech32Address, "akash1slzxpc23f62ezmmvhkrululttn6lpsq5zp5d9z", [{ amount: "100000", denom: "uakt" }], "Test Akashlytics Send");

        const closeDeploymentJson = {
            "typeUrl": "/akash.deployment.v1beta1.MsgCloseDeployment",
            "value": {
                "id": {
                    "owner": selectedWallet.bech32Address,
                    "dseq": deployment.dseq
                }
            }
        };
        //MsgDelegate.create()

        const fee = {
            gas: "120000",
            amount: [{
                "denom": "akt",
                "amount": "0.0012"
            }]
        }

        //const tmClient = await Tendermint34Client.connect("http://rpc.akash.forbole.com:80");
        //await client.signAmino(selectedWallet.bech32Address, )

        await client.signAndBroadcast(selectedWallet.bech32Address, [closeDeploymentJson], fee, "Test Akashlytics");
        // await client.signAndBroadcast(selectedWallet.bech32Address, [{
        //     typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        //     value: {
        //         fromAddress: "akash1slzxpc23f62ezmmvhkrululttn6lpsq5zp5d9z",
        //         toAddress: "akash1slzxpc23f62ezmmvhkrululttn6lpsq5zp5d9z",
        //         amount: [{
        //             "denom": "uakt",
        //             "amount": "1000"
        //         }]
        //     }
        // }], fee, "Test Akashlytics");
    }

    async function createDeployment() {

    }

    async function revokeCertificate(cert) {
        const offlineSigner = window.getOfflineSigner(chainId);

        const endpoint = "http://localhost:1317/http://rpc.akash.forbole.com";

        const customRegistry = new Registry();
        customRegistry.register("/akash.cert.v1beta1.MsgRevokeCertificate", MsgRevokeCertificate);


        const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
            registry: customRegistry
        });

        const revokeCertificateJson = {
            "typeUrl": "/akash.cert.v1beta1.MsgRevokeCertificate",
            "value": {
                "id": {
                    "owner": selectedWallet.bech32Address,
                    "serial": cert.serial
                }
            }
        };



        await client.signAndBroadcast(selectedWallet.bech32Address, [revokeCertificateJson], fee, "Test Akashlytics");

    }

    async function createCertificate() {

        const fromAddress = selectedWallet.bech32Address;

        debugger;
        var keys = window.forge.pki.rsa.generateKeyPair(2048);
        var cert = window.forge.pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = Math.floor((new Date()).getTime() * 1000).toString();
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

        var attrs = [{
            name: 'commonName',
            value: fromAddress
        }];
        cert.setSubject(attrs);
        cert.setIssuer(attrs);

        cert.setExtensions([
            {
                name: 'keyUsage',
                keyEncipherment: true,
                dataEncipherment: true
            },
            {
                name: 'extKeyUsage',
                clientAuth: true
            },
            {
                name: 'basicConstraints',
                cA: true
            }
        ]);

        cert.sign(keys.privateKey, window.forge.md.sha256.create());
        var privatePem = window.forge.pki.privateKeyToPem(keys.privateKey);
        var pem = window.forge.pki.certificateToPem(cert);
        var publicPem = window.forge.pki.publicKeyToPem(keys.publicKey);
        localStorage.setItem("DeploymentCertificatePrivateKey", privatePem);
        localStorage.setItem("DeploymentCertificatePublicKey", publicPem);
        localStorage.setItem("DeploymentCertificate", pem);

        const createCertificateMsg = {
            "typeUrl": "/akash.cert.v1beta1.MsgCreateCertificate",
            "value": {
                owner: fromAddress,
                cert: window.forge.util.encode64(pem),
                pubkey: window.forge.util.encode64(publicPem)
            }
        }

        const offlineSigner = window.getOfflineSigner(chainId);

        const endpoint = "http://localhost:1317/http://rpc.akash.forbole.com";

        const customRegistry = new Registry();
        customRegistry.register("/akash.cert.v1beta1.MsgCreateCertificate", MsgCreateCertificate);

        const client = await SigningStargateClient.connectWithSigner(endpoint, offlineSigner, {
            registry: customRegistry
        });

        await client.signAndBroadcast(selectedWallet.bech32Address, [createCertificateMsg], fee, "Test Akashlytics");
    }

    return (
        <div className="container text-on-black">
            {selectedWallet && (
                <>
                    <h1>{selectedWallet.name}</h1>
                    <h2>{selectedWallet.bech32Address}</h2>

                    <h2>Deployments</h2>
                    {deployments.map(deployment => (
                        <div key={deployment.id}>
                            {deployment.state}
                            {deployment.state === "active" && (
                                <Button color="primary" onClick={() => closeDeployment(deployment)}>Close</Button>
                            )}
                        </div>
                    ))}


                    <h2>Certificates</h2>
                    {validCertificates.length > 0 ?
                        validCertificates.map(cert => (
                            <div key={cert.serial}>
                                {cert.serial}
                                <Button color="primary" onClick={() => revokeCertificate(cert)}>Revoke</Button>
                            </div>
                        )) : (
                            <div>
                                <Button color="primary" onClick={() => createCertificate()}>Create Certificate</Button>
                            </div>
                        )}
                    <br />

                    {/* <Button color="primary" onClick={() => createDeployment()}>Create Deployment</Button> */}
                </>
            )}
        </div>
    )
}