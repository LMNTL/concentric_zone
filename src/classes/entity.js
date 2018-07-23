import EntityMap from './entitymap.js';
const uuid = require('uuid/v4');

export default class Entity {
    constructor(options){
        this.id = uuid();
        this.type = options.type;
        this.active = true;
        this.x = options.x;
        this.y = options.y;
        this.z = options.z;
        this.hp = options.hp;
        this.maxHP = options.maxHp;
        this.energy = 0;
        this.moveCost = options.moveCost || 100;
        this.hostility = options.hostility || 0;
        this.image = options.image || './notFound.png';
        this.status = options.status || [];
        this.items = options.items || [];
        this.scripts = options.scripts || ['wander'];
    }
}

export class EntityFactory {
    constructor(){
        this.entityMap = EntityMap;
    }

    makeEntity = ( type, tilegraph, options ) => {
        let newEntity = new Entity( this.entityMap.get( type ) );
        Object.assign( newEntity, options );
        let coords = [ newEntity.x, newEntity.y, newEntity.z ].join(",");
        tilegraph.getNode( coords ).data.contents = newEntity;
        return newEntity;
    }
}