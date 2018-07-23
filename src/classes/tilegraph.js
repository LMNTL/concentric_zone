import { resolve } from 'path';
import TrainLine from './train.js';

const createGraph = require('ngraph.graph');
const pathfinder = require('ngraph.path');
const uuid = require('uuid/v4');

const randomRange = (a, b) => {
    return ( ( b - a ) * Math.random() ) + a;
}

const randomIntRange = (a, b) => {
    return Math.floor( randomRange( a, b ) );
}

class TileGraph {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.id = uuid();
        this.trains = [];
        this.name = this.generateName();
        this.graph = createGraph();
        this.path = pathfinder.aStar( this.graph );
        this.constructGraph( x, y );
        this.makeTrainLines();
        this.trains.forEach( el => el.spawnTrain( this.graph ) );
    }

    static idToString = (x, y, z) => {
        return `${x},${y},${z}`;
    }

    makeTrainLines = () => {
        const trainTracks = {
            type: 'tracks',
            image: './trackStraight.png',
            contents: null,
            propertyValue: 400,
            influence: 1,
            orientation: 'e'
        }
        for(let i = 0 /*randomIntRange(5, 10)*/; i >= 0; i--){
            let position = randomIntRange(0,99);
            if( i == 0 ) position = 2;
            const start = [ position, 0, 1 ];
            const end = [position, 99, 1];
            const vector = [ 0, 99, 0 ];
            this.addLine( start, vector, trainTracks, 300);
            const trainline = new TrainLine();            
            trainline.startNode = this.graph.getNode( start.join(",") );
            trainline.endNode = this.graph.getNode( end.join(",") );
            this.trains.push(trainline);
        }
    }

    totalPropertyValue = () => {
        let sum = 0;
        this.graph.forEachNode( node => {
            sum += node.data.propertyValue;
        });
        return sum;
    }

    tickEconomy = () => {
        return new Promise( (resolve, reject) => {
            this.graph.forEachNode( node => {
                this.graph.forEachLinkedNode(node.id, ( linkedNode, link ) => {
                    const influenceFactor = node.data.influence / linkedNode.data.influence;
                    const transfer = randomRange( -influenceFactor, influenceFactor );
                    node.data.propertyValue += transfer;
                    linkedNode.data.propertyValue -= transfer;
                })
                if( this.graph.getNode("0,0,0").data.propertyValue != 200 ){
                    resolve( "econ tick" );
                } else {
                    reject( "econ tick failed" );
                }
            })
        });
    }

    tickTrains = ( cost ) => {
        this.trains.forEach( train => {
            train.moveTrains( this.graph, cost );
        });
    }

    distance = ( coords1, coords2 ) => {
        let components = [];
        for ( let i = 0; i < coords1.length && i < coords2.length; i++ ) {
            components.push( coords1[i] - coords2[i] ); 
        }
        const componentSum = components.reduce( (acc, cur) => {
            return acc + cur*cur;
        });
        return Math.sqrt( componentSum );
    }

    getCost = ( here, there ) => {
        return( this.graph.getLink( here.join(","), there.join(",") ).data.weight );
    }

    static randomDirection = () => {
        const directions = ['n','e','s','w']
        return directions[ Math.floor(randomRange(0, 4)) ];
    }

    constructGraph = ( x, y ) => {
        for( let i = 0; i < x; i++ ) {
            for( let k = 0; k < y; k++ ) {
                this.graph.addNode( `${i},${k},0`, {
                    type: 'road',
                    image: './roadtile.png',
                    x: i,
                    y: k,
                    z: 0,
                    contents: null,
                    orientation: TileGraph.randomDirection(),
                    propertyValue: 200,
                    influence: randomRange(1, 2)
                });
            }
        }
        this.graph.addNode( '2,2,1', {
            type: 'road',
            image: './roadtile.png',
            x: 2,
            y: 2,
            z: 2,
            contents: null,
            orientation: TileGraph.randomDirection(),
            propertyValue: 200,
            influence: 2
        });
        this.addEdges();
    }

    addLine = ( coords, vector, node, linkWeight ) => {
        const currentCoords = [...coords];
        const lineIndex = vector.findIndex( el => el > 0 );
        const nodeCount = Math.abs( vector [lineIndex] );
        for( let i = 0; i <= nodeCount; i++ ){
            
            const nodeId = currentCoords.join(',');
            //if( !this.graph.getNode( nodeId ) ){
                this.graph.addNode( nodeId,{
                    ...node,
                    x: currentCoords[0],
                    y: currentCoords[1],
                    z: currentCoords[2],
                } );
                
            //} else {
            //    console.log("overlap when adding line")
            //}
            if( i > 0 ){            
                const previousId = currentCoords.map( (el, ind) => { return el + vector[ind]/nodeCount }).join(",");
                
                this.graph.removeLink( this.graph.getLink( nodeId, previousId ) );
                this.graph.addLink( nodeId, previousId, { weight: linkWeight } );
                
                this.graph.removeLink( this.graph.getLink( previousId, nodeId ) );
                this.graph.addLink( previousId, nodeId, { weight: linkWeight } );
                
            }
            currentCoords[ lineIndex ] += vector[ lineIndex ] / nodeCount;
        }
    }

    addEdges = () => {
        this.graph.forEachNode((node) => {
            const origin = node.id.split(',').map(el => parseInt(el) );
            for( let i = -1; i <= 1; i += 2) {
                if( this.isInBounds( origin[0] + i, origin[1] ) ) {
                    this.graph.addLink( node.id, TileGraph.idToString( origin[0] + i, origin[1],  0 ), { weight: 100 } );
                }
            }
            for( let k = -1; k <= 1; k += 2) {
                if( this.isInBounds( origin[0], origin[1] + k ) ) {
                    this.graph.addLink( node.id, TileGraph.idToString( origin[0], origin[1] + k,  0 ), { weight: 100 } );
                }
            }
        });
    }

    isInBounds = ( x, y ) => {
        return ( x >= 0 && x < this.x && y >= 0 && y < this.y );
    }

    getAdjacentNodes = ( x, y, z ) => {
        const adjacentList = [ this.graph.getNode( `${x},${y},${z}` ) ];        
        if( x > 0 ) {
            adjacentList.push( this.graph.getNode( `${x - 1},${y},${z}` ) );
        }
        if( x < this.x - 1 ) {
            adjacentList.push( this.graph.getNode( `${x + 1},${y},${z}` ) );
        }
        if( y > 0 ) {
            adjacentList.push( this.graph.getNode( `${x},${y - 1},${z}` ) );
        }
        if( y < this.y - 1 ) {
            adjacentList.push( this.graph.getNode( `${x},${y + 1},${z}` ) );
        }
        return adjacentList;
    }

    getNodeSquare = ( x, y, z, radius ) => {
        const nodeList = [ ];
        for( let currentX = x - radius; currentX <= x + radius; currentX++ ) {
            for( let currentY = y - radius; currentY <= y + radius; currentY++ ) {
                if( this.isInBounds( currentX, currentY ) ) {
                    nodeList.push( this.graph.getNode( `${currentX},${currentY},${z}` ) );
                }
            }
        }
        return nodeList !== [] ? nodeList : null;
    }

    mapAdjacents = ( x, y, callback ) => {
        const adjacentTiles = this.getAdjacentNodes( x, y );
        return adjacentTiles.map( el => callback( el ) );
    }

    randomElement = ( array ) => {
        return array[ Math.floor( Math.random() * array.length ) ];
    }
    
    generateName = () => {
        const prefixes = ["Little", "New", "Old", "North", "West", "East", "South", "Mount"];
        const names = ["Harvey","Malcolm","Rivera","Edge","Glen","Windy","Walnut","Oak", "High"];
        const suffixWords = ["City","Village","Park","Fields","View","Heights"];
        const suffixFragments = ["brook","ville","dale","wood","town","side","burg"];
        const scheme = Math.floor( Math.random() * 3 );
        switch(scheme){
            case 0:
                return this.randomElement( names ) + this.randomElement( suffixFragments );
                break;
            case 1:
                return this.randomElement( prefixes ) + " " + this.randomElement( names );
                break;
            case 2:
                return this.randomElement( names ) + " " + this.randomElement( suffixWords );
                break;
            default:
                return "Outskirts";
                break;
        }
    }
}

export default TileGraph;