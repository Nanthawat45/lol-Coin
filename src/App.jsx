import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function App() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [numbers, setNumbers] = useState([null, null, null]);
  const [answers, setAnswers] = useState([null, null, null]);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true); // State to control when generating is allowed

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        // Set account and connection status
        setAccount(accounts[0]);
        setIsConnected(true);

        // Create web3 instance using the MetaMask provider
        const web3 = new Web3(window.ethereum);

        // Use web3.eth.net.getId() to get network ID
        const networkId = await web3.eth.net.getId();
        console.log('Connected to network ID:', networkId);

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        setTxStatus('Failed to connect MetaMask');
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const requestCoins = async () => {
    if (window.ethereum && account) {
      const web3 = new Web3(window.ethereum);

      // Contract details for PLP ERC-20 token
      const contractAddress = '0x8cEf39A2882D341dB8BEa0a2c3d6a738bf1E5eA6';  // Contract address of PLP token
      const abi = [
        {
          "constant": false,
          "inputs": [
            {
              "name": "to",
              "type": "address"
            },
            {
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "transfer",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const contract = new web3.eth.Contract(abi, contractAddress);

      const toAddress = '0x8cEf39A2882D341dB8BEa0a2c3d6a738bf1E5eA6';  // ที่อยู่ที่รับเหรียญ PLP
      const amount = web3.utils.toWei('0.0000001', 'ether');  // จำนวนเหรียญ PLP ที่ต้องการโอน (ปรับให้เหมาะสม)

      try {
        // ส่งธุรกรรมเพื่อขอเหรียญ
        setTxStatus('Requesting transaction...');
        const txHash = await contract.methods
          .transfer(toAddress, amount)
          .send({ from: account });

        setTxStatus(`Transaction successful! Hash: ${txHash.transactionHash}`);
        alert('Congratulations! You have won 0.0000001 PLP!');
        
        // รีเจนเนอเรตตัวเลขใหม่หลังจากแจกเหรียญ
        generateNumbers();
        
      } catch (error) {
        console.error("Error sending transaction:", error);
        setTxStatus('Transaction failed. Please check if you have enough funds or if the contract is correct.');
      }
    } else {
      alert('Please connect MetaMask first.');
    }
  };

  const generateNumbers = () => {
    if (!canGenerate) return; // ไม่ให้กด Generate ถ้ากำลังนับถอยหลัง

    // Reset countdown and game state before generating numbers
    setCountdown(5);
    setIsCounting(true);
    setCanGenerate(false); // ปิดไม่ให้กดปุ่มระหว่างที่กำลังนับถอยหลัง

    const newNumbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 99) + 1);
    setNumbers(newNumbers);
    setScore(0);  // Reset score each time new numbers are generated
    setAnswers([null, null, null]);  // Reset answers

    // Start the countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCounting(false);
          setCanGenerate(true);  // เปิดให้กดปุ่ม Generate ได้หลังจากหมดเวลา
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (index, answer) => {
    if (countdown === 0) {
      // หากหมดเวลาแล้ว จะไม่ให้ตอบคำถาม
      return;
    }

    const correctAnswer = numbers[index] > 150 ? 'higher' : 'lower';
    if (answer === correctAnswer) {
      setScore(score + 1);
    }

    if (score + 1 === 3) {
      requestCoins();
    }

    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const logout = () => {
    setAccount(null);
    setIsConnected(false);
    setTxStatus('');
    setScore(0);
    setNumbers([null, null, null]);
    setAnswers([null, null, null]);
    setIsCounting(false);
    setCanGenerate(true);
  };

  return (
    <div className="App">
      <h1>Connect to MetaMask</h1>
      <button onClick={connectMetaMask}>
        {isConnected ? 'Connected' : 'Connect MetaMask'}
      </button>

      {isConnected && (
        <>
        <button onClick={logout}>Logout</button>
          <p>Connected Account: {account}</p>
          <button onClick={generateNumbers} disabled={!canGenerate}>Generate Numbers</button>
         <h1> <p>Time remaining: {isCounting ? countdown : 'Time is up!'}</p></h1>
          {numbers[0] && (
            <div>
              <p>Number 1: {numbers[0]}</p>
              <button onClick={() => handleAnswer(0, 'higher')}>Higher than 150</button>
              <button onClick={() => handleAnswer(0, 'lower')}>Lower than 150</button>
            </div>
          )}
          {numbers[1] && (
            <div>
              <p>Number 2: {numbers[1]}</p>
              <button onClick={() => handleAnswer(1, 'higher')}>Higher than 150</button>
              <button onClick={() => handleAnswer(1, 'lower')}>Lower than 150</button>
            </div>
          )}
          {numbers[2] && (
            <div>
              <p>Number 3: {numbers[2]}</p>
              <button onClick={() => handleAnswer(2, 'higher')}>Higher than 150</button>
              <button onClick={() => handleAnswer(2, 'lower')}>Lower than 150</button>
            </div>
          )}
          <p>{txStatus}</p>
          <p>Score: {score}/3</p>
        </>
      )}
    </div>
  );
}

export default App;