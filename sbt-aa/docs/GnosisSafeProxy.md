# Solidity API

## IProxy

### masterCopy

```solidity
function masterCopy() external view returns (address)
```

## GnosisSafeProxy

### singleton

```solidity
address singleton
```

### constructor

```solidity
constructor(address _singleton) public
```

_Constructor function sets address of singleton contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _singleton | address | Singleton address. |

### fallback

```solidity
fallback() external payable
```

_Fallback function forwards all transactions and returns all received return data._

