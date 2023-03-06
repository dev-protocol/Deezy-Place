/* eslint-disable react/forbid-prop-types */
import { useState, useContext } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { validate, Network } from "bitcoin-address-validation";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { TESTNET, ORDINALS_EXPLORER_URL } from "@lib/constants";
import { shortenStr } from "@utils/crypto";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import WalletContext from "@context/wallet-context";

// import {
//     getInscriptionDataById,
//     generatePSBTListingInscriptionForSale,
//     submitSignedSalePsbt,
// } from "@utils/openOrdex";

import nostrRelay, { RELAY_KINDS } from "@services/nostr-relay";

import { toast } from "react-toastify";

bitcoin.initEccLib(ecc);

const SendModal = ({ show, handleModal, utxo }) => {
    const { nostrAddress, nostrPublicKey } = useContext(WalletContext);

    const [isBtcInputAddressValid, setIsBtcInputAddressValid] = useState(true);
    const [isBtcAmountValid, setIsBtcAmountValid] = useState(true);
    const [destinationBtcAddress, setDestinationBtcAddress] =
        useState(nostrAddress);
    const [ordinalValue, setOrdinalValue] = useState(utxo.value);

    // console.warn(utxo);
    const sale = async () => {
        console.log(utxo);
        // TODO: This aint working
        // const inscriptionId = `${utxo.txid}i${utxo.vout}`; // @danny this is not working.

        const inscriptionId = `81efb05646d768e681eed69f4ed6df5126a5e57e3051ab9fe06557e37c416980i0`;
        const inscription = await getInscriptionDataById(inscriptionId);
        const psbt = await generatePSBTListingInscriptionForSale(
            inscription.output,
            ordinalValue,
            destinationBtcAddress
        );

        // TODO: SIGN PSBT
        const signedContent = psbt;
        // try {
        //     // sign the psbt with window.nostr
        //     signedContent = await submitSignedSalePsbt(signedContent);
        // } catch (e) {
        //     toast.error(e.message);
        // }

        // TODO: Notify nostr that ordinal is available

        // return {
        //     id: event.id,
        //     pubkey: event.pubkey,
        //     created_at: event.created_at,
        //     kind: event.kind,
        //     tags: event.tags,
        //     content: event.content,
        //     sig: event.sig
        //   }

        const event = {
            pubkey: nostrPublicKey,
            kind: RELAY_KINDS.INSCRIPTION,
            tags: [["i", inscriptionId, signedContent]],
            content: `sell ${inscriptionId}`,
        };

        const signedEvent = await nostrRelay.sign(event);
        await nostrRelay.publish(signedEvent, console.info, console.error);
    };

    return (
        <Modal
            className="rn-popup-modal placebid-modal-wrapper"
            show={show}
            onHide={handleModal}
            centered
        >
            {show && (
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleModal}
                >
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">
                    Sell {shortenStr(utxo && `${utxo.inscriptionId}`)}
                </h3>
            </Modal.Header>
            <Modal.Body>
                <p>You are about to sell this NFT</p>
                <iframe
                    id="preview"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    loading="lazy"
                    src={`${ORDINALS_EXPLORER_URL}/preview/${utxo.inscriptionId}`}
                ></iframe>

                <div className="placebid-form-box">
                    <div className="bid-content">
                        <div className="bid-content-top">
                            <div className="bid-content-left">
                                <InputGroup className="mb-lg-5 omg">
                                    <Form.Label>
                                        Address to receive payment
                                    </Form.Label>
                                    <Form.Control
                                        defaultValue={nostrAddress}
                                        onChange={(evt) => {
                                            const newaddr = evt.target.value;
                                            if (newaddr === "") {
                                                setIsBtcInputAddressValid(true);
                                                return;
                                            }
                                            if (
                                                !validate(
                                                    newaddr,
                                                    TESTNET
                                                        ? Network.testnet
                                                        : Network.mainnet
                                                )
                                            ) {
                                                setIsBtcInputAddressValid(
                                                    false
                                                );
                                                return;
                                            }
                                            setDestinationBtcAddress(newaddr);
                                        }}
                                        placeholder="Paste BTC address to receive your payment here"
                                        aria-label="Paste BTC address to receive your payment here"
                                        aria-describedby="basic-addon2"
                                        isInvalid={!isBtcInputAddressValid}
                                        autoFocus
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        <br />
                                        That is not a valid{" "}
                                        {TESTNET ? "testnet" : "mainnet"} BTC
                                        address
                                    </Form.Control.Feedback>
                                </InputGroup>

                                <InputGroup className="mb-lg-5">
                                    <Form.Label>Price (in Sats)</Form.Label>
                                    <Form.Control
                                        defaultValue={utxo.value}
                                        onChange={(evt) => {
                                            const newValue = evt.target.value;
                                            if (newValue === "") {
                                                setIsBtcAmountValid(true);
                                                return;
                                            }

                                            if (!newValue) {
                                                setIsBtcAmountValid(false);
                                                return;
                                            }

                                            setOrdinalValue(newValue);
                                        }}
                                        placeholder="Price (in Sats)"
                                        aria-label="Price (in Sats)"
                                        aria-describedby="basic-addon2"
                                        isInvalid={!isBtcAmountValid}
                                        autoFocus
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        <br />
                                        Invalid amount
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </div>
                        </div>

                        <div className="bid-content-mid">
                            <div className="bid-content-left">
                                {!!destinationBtcAddress && (
                                    <span>Payment Receive Address</span>
                                )}
                            </div>
                            <div className="bid-content-right">
                                {!!destinationBtcAddress && (
                                    <span>
                                        {shortenStr(destinationBtcAddress)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bit-continue-button">
                        <Button
                            size="medium"
                            fullwidth
                            disabled={!destinationBtcAddress}
                            autoFocus
                            onClick={async () => {
                                if (!destinationBtcAddress) return;
                                if (!isBtcAmountValid) return;
                                if (!isBtcInputAddressValid) return;
                                if (
                                    !confirm(
                                        `Are you sure you want to sell this NFT for ${ordinalValue} sats?`
                                    )
                                )
                                    return;

                                await sale();
                            }}
                        >
                            Sell
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

SendModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
    utxo: PropTypes.object,
};
export default SendModal;
