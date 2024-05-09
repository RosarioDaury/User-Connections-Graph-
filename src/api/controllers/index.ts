import { Response, Request } from "express";
import Graph from "../../Graph/Graph";
import HashTable from "../../Graph/HashTable";
import Logger from "../../Utils/Logger";

export const getViewGraph = async (req: Request, res: Response) => {
    res.render('index');
}

export const getGraphData  = async (req: Request, res: Response) => {
    try{
        const hashTableInstance = await HashTable.getInstance();
        const graphInstance = await Graph.getInstance(hashTableInstance);
        const graphData = graphInstance?.getForGraphView();
    
        res.json(graphData)
    } catch(error) {
        Logger.error('GET GRAPH DATA FAILED [CONTROLLER]');
        console.log(error);
    }
    
}

export const createEdge = async (req: Request, res: Response) => {
    try{
        const hashTableInstance = await HashTable.getInstance();
        const graphInstance = await Graph.getInstance(hashTableInstance);
        const {source, target} = req.body;

        graphInstance?.addEdge(source, target);

        res.send('NEW EDGE CREATED').status(200);
    } catch(error){
        Logger.error('CREATE EDGE FAILED [CONTROLLER]');
        console.log(error);
        res.send('EDGE CREATION FAILED').status(500);
    }
}

export const createNode = async (req: Request, res: Response) => {
    try {
        const hashTableInstance = await HashTable.getInstance();
        const graphInstance = await Graph.getInstance(hashTableInstance);
        const {firstName, lastName, username} = req.body;

        graphInstance?.addNode({firstName, lastName, username, Edges: []});

        res.send('NEW NODE CREATED').status(200);
    } catch(error) {
        Logger.error('CREATE NODE FAILED [CONTROLLER]');
        console.log(error);
        res.send('NODE CREATION FAILED').status(500);
    }
}

