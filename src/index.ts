import Graph from "./Classes/Graph";
import HashTable from "./Classes/HashTable";

(async () => {
    const HTable = await HashTable.SetUp();
    const GraphInstance = new Graph(HTable!);

    setTimeout(() => {
        // GraphInstance.removeEdge('66257a4c2451f51c2620854a', '66255ab469e7a2160cf7a926');
    }, 5000);
})();


// target: 66255ab469e7a2160cf7a926
// source: 66257a4c2451f51c2620854a
