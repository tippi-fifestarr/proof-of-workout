
pragma solidity ^0.5.0;

contract BCBC {

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
    
    
    mapping(uint => mapping(address => bool)) public idAddressVoted;
    
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
        // mapping(address => bool) addressVoted
        //again not too sure why we need to emit all this stuff...
    );
    
    //day2, realized i forgot a constructor function to create the challenge words string
    constructor (string memory _challengeWords) public {
        coach = msg.sender;
        challengeWords = _challengeWords;
        //the creator of the contract is the coach and the coach creates the challenge words
    }
    
    
    
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
  
        workoutCount ++;
    
        workouts[workoutCount] = Workout(workoutCount, 0, _videoHash, _title, _description, msg.sender, 0, 0);//, 0, 0)
        // Trigger an event (emitting with exactly the same values as above)
        emit WorkoutCreated(workoutCount, 0, _videoHash, _title, _description, msg.sender, 0, 0);//, 0, 0);
    }

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
     
        require(workout.creator != msg.sender);
        
        require(!idAddressVoted[_id][msg.sender]);
        
        idAddressVoted[_id][msg.sender] = true;
        
        // /@notice increments the counter for this workout, towards eventual threshold?
        workout.validateCounter++;
        
    }
    
    // need to add the killWorkout function
}