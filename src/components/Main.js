import React, { Component } from 'react';
// import Identicon from 'identicon.js';

class Main extends Component {

  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              {/* here is where we get and display words */}
              <h3 className="text-center">challengeWords: 
                <br></br>
                {this.props.challengeWords}</h3>
              <h2>Share Workout</h2>
              <form onSubmit={(event) => {
                event.preventDefault()
                const description = this.workoutDescription.value
                const title = this.workoutTitle.value
                this.props.uploadWorkout(description, title)
              }} >
                <input type='file' accept=".mp4, .mkv .ogg .wmv" onChange={this.props.captureFile} style={{ width: '250px' }} />
                {/* <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.props.captureFile} /> */}
                  <div className="form-group mr-sm-2">
                  <br></br>
                      <input
                        id="workoutTitle"
                        type="text"
                        ref={(input) => { this.workoutTitle = input }}
                        className="form-control"
                        placeholder="Workout Title..."
                        required />
                    <br></br>
                      <input
                        id="workoutDescription"
                        type="text"
                        ref={(input) => { this.workoutDescription = input }}
                        className="form-control"
                        placeholder="Workout description..."
                        required />
                  </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Upload!</button>
              </form>
              <p>&nbsp;</p>
              { this.props.workouts.map((workout, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      {/* <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(workout.author, 30).toString()}`}
                      /> */}
                      <small className="text-muted">{workout.creator}</small>
                    </div>
                    <ul id="workoutList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <h5>title: {workout.title}</h5>
                        <div className="embed-responsive embed-responsive-16by9" style={{ maxHeight: '768px'}}>
                          <video
                            src={`https://ipfs.infura.io/ipfs/${workout.hash}`}
                            controls
                          >
                          </video>
                        </div>
                        <p>{workout.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1">
                          Approve 
                          <button
                            className="btn btn-link btn-sm pt-0"
                            name={workout.id}
                            onClick={(event) => {
                              // send the id of workout to the validateWorkout func
                              this.props.validateWorkout(event.target.name)
                            }}
                          >
                            ✅
                            {workout.validateCounter} 
                          </button>
                          Reject: 
                          <button
                            className="btn btn-link btn-sm pt-0"
                            name={workout.id}
                            onClick={(event) => {
                              // send the id of workout to the killWorkout func
                              this.props.killWorkout(event.target.name)
                            }}
                          >
                            ❌
                            {workout.killCounter}
                          </button>
                          
                        </small>
                        <small className="float-center mt-1 text-muted">
                          TIPS: {window.web3.utils.fromWei(workout.tipAmount.toString(), 'Ether')} ETH
                        </small>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={workout.id}
                          onClick={(event) => {
                            let tipAmount = window.web3.utils.toWei('0.1', 'Ether')
                            console.log(event.target.name, tipAmount)
                            this.props.tipWorkoutCreator(event.target.name, tipAmount)
                          }}
                        >
                          TIP 0.1 ETH
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;