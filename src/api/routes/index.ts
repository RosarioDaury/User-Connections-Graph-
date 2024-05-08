import express from 'express';
import { getViewGraph, getGraphData } from '../controllers';
const Router: express.Router = express.Router();

Router.get('/', getViewGraph);
Router.get('/data', getGraphData);

export default Router
