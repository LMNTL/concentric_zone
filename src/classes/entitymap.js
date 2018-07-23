const entities = [
    {
        type: 'trainFront',
        hp: 999,
        maxHp: 999,
        moveCost: 200,
        image: './trainFront.png',
        scripts: ["trainMove"]
    },
    {
        type: 'trainMiddle',
        hp: 999,
        maxHp: 999,
        moveCost: 200,
        image: './trainMiddle.png',
        scripts: ["trainMove"]
    },
    {
        type: 'trainBack',
        hp: 999,
        maxHp: 999,
        moveCost: 200,
        image: './trainBack.png',
        scripts: ["trainMove"]
    },
    {
        type: "cop",
        hp: 125,
        maxHp: 125,
        moveCost: 140,
        scripts: ['patrol', 'wander']
    }
]

const EntityMap = new Map();
for( let i = 0; i < entities.length; i++ ) {
    EntityMap.set( entities[i].type, entities[i] );
}

export default EntityMap;