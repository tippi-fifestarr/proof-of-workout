//trying 6.6
pragma solidity ^0.6.6;

//contract begins with allocating memory and variables
contract BCBC {
    //keep track of all created workouts
    //strings in an array, filled in when constructing contract
    string public challengeWords;
    //constructor function will assign me(msg.sender) to this var
    address public coach;
    
    //store videos
    //map the index (videocount) of the workout struct
    //keep track of how many videos (for looping?)
    uint public workoutCount = 0; //used as index for workouts
    //keep track of the _____ as a map of Workout structs
    mapping(uint => Workout) public workouts;
    
    //struct of video Data
    struct Workout {
        uint id;  //index based on current videoCount
        uint tipAmount; //keep track of total money tipped to creator for this workout
        string hash; //stringy hash
        string title; //of course we need a non-empty title
        string description; //why not?
        address payable creator;
        //group types together to save on gas
        uint8 validateCounter; //how many checks
        uint8 killCounter; //how many [X] not valid!
    }
    
    //counter variable, shoutout to Marek from ETHWorks for the brilliant help
    //this means: take the index/id (workoutCount) as key and the value is another mapping with the
    //address of the voter and a true false value (see validateWorkout()) line ~161
    //change this only when validateWorkout or killWorkout is called
    mapping(uint => mapping(address => bool)) public idAddressVoted;
    //honestly not sure if the event needs to have all the exact parts of a Workout...
    //notice: the () not {} and , not ;     
    event WorkoutCreated(
        uint id,  //index based on current videoCount
        uint tipAmount, //keep track of total money tipped to creator for this workout
        string hash, //stringy hash
        string title, //of course we need a non-empty title
        string description, //why not?
        address payable creator, //, dont forget 
        //group types together to save on gas
        uint8 validateCounter, //how many checks
        uint8 killCounter //, //how many [X] not valid!
        // //to prevent double voting, we need to keep track of who has validated
        // mapping(address => bool) addressVoted //mapping to let us check/switch on vote
    );
    
    //this is also an emitable event, for when its tipped
    event WorkoutTipped(
        uint id,  
        uint tipAmount,
        string hash, 
        string title, 
        string description, 
        address payable creator, //,
        uint8 validateCounter,
        uint8 killCounter //, 
    );
    
    //day2, realized i forgot a constructor function to create the challenge words string
    constructor (string memory _challengeWords) public {
        coach = msg.sender;
        challengeWords = _challengeWords;
        //the creator of the contract is the coach and the coach creates the challenge words
    }
    
    ///@dev possibly unnecessary?
    //mapping of killed workouts (MVP lets say recieving 3 X votes)
    // mapping(uint => bool) workoutIsKilled; //bool defaults to false, on 3 votes change this to true
    //write a modifier function for onlyAlive?  maybe later...probably not neccessary...

    //must pass in _videoHash from IPFS and the workout title, description
    function uploadWorkout(string memory _videoHash, string memory _title, string memory _description) public payable {
        // Make sure the video hash exists
        //"validate the hash"
        require(bytes(_videoHash).length > 0);
        // Make sure workout title exists
        require(bytes(_title).length > 0);
        // Make sure workout description exists
        require(bytes(_description).length > 0);
        // Make sure uploader address exists
        //double check this one in my mocha testing
        require(msg.sender!=address(0));
  
        //after requirements do the "upload" thing
        //the first mapping of workouts is one Workout datastructure
        // Increment workout id/index
        workoutCount ++;

        // Add workoutVideo hash to the contract
        //to create a new Workout, be 100% to pass in the parameters in the exactly right order
        //? -- see line ~21
        workouts[workoutCount] = Workout(workoutCount, 0, _videoHash, _title, _description, msg.sender, 0, 0);//, 0, 0)
        // Trigger an event (emitting with exactly the same values as above)
        emit WorkoutCreated(workoutCount, 0, _videoHash, _title, _description, msg.sender, 0, 0);//, 0, 0);
    }

    //tip images of valid workout id
    //this function will a .send() transaction with ETH value
    function tipWorkoutCreator(uint _id) public payable {
        //make sure id is valid (it cant be 0 or more than the total workouts)
        require(_id > 0 && _id <= workoutCount);
        //fetch & read workout, its in memory locally
        Workout memory _workout = workouts[_id];
        //find the author/creator and set it 
        address payable _creator = _workout.creator;
        //transfer to the owner of the workouot!
        // _author.transfer(1 wei);
        //don't hard code it lets just send in how much they sent
        _creator.transfer(msg.value);

        // increase that workouts' tip amount (OTC!)
        _workout.tipAmount = _workout.tipAmount + (msg.value);
        //update the workout (back in the mapping)
        workouts[_id] = _workout;
        //emit the event 
        // Trigger an event (emitting with exactly the same values as above)
        emit WorkoutTipped(
            _id, 
            _workout.tipAmount, 
            _workout.hash, 
            _workout.title, 
            _workout.description, 
            _creator,
            _workout.validateCounter, 
            _workout.killCounter 
            );
    }
    
    function validateWorkout(uint _id) public {
    ///@learn "storage" we want to manipulate the copy of struct thats in storage
        Workout storage workout = workouts[_id];
     // /@notice we are making sure the caller of func is not the creator
        // /@dev requirements can appear wherever you want in a function, isn't that nice? feel free to blockroad
        require(workout.creator != msg.sender);
        // /@param: at the index in the requests struct, check if addressVoted for the message.sender is 
        // /@dev !TRUE =not true
        
        //***ERROR*** cannot save a mapping inside a struct?
        //correct, though the explaination is outside the scope of the comments section
        // https://www.reddit.com/r/ethdev/comments/lr0f26/struct_containing_a_nested_mapping_cannot_be/
        //https://medium.com/coinmonks/solidity-tutorial-all-about-mappings-29a12269ee14
        // require(!workout.addressVoted[msg.sender]);
        //if i'm right, this requires FALSE for the mapping at _id[address of the msg.sender]
        require(!idAddressVoted[_id][msg.sender]);
        //***ERROR*** cannot save a mapping inside a struct?
        // /@notice preventing double voting
        // workout.addressVoted[msg.sender] = true;
        idAddressVoted[_id][msg.sender] = true;
        
        // /@notice increments the counter for this workout, towards eventual threshold?
        workout.validateCounter++;
    }
    
    function killWorkout(uint _id) public {
        Workout storage workout = workouts[_id];
        //allow creator to kill their workout
        // require(workout.creator != msg.sender);
        
        require(!idAddressVoted[_id][msg.sender]);
        
        idAddressVoted[_id][msg.sender] = true;
        
        // /@notice increments the counter for this workout, towards eventual threshold?
        workout.killCounter++;
    }
}