require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 6000000,    // Reduced gas limit to be under block limit
      gasPrice: 20000000000, // 20 Gwei
      from: "0x476a07bB41deC7c1707072E8Aa681275c4044dde", // Your default account
      accounts: {
        mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
        count: 10,
        initialIndex: 0
      }
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6000000,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
        count: 10,
        initialIndex: 0
      }
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
