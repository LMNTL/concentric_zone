const createGraph = require('ngraph.graph');
const uuid = require('uuid/v4');

export default class Zone{
    constructor(...args){
        this.id = uuid();
        this.graph = createGraph();
        args.forEach( el =>
            this.graph.addNode( el.id ,{
                name: el.name
            })
        );
    }

}