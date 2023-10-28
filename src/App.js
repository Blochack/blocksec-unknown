import { useEffect, useState } from 'react';
import './App.css';
import { createChild, fetchTransactions, pickFirstAndLastFourChars, toEth } from './libs';
// import data from './data/data.json';
import Tree from 'react-d3-tree';

function App() {
  const [txs, setTxs] = useState([])
  const [customData, setCustomData] = useState({})
  const [addy, setAddy] = useState('')

  const fetchTxs = async (addy) => {
    if (!addy) return
    const res = await fetchTransactions(addy, 6)
    setTxs(res)
  }

  useEffect(() => {
    fetchTxs(addy)
  }, [addy])

  useEffect(() => {
    if (txs && txs.length === 0) return
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
      <form>
        <label className="block">
          <span className="block text-sm font-medium text-white">Input Address</span>
          <input type="text" value={addy} onChange={(e) => setAddy(e.target.value)} 
          className="mt-1 block w-80 px-5 py-2 
          bg-white border border-slate-300 text-black 
          rounded-md text-sm shadow-sm placeholder-slate-400
          "/>
        </label>
      </form>
      {txs && txs.length > 0 && (
        <Tree data={customData} />
      )}
    </div>
  );
}

export default App;
