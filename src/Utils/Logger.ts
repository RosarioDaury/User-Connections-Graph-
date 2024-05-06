import {blue, red, green, yellow} from 'chalk';

const success = (content: string) => {
    console.log(green.bold('[SUCCESS]', content))
}

const error = (content: string) => {
    console.log(red.bold('[ERROR]', content))
}

const info = (content: string) => {
    console.log(blue('[INFO]', content))
}

const warning = (content: string) => {
    console.log(yellow('[WARNING]', content)); 
}

const Logger = {
    success,
    error,
    info,
    warning
}

export default Logger;
