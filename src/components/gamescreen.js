import React, { Component } from 'react';
import './gamescreen.css';

class Gamescreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            moving: '',
            playerDirection: 's'
        }
        this.zGrow = 0.4;
        this.zBlur = 2;
        this.nextEconTick = 1000;
        this.nextCoords = [];
    }

    componentDidMount(){
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    tick = ( cost ) => {
        this.props.tilegraph.tickTrains( cost );
        this.props.updateGameTime( cost );
        if( this.props.gameTime > this.nextEconTick ){
            this.props.tilegraph.tickEconomy()
                .then( fulfilled => {
                    console.log(fulfilled)
                })
                .catch( error => {
                    console.log(error);
                });
            this.nextEconTick += 1000;
        }
    }

    handleKeyDown = (event) => {
        let moved = true;
        const x = this.props.playerX;
        const y = this.props.playerY;
        let direction;
        let movementVector = null;
        switch(event.keyCode){
          case 100:
            movementVector = [-1, 0, 0];
            direction = 'west';
            break;
          case 98:
            movementVector = [0, 1, 0];
            direction = 'south';
            break;
          case 101:
            movementVector = [0, 0, 1];
            direction = 'up';
            break;
          case 102:
            movementVector = [1, 0, 0];
            direction = 'east';
            break;
          case 104:
            movementVector = [0, -1, 0];
            direction = 'north';
            break;
          default:
            break;
        }
        if( movementVector && this.props.tilegraph.isInBounds( x + movementVector[0], y + movementVector[1] ) ) {
            this.moveWorld( movementVector[0], movementVector[1], movementVector[2], direction );            
        }
      }

    moveWorld = ( x, y, z, direction ) => {
        if( !this.state.moving ){
            this.setState({
                moving: `moving ${direction}`,
                playerDirection: direction[0]
            });
            this.nextCoords = [ x, y, z ];
            setTimeout( this.stopMoving, 200 );
        }      
        const current = [ this.props.playerX, this.props.playerY, this.props.playerZ ];
        const next = [ this.props.playerX + x, this.props.playerY + y, this.props.playerZ + z ];
        const cost = this.props.tilegraph.getCost( current, next );
        this.tick(cost);
    }

    stopMoving = (event) => {
        this.setState({ moving: `` });
        this.props.movePlayer( this.nextCoords[0], this.nextCoords[1], this.nextCoords[2] );
    }

    render = () => {
        return (
            <div>
                <div
                    className={'middle worldGrid ' + this.state.moving}
                >
                    {this.props.tilegraph.getNodeSquare( this.props.playerX, this.props.playerY, this.props.playerZ, 3 ).map( (el) => {
                        return el ? (
                            <div
                                className={"tile " + el.data.orientation}
                                key={el.id}
                                style={{
                                    gridColumnStart: `${ el.data.x - this.props.playerX + 4 }`,
                                    gridColumnEnd: `${ el.data.x - this.props.playerX + 5 }`,
                                    gridRowStart: `${ el.data.y - this.props.playerY + 4 }`,
                                    gridRowEnd: `${ el.data.y - this.props.playerY + 5 }`,
                                    backgroundImage: `url(${el.data.image})`
                            }}
                            >
                            </div>
                    ) : null })}                   
                </div>
                <div
                    className={'near worldGrid ' + this.state.moving}
                >
                    {this.props.tilegraph.getNodeSquare( this.props.playerX, this.props.playerY, this.props.playerZ + 1, 3 ).map( (el) => {
                        return el ? (
                            <div
                                className={"tile " + el.data.orientation}
                                key={el.id}
                                style={{
                                    gridColumnStart: `${ el.data.x - this.props.playerX + 4 }`,
                                    gridColumnEnd: `${ el.data.x - this.props.playerX + 5 }`,
                                    gridRowStart: `${ el.data.y - this.props.playerY + 4 }`,
                                    gridRowEnd: `${ el.data.y - this.props.playerY + 5 }`,
                                    backgroundImage: `url(${el.data.image})`
                                }}                         
                            >
                                { el.data.contents ?
                                    <img
                                        className={ 'entity ' + el.data.contents.direction }
                                        src={el.data.contents.image }
                                    />
                                : null }
                            </div>
                        ) : null;
                    })}
                </div>
                <img
                    className={"playerSprite " + this.props.playerStatus + " " + this.state.playerDirection}
                    src='./playerSprite.png'
                />
            </div>
        );
    }
}
export default Gamescreen;