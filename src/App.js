import React, { Component } from 'react';
import GUI from './components/gui.js';
import Gamescreen from './components/gamescreen.js';
import TileGraph from './classes/tilegraph.js';
import Zone from './classes/zone.js';
import Player from './classes/player.js';
import './App.css';


class App extends Component {
	constructor(props){
		super(props);
		this.state = {
      doneLoading: false,
      currentZone: '',
      gameTime: 0,
      playerX: 0,
      playerY: 0,
      playerZ: 0
    };
  }
  
  componentDidMount(){
    this.player = new Player();
    this.tilegraph = new TileGraph(100, 100);
    this.setState({
      doneLoading: true,
      currentZone: this.tilegraph.name
    });
  }

  updateGameTime = ( cost ) => {
    this.setState({
      gameTime: this.state.gameTime + cost
    });
  }
  
  movePlayer = ( x, y, z) => {
    this.setState({
      playerX: this.state.playerX + x,
      playerY: this.state.playerY + y,
      playerZ: ( this.state.playerZ + z ) % 3
    })
  }
	
  render() {
    return this.state.doneLoading ? (
      <div>
        <Gamescreen
          playerX={this.state.playerX}
          playerY={this.state.playerY}
          playerZ={this.state.playerZ}
          playerStatus={this.player.status}
          tilegraph={this.tilegraph}
          movePlayer={this.movePlayer}
          gameTime={this.state.gameTime}
          updateGameTime={this.updateGameTime}
        />
        <GUI
          hp={this.player.hp}
          maxHP={this.player.maxHP}
          currentZone={this.state.currentZone}
          gameTime={this.state.gameTime}
        />
      </div>
    ) : <div className='loader'>Loading...</div>;
  }
}

export default App;
