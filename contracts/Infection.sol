pragma solidity >=0.4.22 <0.8.0;

contract Infection {
    // Model a Candidate
    struct InfectedPerson {
        string key;
        uint timestamp;
    }

    // Store accounts that have voted
    mapping(address => bool) public alreadyInfected;
    // Store Infected people
    // Fetch Infected person
    mapping(address => struct) public infectedPeople;
    mapping(uint => address) public addreses;
    // Store Candidates Count
    uint public infectedPeopleCount;
    uint public addressesCount;

    // voted event
    event votedEvent (
        string indexed _infectedPersonId
    );


    function addMe (string memory _key, uint timestamp) public {

        // require that they haven't voted before
        require(!alreadyInfected[msg.sender]);

        infectedPeople[msg.sender] = _key;
        alreadyInfected[msg.sender] = true;

        for(uint i = 0; i < addressesCount; i++){
            if(addreses[i] == msg.sender){
                delete addreses[i];
            }
        }
        addreses[addressesCount] = msg.sender;
        addressesCount ++;
        infectedPeopleCount ++;
        // trigger voted event
        emit votedEvent(_key);
    }


    function removeMe (string memory _key) public {
        // require that they haven't voted before
        require(alreadyInfected[msg.sender]);

        delete infectedPeople[msg.sender];

        alreadyInfected[msg.sender] = false;

        infectedPeopleCount --;
        // trigger voted event
        emit votedEvent(_key);
    }
}
