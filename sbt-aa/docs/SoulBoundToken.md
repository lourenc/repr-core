# Solidity API

## SoulBoundToken

### multisigOwner

```solidity
mapping(uint256 => address) multisigOwner
```

Storage

### nextTokenId

```solidity
uint256 nextTokenId
```

### AddressEqZero

```solidity
error AddressEqZero()
```

Errors

### CallerNotMultisigOwner

```solidity
error CallerNotMultisigOwner(address _caller, uint256 _tokenId)
```

### Inaccessible

```solidity
error Inaccessible()
```

### constructor

```solidity
constructor() public
```

External functions

### mint

```solidity
function mint(address _recipient) external returns (uint256 tokenId)
```

### burn

```solidity
function burn(uint256 _tokenId) external
```

### transferFrom

```solidity
function transferFrom(address, address, uint256) public virtual
```

Lock of transfer

