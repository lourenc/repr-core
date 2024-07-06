# Solidity API

## ERC6551Account

### state

```solidity
uint256 state
```

### InvalidSigner

```solidity
error InvalidSigner(address signer)
```

Errors

### InvalidOperation

```solidity
error InvalidOperation(uint8 operation)
```

### receive

```solidity
receive() external payable
```

External functions

### execute

```solidity
function execute(address to, uint256 value, bytes data, uint8 operation) external payable virtual returns (bytes result)
```

### isValidSigner

```solidity
function isValidSigner(address signer, bytes) external view virtual returns (bytes4)
```

### isValidSignature

```solidity
function isValidSignature(bytes32 hash, bytes signature) external view virtual returns (bytes4 magicValue)
```

_Should return whether the signature provided is valid for the provided data_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hash | bytes32 | Hash of the data to be signed |
| signature | bytes | Signature byte array associated with _data |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external pure virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### token

```solidity
function token() public view virtual returns (uint256, address, uint256)
```

### owner

```solidity
function owner() public view virtual returns (address)
```

### _isValidSigner

```solidity
function _isValidSigner(address signer) internal view virtual returns (bool)
```

Internal functions

