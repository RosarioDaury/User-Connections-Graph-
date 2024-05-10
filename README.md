A graph to represent the relationship between users, where each edge represents the relationship between two users or nodes.

I coded everything from scratch using TypeScript, running it on Node.js. To add an extra layer of complexity and efficiency, I decided to use a NoSQL database (MongoDB). 
This means that at the time of creation, or in this case, once the server is up, the graph constructs itself using a BFS (Breath First Search) algorithm from the database data. 
This approach ensures that the graph is always up to date and reflects the most recent relationships between users.

In this opportunity used D3.js to create the Grafical Representation of our Graph dinamically.

![image](https://github.com/RosarioDaury/User-Connections-Graph-/assets/94021730/3dd26ef6-ebae-4f84-b772-80a429af8d72)
![image](https://github.com/RosarioDaury/User-Connections-Graph-/assets/94021730/655ef76b-ca93-4174-a43b-42342a6e0af0)
