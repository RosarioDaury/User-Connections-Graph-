import { Response, Request } from "express";
import Graph from "../../Graph/Graph";
import HashTable from "../../Graph/HashTable";

export const getGraphData  = async (req: Request, res: Response) => {
    const hashTableInstance = await HashTable.getInstance();
    const graphInstance = await Graph.getInstance(hashTableInstance);
    const graphData = graphInstance?.getForGraphView();

    res.json(graphData)
}

export const getViewGraph = async (req: Request, res: Response) => {
    res.render('index');
}

