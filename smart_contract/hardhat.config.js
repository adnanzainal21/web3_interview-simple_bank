require("@nomiclabs/hardhat-waffle");


module.exports = {
  solidity: "0.8.4",
  networks:{
    kovan:{
      url:`https://eth-kovan.alchemyapi.io/v2/0fEx2I4dktYck84_naVlAIY8N-irmacA`,
      accounts: ['c0f1d2b7138c0a8e7d1a2e282ff8b90ae26093238aac36c793986765b660496c']
    }
  }
};
