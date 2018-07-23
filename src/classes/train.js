import { EntityFactory } from './entity.js';

export default class TrainLine {
    constructor(){
        this.zones = [];
        this.stops = [];
        this.entities = []
        this.startNode = null;
        this.endNode = null;
        this.entityFactory = new EntityFactory();
    }
    
    spawnTrain = ( tilegraph ) => {
        const properties = {        
            x: this.startNode.data.x,
            y: this.startNode.data.y + 2,
            z: this.startNode.data.z,
            direction: 'w'
        }
        this.entities.push( this.entityFactory.makeEntity( "trainFront", tilegraph, properties ) );
        properties.y -= 1;
        this.entities.push( this.entityFactory.makeEntity( "trainMiddle", tilegraph, properties ) );
        properties.y -= 1;
        this.entities.push( this.entityFactory.makeEntity( "trainBack", tilegraph, properties ) );
    }

    moveTrains = ( tilegraph, cost ) => {
        for( let k = 0; k < this.entities.length; k++ ) {
            const el = this.entities[k];
            el.energy += cost;
            if( el.energy > el.moveCost ){
                let timesMoved = Math.floor( el.energy / el.moveCost );
                let currentCoords = [ el.x, el.y, el.z ];
                el.energy %= el.moveCost;
                if( timesMoved ){
                    tilegraph.getNode( currentCoords ).data.contents = null;
                }
                for( let i = 0; i < timesMoved; i++ ){
                    currentCoords[1] += 1;
                    if( currentCoords[1] > this.endNode.data.y ){
                        console.log("despawned");
                        el.active = false;
                        break;
                    }
                }
                if( el.active ){
                    [ el.x, el.y, el.z ] = currentCoords;
                    tilegraph.getNode( currentCoords ).data.contents = el;
                }
            }
        };
        this.entities = this.entities.filter( el => el.active );
        if( this.entities.length == 0 ) this.spawnTrain( tilegraph );
    }
}