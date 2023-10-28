
module.exports.fetchTransactions = async (address, count) => {
    let url = `https://api.chainbase.online/v1/account/txs?`
    url += `&chain_id=1&address=${address}&from_block=0`
    url += `&page=1&limit=${count}`

    const headers = {
        'x-api-key': '2XLh8wLw6X7KMW5DhD28r2HgHr1'
    }
    const res = await (await fetch(url, {
        method: 'GET', headers
    })).json()
    console.log(res);
    return res.data
}

module.exports.toEth = (amount) => {
    return (parseInt(amount) / 1e18)
}

module.exports.pickFirstAndLastFourChars = (inputString) => {
    if (inputString.length < 8) {
        return "The string is too short to pick the first and last 4 characters.";
    }

    const firstFour = inputString.substring(0, 4);
    const lastFour = inputString.substring(inputString.length - 4);

    return `${firstFour}...${lastFour}`
}

module.exports.createChild = (tx) => {
    const data = {}
    const sentEth = (tx.value)
    const attr = `${this.toEth(sentEth)}eth`

    data.name = this.pickFirstAndLastFourChars(tx.from_address)
    if (parseInt(sentEth) > 0) {
      data.attributes = {
        'Sent': attr
      }
    }

    return data;
}