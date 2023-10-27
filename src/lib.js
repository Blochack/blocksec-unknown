
module.exports.fetchTransactions = async (address) => {
    let url = `https://api.chainbase.online/v1/account/txs?`
    url += `&chain_id=1&address=${address}&from_block=0`
    url += `&page=1&limit=20`

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
    return (parseInt(amount) / 1e18).toLocaleString()
}