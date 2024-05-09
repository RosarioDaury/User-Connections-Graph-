import express from 'express';
import { getViewGraph, getGraphData, createEdge, createNode } from '../controllers';
const Router: express.Router = express.Router();

// GET
Router.get('/', getViewGraph);
Router.get('/data', getGraphData);

// POST
Router.post('/createEdge', createEdge);
Router.post('/createNode', createNode)

export default Router
