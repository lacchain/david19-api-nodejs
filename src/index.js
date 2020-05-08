const Web3 = require( 'web3' );
const { Transaction } = require( 'ethereumjs-tx' );
const web3 = new Web3( new Web3.providers.HttpProvider( 'http://35.237.91.29:4545' ) );
web3.transactionConfirmationBlocks = 1;
const sha3 = require( "js-sha3" ).keccak_256;

const sendTransaction = async( object, privateKey ) => {
	const tx = new Transaction( object )
	tx.sign( privateKey )
	const serializedTx = tx.serialize()
	const rawTxHex = `0x${serializedTx.toString( 'hex' )}`
	return await web3.eth.sendSignedTransaction( rawTxHex )
}

const deploySmartContract = async( from, data, gasLimit, privateKey ) => {
	const nonce = await web3.eth.getTransactionCount( from, "pending" )
	const receipt = await sendTransaction( {
		nonce,
		gasPrice: "0x0",
		gasLimit,
		data,
	}, privateKey )
	return receipt.contractAddress
}

const callSmartContract = async( method, types, values ) => {
	const signature = web3.eth.abi.encodeFunctionSignature( `${method}(${types.join( ',' )})` );
	const parameters = web3.eth.abi.encodeParameters( types, values );
	return signature + parameters.substr( 2 )
}

const from = '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73';
const key = Buffer.from( '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63', 'hex' );
const gas = 800000000;
const bytecode = '0x6080604052600080fdfea265627a7a723158203430ac43a839920c50ab9cb9a9b7b5653a0420c1787fe03fad70144c688cd81464736f6c63430005110032'
const contract = {
	signature: ["bytes32", "bytes32", "uint256", "uint256", "uint8", "uint8", "bytes6", "uint8", "uint8"],
	values: ['0x' + sha3( "some" ), '0x' + sha3( "some" ), 123456, 567890, 0, 56, "0x123456789012", 0, 3],
}

deploySmartContract( from, bytecode, gas, key ).then( result => {
	console.log( result );
} );

