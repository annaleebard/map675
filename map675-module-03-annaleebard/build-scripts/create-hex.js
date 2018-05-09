const fs = require('fs');
const turf = require('@turf/turf');
const chalk = require('chalk');

fs.readFile(__dirname + '/../project-files/churches.json', 'utf8', (err, data) => {
    if(err) throw err;

    // remember to parse the incoming GeoJSON text
    const churches = JSON.parse(data);

    createHexGrid(churches);
});

function createHexGrid(churches) {

    // we could use turf to get a bounding box of our points
    // const bbox = turf.bbox(churches)
    // console.log(bbox) // [ -170.7322222, -14.3355556, 163.0283333, 64.9544444 ]

    // but we can concentrate the map on the continental US
    // to keep our example more simple, so let's just hardcode a bbox
    // [ minX, minY, maxX, maxY ]
    const bbox = [-125, 23, -65, 50];
    // define our cell Diameter
    const cellSide = .5;
    // define units
    const options = { units: 'degrees' };
    // create the hex polygons
    let hexgrid = turf.hexGrid(bbox, cellSide, options);
   
    sumPoints(churches, hexgrid);
}

function sumPoints(churches, hexgrid) {

    // option for turf.booleanPointInPolygon()
    // and other variables don't 
    // need redefined with each loop
    const options = {
        ignoreBoundary: true
    }

    let count;

    // // loop through each hex in hexgrid
    turf.featureEach(hexgrid, (hex, i) => {
        // reset counter to zero for each hex
        count = 0;
        
        // loop through each point point in churches
        turf.featureEach(churches, (point) => {
            
            // if the point is inside the hex
            if(turf.booleanPointInPolygon(point, hex, options)) {
                count++; // increment by one
            }
        })
        
        // output progress
        console.log(chalk.green("adding count of " + count + " to hex #: " + i));
        
        // update hex properties with count
        hex.properties = Object.assign({}, hex.properties, { "count": count });

    })

    console.log(chalk.blue('ready to write the hexgrid to file'));

    // truncate the coordinate precision to reduce file size
    hexgrid = turf.truncate(hexgrid, {
        precision: 5 
    })

    writeHexGrid(hexgrid)
}

function writeHexGrid(hexgrid) {

    // stringify the hexgrid and write to file
    fs.writeFile(__dirname + '/../data/hexgrid.json', JSON.stringify(hexgrid), 'utf-8', (err) => {
        if(err) throw err;
        console.log(chalk.green('done writing file!'));
    });
}