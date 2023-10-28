import { useEffect, useState } from 'react';
import './App.css';
import { createChild, fetchTransactions, pickFirstAndLastFourChars, toEth } from './libs';
// import data from './data/data.json';
import Tree from 'react-d3-tree';

function App() {
  const [txs, setTxs] = useState([])
  const [customData, setCustomData] = useState({})

  const fetchTxs = async () => {
    const res = await fetchTransactions("0x629e7Da20197a5429d30da36E77d06CdF796b71A", 8)
    setTxs(res)
  }

  useEffect(() => {
    fetchTxs()
  }, [])

  useEffect(() => {
    if (txs.length === 0) return
    const cData = {}
    const sentEth = (txs[0]?.value)
    const attr = `${toEth(sentEth)}eth`
    cData.name = pickFirstAndLastFourChars(txs[0]?.from_address)
    if (parseInt(sentEth) > 0) {
      cData.attributes = {
        'Sent': attr
      }
    }
    const children = []
    let index = 1
    let stillChecking = true
    const interval = setInterval(() => {
      if (!stillChecking) return
      const child = createChild(txs[index])
      fetchTransactions(txs[index].from_address, 4).then((res) => {
        child.children = []
        let j = 0;

        const intervalId = setInterval(() => {
          if (j < res.length) {
            child.children.push(createChild(res[j]));
            j++;
          } else {
            clearInterval(intervalId); // Stop the interval when all items are processed
          }
        }, 1000);
      })

      children.push(child)
      index += 1

      if (index >= txs.length) {
        cData.children = children
        setCustomData(cData);
        stillChecking = false
      }
    }, 1000);

    console.log(stillChecking);
    return () => clearInterval(interval);
    // eslint-disable-next-line
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
