const main = async ()=> {
    const Bank = await hre.ethers.getContractFactory("Bank");
    const bank = await Bank.deploy();
  
    await bank.deployed();
  
    console.log("Transactions deployed to:", bank.address);
  }
  
  const runMain = async ()=>  {
    try{
      await main();
      process.exit(0); // process is successful complete
    }catch(e){
      console.error(e);
      process.exit(1); // process has failed
    }
  }
  runMain();
  
  
  