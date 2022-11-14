// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CyberWorld is ERC721Enumerable, Ownable {
    string baseURI;

    enum Classes {
        COP,
        PSYCHO,
        NOMAD
    }

    struct Character {
        uint8 classId;
        uint level;
    }

    mapping(uint256 => Character) public characters;

    event CharacterUpgraded(address owner, uint8 classId);
    event CharacterCreated(address owner, uint8 classId);

    constructor(string memory _initialBaseURI) ERC721("CyberWorld", "CBWRD") {
        baseURI = _initialBaseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function createNewCharacter(Classes classId) external payable {
        require(
            msg.value == 0.001 ether,
            "CyberWorld: Incorrect amount of ETH sent. Please send 0.001 ETH to mint your NFT."
        );
        uint256 currentSupply = totalSupply();
        Character memory playerCharacter = Character(uint8(classId), 1);
        characters[currentSupply + 1] = playerCharacter;
        _safeMint(msg.sender, currentSupply + 1);
        emit CharacterCreated(msg.sender, playerCharacter.classId);
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function upgradeCharacter(uint256 _tokenId) external payable {
        require(
            msg.sender == ownerOf(_tokenId),
            "CyberWorld: You are not the owner of the the NFT!"
        );
        require(
            msg.value == 0.0005 ether,
            "CyberWorld: Incorrect amount of ETH sent. Upgradig your character costs 0.0005 ETH"
        );
        Character storage characterToLevelUp = characters[_tokenId];
        require(
            characterToLevelUp.level == 1,
            "CyberWorld: You can only level up your character once."
        );
        characterToLevelUp.level = 2;
        emit CharacterUpgraded(msg.sender, characterToLevelUp.classId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token."
        );
        Character memory currentCharacter = characters[_tokenId];
        if (currentCharacter.level == 1) {
            return _nonUpgradedURI(currentCharacter.classId);
        } else {
            return _upgradedURI(currentCharacter.classId);
        }
    }

    function _nonUpgradedURI(uint8 classId)
        internal
        view
        returns (string memory)
    {
        return
            string.concat(_baseURI(), "/", Strings.toString(classId), ".json");
    }

    function _upgradedURI(uint8 classId) internal view returns (string memory) {
        return
            string.concat(
                _baseURI(),
                "/upgraded_",
                Strings.toString(classId),
                ".json"
            );
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }
}
