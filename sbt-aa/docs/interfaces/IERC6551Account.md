# Solidity API

## IERC6551Account

### receive

```solidity
receive() external payable
```

### token

```solidity
function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId)
```

### state

```solidity
function state() external view returns (uint256)
```

### isValidSigner

```solidity
function isValidSigner(address signer, bytes context) external view returns (bytes4 magicValue)
```

## IERC6551Executable

### execute

```solidity
function execute(address to, uint256 value, bytes data, uint8 operation) external payable returns (bytes)
```

