// This example code is designed to quickly deploy an example contract using Remix.

pragma solidity 0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract NFBody is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;
    
    struct Body {
        uint256 strength;
        uint256 dexterity;
        uint256 constitution;
        uint256 intelligence;
        uint256 wisdom;
        uint256 charisma;
        uint256 experience;
        string name;
    }

    Body[] public bodies;
    mapping(bytes32 => string) requestToBodyTitle;
    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Polygon Mumbai
     * Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * LINK token address:                0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Key Hash: 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     */
    constructor() 
        VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
        ) public
    {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }

    
    /** 
     * Requests randomness from a user-provided seed
     ************************************************************************************
     *                                    STOP!                                         * 
     *         THIS FUNCTION WILL FAIL IF THIS CONTRACT DOES NOT OWN LINK               *
     *         ----------------------------------------------------------               *
     *         Learn how to obtain testnet LINK and fund this contract:                 *
     *         ------- https://docs.chain.link/docs/acquire-link --------               *
     *         ---- https://docs.chain.link/docs/fund-your-contract -----               *
     *                                                                                  *
     ************************************************************************************/
    //needs a numbered seedd and a string name
    function getRandomNumber(
        uint256 userProvidedSeed,
        string memory title
    ) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        requestToBodyTitle[requestId] = title;
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        randomResult = randomNumber;
        uint256 newId = bodies.length;
        uint256 strength = (randomNumber % 100);
        uint256 dexterity = ((randomNumber % 10000) / 100 );
        uint256 constitution = ((randomNumber % 1000000) / 10000 );
        uint256 intelligence = ((randomNumber % 100000000) / 1000000 );
        uint256 wisdom = ((randomNumber % 10000000000) / 100000000 );
        uint256 charisma = ((randomNumber % 1000000000000) / 10000000000);
        uint256 experience = 0;

        bodies.push(
            Body(
                strength,
                dexterity,
                constitution,
                intelligence,
                wisdom,
                charisma,
                experience,
                requestToBodyTitle[requestId]
            )
        );
    }
    
    function getCharacterStats(uint256 tokenId)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            bodies[tokenId].strength,
            bodies[tokenId].dexterity,
            bodies[tokenId].constitution,
            bodies[tokenId].intelligence,
            bodies[tokenId].wisdom,
            bodies[tokenId].charisma,
            bodies[tokenId].experience
        );
    }

    /**
     * Withdraw LINK from this contract
     * 
     * DO NOT USE THIS IN PRODUCTION AS IT CAN BE CALLED BY ANY ADDRESS.
     * THIS IS PURELY FOR EXAMPLE PURPOSES.
     */
    function withdrawLink() external {
        require(LINK.transfer(msg.sender, LINK.balanceOf(address(this))), "Unable to transfer");
    }
}