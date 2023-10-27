import { useEffect, useState } from 'react';
import './App.css';
import { fetchTransactions, pickFirstAndLastFourChars, toEth } from './libs';
// import data from './data/data.json';
import Tree from 'react-d3-tree';

function App() {
  const [txs, setTxs] = useState([])
  const [customData, setCustomData] = useState({})

  const fetchTxs = async () => {
    const res = await fetchTransactions("0x629e7Da20197a5429d30da36E77d06CdF796b71A")
    setTxs(res)
  }

  useEffect(() => {
    fetchTxs()
  }, [])

  useEffect(() => {
    if (txs.length == 0) return
    const cData = {}
    cData.name = pickFirstAndLastFourChars(txs[0]?.from_address)
    cData.attributes = { Sent: `${toEth(txs[0]?.value)}eth` }
    const children = []
    for (let index = 1; index < txs.length; index++) {
      const tx = txs[index]
      const data = {}
      const sentEth = (tx.value)
      const attr = `${toEth(sentEth)}eth`

      data.name = pickFirstAndLastFourChars(tx.from_address)
      if (parseInt(sentEth) > 0) {
        data.attributes = {
          'Sent': attr
        }
      }

      children.push(data)
    }
    cData.children = children
    setCustomData(cData);
  }, [txs])

  return (
    <div className="App-header" style={{ width: '100%', height: '100vh' }}>
      {txs && txs.length > 0 && (
        <Tree data={customData} />
      )}
    </div>
  );
}

export default App;
