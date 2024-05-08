import express from 'express';
import Logger from './Utils/Logger';
import 'dotenv/config';
import { engine } from 'express-handlebars';
import path from 'path';
import Router from './api/routes';

const App: express.Application = express();

App.engine('handlebars', engine({defaultLayout: false}));
App.set('view engine', 'handlebars');
App.set('views', path.join(__dirname, 'api/views'));

App.use(Router);

App.listen(process.env.PORT, () => {
    Logger.info(`SERVER RUNNING ON PORT ${process.env.PORT}`)
})

