import {RawNodeDatum} from "react-d3-tree";
import {Transaction} from "./types";

export const fetchTransactions = async (address: string, count: number = 10) => {
    let url = `https://api.chainbase.online/v1/account/txs?`
    url += `&chain_id=1&address=${address}&from_block=0`
    url += `&page=1&limit=${count}`

    const headers = {'x-api-key': '2XLh8wLw6X7KMW5DhD28r2HgHr1'}
    const res = await (await fetch(url, {method: 'GET', headers})).json()

    console.log(res);

    return res.data
}

export const fromWei = (amount: string) => {
    return (parseInt(amount) / 1e18)
}

export const truncateAddress = (inputString: string) => {
    if (inputString.length < 8) {
        throw new Error("Invalid Address");
    }

    const f = inputString.substring(0, 4);
    const l = inputString.substring(inputString.length - 4);
    return `${f}...${l}`
}

export const createChild = (tx: Transaction) => {
    const sentEth = (tx.value)
    const attr = `${fromWei(sentEth)} ETH`

    return {
        name: truncateAddress(tx.from_address),
        attributes: {'Sent': attr, hash: tx.transaction_hash},
        children: []
    } as RawNodeDatum;
}