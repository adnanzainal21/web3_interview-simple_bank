import React, { useState, useEffect } from "react";
import {ethers} from 'ethers';
import { contractABI, contractAddress } from "../utils/constants"

const { ethereum } = window;

import './WalletCard.css';


const Input = ({ placeholder, name, type, value, handleChange }) => (
    <input
      placeholder={placeholder}
      type={type}
      step="0.0001"
      value={value}
      onChange={(e) => handleChange(e, name)}
    />
  );


const getEtherumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    return transactionsContract;
}


const WalletCard = () => {

    const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [userBalance, setUserBalance] = useState(null);
	const [connButtonText, setConnButtonText] = useState('Connect Wallet');
    const [isLoading, setIsLoading] = useState(false)

    const [depositval, setDepositval] = useState(null);
    const [withdrawVal, setWithdrawval] = useState({amount:'', message:''});
    const [formData, setFormData] = useState({addressTo:'',amount:'',keyword:'',message:''})
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    
    // ------ Deposit -------
    // contract
    const depositTransaction = async ()=> {
        try {
            if(!ethereum) return alert("Please install metamask");

            const transactionsContract = getEtherumContract();
            const parsedAmount = ethers.utils.parseEther(depositval);
            const transactionHash = await transactionsContract.deposit(parsedAmount._hex);
            setIsLoading(true)
            console.log(`loading - ${transactionHash.hash}`)
            await transactionHash.wait()
            setIsLoading(false)
            console.log(`Success - ${transactionHash.hash}`)

            const transactionCount = await transactionsContract.getTransactionCount();

            //get the data from the form
            await setIsLoading(transactionCount.toNumber())
            window.location.reload();
        }catch(err) {
            console.log(err);
            throw new Error("No ethereum object.")
        }

    }
    
    const handleChange_deposit = async (e)=> {
        setDepositval( e.target.value);
        console.log(depositval);
      }

    const depositSubmit = async (e) => {
        e.preventDefault();
        if(!depositval ) return;
        depositTransaction()
    }


    // ----- Withdraw -----
    
    const withdrawTransaction = async ()=> {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionsContract = getEtherumContract();
            const parsedAmount = ethers.utils.parseEther(withdrawVal.amount);

            const transactionHash = await transactionsContract.withdraw(parsedAmount._hex, withdrawVal.message);
            setIsLoading(true)
            console.log(`loading - ${transactionHash.hash}`)
            await transactionHash.wait()
            setIsLoading(false)
            console.log(`Success - ${transactionHash.hash}`)

            const transactionCount = await transactionsContract.getTransactionCount();

            //get the data from the form
            await setIsLoading(transactionCount.toNumber())
            window.location.reload();
        }catch(err) {
            console.log(err);
            throw new Error("No ethereum object.")
        }

    }

    const handleChange_withdraw = async (e, name)=> {
        setWithdrawval((data) => ({...data, [name]: e.target.value}));
      }
    
	const withdrawSubmit = (e) => {
		e.preventDefault();
        console.log(withdrawVal);
		if (!withdrawVal) return;
	
		withdrawTransaction();
	  };
      
    // --- Balance ---
    const [balanceInbank, setBalanceInbank] = useState(null);
    const balanceCheck = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionsContract = getEtherumContract();
            const balance = await transactionsContract.balance();
            const amount = parseInt(balance) * (10**-18);
            setBalanceInbank(amount);
            console.log(amount);
        } catch (error) {
            console.log(error);
        }
    }

    const [bankBalance, setBankBalance] = useState(null);
    const bankBalanceCheck = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionsContract = getEtherumContract();
            const balance = await transactionsContract.allBalancepool();
            const amount = parseInt(balance) * (10**-18);
            setBankBalance(amount)
            console.log(amount);
        } catch (error) {
            console.log(error);
        }
    }
    

    //------ Transactions and Transfer------

    const handleChange_transfer = async (e, name)=> {
        setFormData((prev) => ({...prev, [name]: e.target.value}));
      }
    
	const transferSubmit = (e) => {
		e.preventDefault();
        const { addressTo, amount, message } = formData;
        console.log(formData);
		if (!addressTo || !amount || !message) return;

		sendTransaction();
	  };

	const sendTransaction = async ()=> {
        try {
            if(!ethereum) return alert("Please install metamask");
            const {addressTo, amount, message} = formData;
            const transactionsContract = getEtherumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: defaultAccount[0],
                    to: addressTo,
                    gas: '0x5208' ,//2100 GWEI
                    value: parsedAmount._hex,
                }]
            })

            const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message);
            setIsLoading(true)
            console.log(`loading - ${transactionHash.hash}`)
            await transactionHash.wait()
            setIsLoading(false)
            console.log(`Success - ${transactionHash.hash}`)
            window.location.reload();
        }catch(err) {
            console.log(err);
        }

    }

    const connectWallet = async () =>{
        try {
            if(!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            accountChangedHandler(accounts);
            setConnButtonText('Wallet Connected');
            getAccountBalance(accounts.toString());
        } catch (error) {
            console.log(err);
            throw new Error("No ethereum object.")
        }
    }

    const getAccountBalance = async(account) => {
		try {
			const balance = await ethereum.request({method: 'eth_getBalance', params: [account, 'latest']});
			await setUserBalance(ethers.utils.formatEther(balance));
		} catch (error) {
			console.log(error);
		}
	};

    const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		getAccountBalance(newAccount.toString());
	}

	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}

    // listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);
	window.ethereum.on('chainChanged', chainChangedHandler);

    return (
		<div>
            {/*                        Connect                                   */}
			<div className='walletCard'>
				<h4 className="grid grid-cols-3 gap-4 "> {"Connection to MetaMask"} </h4>
					<h1>
						<button 
							type="button"
							onClick={connectWallet}
							className="flex flex-row justify-center items-center my-5 bg-[#916666] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
							>
						{connButtonText}
					</button></h1>
					<div className='accountDisplay'>
						<h3>Address: {defaultAccount}</h3>
					</div>

					<div className='balanceDisplay'>
						<h3>Balance: {userBalance}</h3>
					</div>
					{errorMessage}
				</div>

                {/*                        Deposit                                   */}
				<div className='walletCard'>
					<div>
						<button
						type="button"
						onClick={ depositSubmit }
						className="flex flex-row justify-center items-center my-5 bg-[#916666] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
						>
							Deposit
						</button>
						<div>
						<input 
                        placeholder="Amount (ETH)" 
                        name="amount" 
                        type="number" 
                        step="0.0001" 
                        onChange={ handleChange_deposit } />
						</div>
					</div>
				</div>
                
                {/*                        Widraw                                   */}
				<div className='walletCard'>
					<div>
						<button
						type="button"
						onClick={ withdrawSubmit }
						className="flex flex-row justify-center items-center my-5 bg-[#916666] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
						>
							Widraw
						</button>
						<div>
						<Input 
                        placeholder="Amount (ETH)" 
                        name="amount" 
                        type="number" 
                        handleChange= { handleChange_withdraw } />
						<Input 
                        placeholder="Enter Message" 
                        name="message" 
                        type="text" 
                        handleChange={ handleChange_withdraw } />
						</div>
					</div>
				</div>

                {/*                        Balance                                   */}
                <div className='walletCard'>
				<h4 className="grid grid-cols-3 gap-4 "> Checking Balance of this user</h4>
					<h1>
						<button 
							type="button"
							onClick={ balanceCheck }
							className="flex flex-row justify-center items-center my-5 bg-[#916666] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
							>
						Check
					</button></h1>
					<div className='balanceDisplay'>
						<h3>Balance: {balanceInbank }</h3>
					</div>

					{errorMessage}
				</div>
                <div className='walletCard'>
				<h4 className="grid grid-cols-3 gap-4 "> Check Balance Pool of bank</h4>
					<h1>
						<button 
							type="button"
							onClick={ bankBalanceCheck }
							className="flex flex-row justify-center items-center my-5 bg-[#916666] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
							>
						Bank Balance Pool
					</button></h1>
					<div className='balanceDisplay'>
						<h3>Balance: { bankBalance }</h3>
					</div>

					{errorMessage}
				</div>

                {/*                       Transfer                          */}
                <div className='walletCard'>
					<div>
						<button
						type="button" 
						onClick={ transferSubmit }
						className="flex flex-row justify-center items-center my-5 bg-[#916666] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
						>
							Transfer
						</button>
						<div>
						<Input placeholder="Address To" name="addressTo" type="text" handleChange={handleChange_transfer} />
                        <Input placeholder="Amount (ETH)" name="amount" type="number" handleChange={handleChange_transfer} />
                        <Input placeholder="Enter Message" name="message" type="text" handleChange={handleChange_transfer} />

						</div>
					</div>
				</div>
		</div>
	);
}
export default WalletCard;