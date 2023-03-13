/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
import { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import SessionStorage, { SessionsStorageKeys } from "@services/session-storage";
import SectionTitle from "@components/section-title";
import OrdinalCard from "@components/ordinal-card";
import { toast } from "react-toastify";
import WalletContext from "@context/wallet-context";
import Image from "next/image";
import { shortenStr } from "@utils/crypto";
import { getAddressUtxos } from "@utils/utxos";
// Use this to fetch data from an API service
const axios = require("axios");

const collectionAuthor = [
    {
        name: "Danny Deezy",
        slug: "/deezy",
        image: {
            src: "/images/logo/nos-ft-logo.png",
        },
    },
];

const getOwnedInscriptions = async (nostrAddress) => {
    const utxos = await getAddressUtxos(nostrAddress);
    const sortedData = utxos.sort((a, b) => b.status.block_time - a.status.block_time);
    const inscriptions = sortedData.map((utxo) => ({ ...utxo, key: `${utxo.txid}:${utxo.vout}` }));
    console.log("all utxos", inscriptions);
    SessionStorage.set(SessionsStorageKeys.INSCRIPTIONS_OWNED, inscriptions);
    return inscriptions;
};

const getInscriptionId = async (utxo) => {
    const utxoKey = utxo.key;
    const { data } = await axios.get(`/api/inscriptions/${utxoKey}`);
    console.log("data", {
        ...utxo,
        inscriptionId: data.inscriptionId,
    });
    return {
        ...utxo,
        inscriptionId: data.inscriptionId,
    };
};

const OrdinalsArea = ({ className, space }) => {
    const { nostrAddress } = useContext(WalletContext);
    const [utxosReady, setUtxosReady] = useState(false);
    const [ownedUtxos, setOwnedUtxos] = useState([]);
    const [refreshHack, setRefreshHack] = useState(false);

    const handleRefreshHack = () => {
        setRefreshHack(!refreshHack);
    };

    const getDemoInscriptions = async () => {
        const inscriptions = await axios.get(
            "https://turbo.ordinalswallet.com/wallet/bc1p8l0pstx8umh6dx3e8vtw7sd3pspe9r0nh94v7ncwkqleljnr5zdqa3cvlm/inscriptions"
        );
        console.log("inscriptions", inscriptions);
    }

    useEffect(() => {
        const fetchByUtxos = async () => {
            setUtxosReady(false);
            const ownedInscriptions = await getOwnedInscriptions(nostrAddress);
            let count = 0;
            const ownedInscriptionResults = await Promise.allSettled(
                ownedInscriptions
                    .map((utxo) => {
                        if (utxo && count < 2) {
                            count += 1;
                            return getInscriptionId(utxo);
                        }
                    })
                    .filter((x) => x)
            );
            console.log("owned", ownedInscriptionResults);
            setOwnedUtxos(ownedInscriptionResults.map((utxo) => utxo.value));
            setUtxosReady(true);
        };
        fetchByUtxos();
        getDemoInscriptions();
    }, [refreshHack, nostrAddress]);

    return (
        <div id="your-collection" className={clsx("rn-product-area", space === 1 && "rn-section-gapTop", className)}>
            <div className="container">
                <div className="row mb--50 align-items-center">
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                        <SectionTitle className="mb--0" {...{ title: "Your collection" }} isLoading={!utxosReady} />
                        <br />
                        <span>
                            <Image
                                src="/images/logo/ordinals-white.svg"
                                alt="Ordinal"
                                width={15}
                                height={15}
                                className="mb-1"
                                priority
                            />
                            <button
                                type="button"
                                className="btn-transparent"
                                onClick={() => {
                                    navigator.clipboard.writeText(nostrAddress);
                                    toast("Receive Address copied to clipboard!");
                                }}
                            >
                                {" "}
                                {shortenStr(nostrAddress)}
                            </button>
                        </span>
                    </div>
                </div>

                <div className="row g-5">
                    {utxosReady && ownedUtxos.length > 0 && (
                        <>
                            {ownedUtxos.map((inscription) => (
                                <div key={inscription.txid} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                                    <OrdinalCard
                                        overlay
                                        price={{
                                            amount: inscription.value.toLocaleString("en-US"),
                                            currency: "Sats",
                                        }}
                                        type="send"
                                        confirmed={inscription.status.confirmed}
                                        date={inscription.status.block_time}
                                        authors={collectionAuthor}
                                        utxo={inscription}
                                        onSale={handleRefreshHack}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    {utxosReady && ownedUtxos.length === 0 && (
                        <div>
                            This address does not own anything yet..
                            <br />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

OrdinalsArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1, 2]),
    onSale: PropTypes.func,
};

OrdinalsArea.defaultProps = {
    space: 1,
};

export default OrdinalsArea;
