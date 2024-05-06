import User from "../Data/Models/User";
import { IUser, IUserSchema } from "../Utils/Interfaces/User";
import Logger from "../Utils/Logger";
import HashTable from "./HashTable";

class GraphNode {
    public Id: string;
    public AdyacentNodes: GraphNode[] = [];
    constructor(Id: string){
        this.Id = Id;
    }   

    public addAdyacentNode(Id: string): GraphNode {
        // CREATE NEW NODE WHICH IS SOME OTHER NODE'S ADYACENT NODE
        const node: GraphNode = new GraphNode(Id);
        this.AdyacentNodes.push(node);
        return node;
    }

    public AddAdyacentNodeDirect(node: GraphNode): GraphNode {
        this.AdyacentNodes.push(node);
        return node;
    }

    public removeAdyacentNode(id: string): void {
        const index = this.AdyacentNodes.findIndex(node => node.Id == id);
        this.AdyacentNodes.splice(index, 1);
    }
}

export default class Graph {
    public head: GraphNode | null = null;
    private arrayNodes: GraphNode[] = [];
    private hashTable: HashTable<IUser>;

    constructor(hashTable: HashTable<IUser>){
        this.hashTable = hashTable
        this.setHead()
    }

    private async setHead(): Promise<void> {
        try{
            // GET FIRST NODE TO USE AS HEAD, POINT OF ACCESS FOR THE NODE
            const head: IUser[] = await User.find().limit(1) as IUser[];
            if(head.length > 0){
                const headNode = new GraphNode(head[0].id);
                const headEdges = head[0].Edges;

                //* AFTER HEAD IS CREATED, ALSO CREATE ALL THE ADYACENT NODES AND RELATE WITH THE HEAD NODE USING NODE INTERFACE
                headEdges.forEach(el => {
                    let node = headNode.addAdyacentNode(el);
                    this.arrayNodes.push(node);
                })  
                
                //* SAVE HEAD NODE TO MAKE SURE IS NOT INSTANCIATED AGAIN IN THE FUTURE
                this.arrayNodes.push(headNode);
                this.head = headNode;

                //* COMPLETE THE GRAPH FROM THE EDGES OF THE H GRAPH'S HEAD WHICH IS ALREADY CREATED
                this.buildGraph(headEdges);
            }
        } catch(error){
            Logger.error('GRAPH HEAD SETTING FAILED')
        } 
    }

    private async buildGraph(headAdyacents: string[]): Promise<void> {   
        try{
            let nodes = headAdyacents;

            for(const node of nodes){
                //* GET CURRENT NODE FROM HASHTABLE (FAST ACCESS CACHED DB)
                const DbNode: IUser | null = this.hashTable.get(node);
                const edges = DbNode?.Edges || [];
                //* LOOK FOR CURRENT NODE IN ARRAY WHERE INSTANCIATED NODES ARE SAVED
                const instance: GraphNode = this.arrayNodes.filter(el => el.Id == node)[0];
    
                edges.forEach(adyacent => {
                    //* GET ADGES FROM ARRAY OF INSTANCIATED NODES
                    let instaceFromArray: GraphNode | null = this.arrayNodes.filter(el => el.Id == adyacent)[0];
                    // IF EDGE NODES ALREADY EXIST DO NOT INSTANCIATE AGAIN
                    if(instaceFromArray){
                        instance.AddAdyacentNodeDirect(instaceFromArray);
                    } else {
                        console.log('CREATING NEW INSTANCE OF A NODE')
                        const node: GraphNode = instance.addAdyacentNode(adyacent);
                        this.arrayNodes.push(node);
                        nodes.push(adyacent);
                    }
                })
            }
        } catch(error) {
            Logger.error('BUILDING GRAPH FAILED')
        }
        
    }

    public getAll(): void {
        try{
            if(!this.head){
                return
            }
            let nodes: Array<GraphNode | null> = [this.head]
            const visitedNodes: Array<string> = [];
            
            while(nodes.length > 0) {
                const node = nodes.shift();
                if(!visitedNodes.includes(node!.Id)) {
                    console.log(node);
                    node?.AdyacentNodes.forEach((el: GraphNode) => {
                        nodes.push(el);
                    })
                    visitedNodes.push(node!.Id)
                }
            }

        } catch(error) {
            Logger.error('GETTING ALL NODES FAILED [GRAPH]')
            console.log(error)
        }
        
    }

    public findOne(id: string): GraphNode | null  {
        try {
            if(!this.head){
                return null
            }
            let nodes: Array<GraphNode | null> = [this.head]
            const visitedNodes: Array<string> = [];
            
            while(nodes.length > 0) {
                const node = nodes.shift();
                if(!visitedNodes.includes(node!.Id)) {
                    if(node?.Id == id) {
                        return node
                    }
                    node?.AdyacentNodes.forEach((el: GraphNode) => {
                        nodes.push(el);
                    })
                    visitedNodes.push(node!.Id)
                }
            }

            return null
        } catch(error) {
            Logger.error('FIND ONE NODE FAILED [GRAPH]')
            return null
        }
    }

    public addEdge(source: string, target: string): void {
        try {
            const sourceNode = this.findOne(source);

            if(sourceNode) {
                //* VALIDATES IF NODE DO NOT HAVE THAT EDGE ALREADY
                if(sourceNode.AdyacentNodes.some(adyacent => adyacent.Id === target)) {
                    return
                }
                const targetNode = this.findOne(target);

                if(targetNode) {
                    sourceNode.AddAdyacentNodeDirect(targetNode);
                    this.hashTable.addEdge(source, target);
                }
                
            }
        } catch(error) {    
            Logger.error('ADD EDGE FAILED [GRAPH]')
        }
    }

    public removeEdge(source: string, target: string): void {
        try{
            const sourceNode = this.findOne(source);
            if(sourceNode) {
                //* VALIDATES IF NODE HAVE THAT EDGE ALREADY TO REMOVE IT
                if(!sourceNode.AdyacentNodes.some(adyacent => adyacent.Id === target)) {
                    return
                }
                // REMOVE FROM GRAPH
                sourceNode.removeAdyacentNode(target);
                // REMOVE FROM HASH TABLE
                this.hashTable.removeEdge(source, target);
            }
        } catch(error) {
            Logger.error('REMOVE EDGE FAILED [GRAPH]')
        }
    }
}

