const fs = require("fs");
const csv = require("csvtojson");
const chalk = require("chalk");
const GJV = require("geojson-validation");

// create a readStream
let readableStream = fs.createReadStream(__dirname + "/../project-files/NationalFile_20180401.txt");

// object with which to build our GeoJSON
let geojson = {
    "type": "FeatureCollection",
    "features": []
}
 // declare feature here
 // so doesn"t need redefining below for each feature
let feature,
    featureCount = 0; // counter variable to keep track below

// begin a console.time object
console.time("processing time: ")

// csvtoJson method
csv({
    delimiter: "|",
    workerNum: 4
})
.fromStream(readableStream) // reads from stream
.on("json",(jsonObj, i)=>{ // converts to json
    if((i % 100000) == 0) console.log("testing row #: "+ chalk.blue(i))
    // if the feature is a church and has lat/long values
    if(jsonObj.FEATURE_CLASS === "Church") {

        // build a GeoJSON feature for each
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    +jsonObj.PRIM_LONG_DEC,
                    +jsonObj.PRIM_LAT_DEC
                  ]
                },
                "properties": {
                    FEATURE_NAME: jsonObj.FEATURE_NAME
                }
        }
        // push the feature into the features array
        geojson.features.push(feature)
        featureCount++
   }

})
.on("done",(error)=>{
    // when done 
    // log out how much time it took in ms
    console.timeEnd("processing time: ")

    // check to see if the GeoJSON is valid
    if(GJV.valid(geojson)){
        console.log(chalk.green("this is valid GeoJSON!"));
        console.log(chalk.blue(featureCount + " features created."))
    } else {
        console.log(chalk.red("Sorry, not valid GeoJSON."))
    }

    // write output file
    fs.writeFile(__dirname + "/../project-files/churches.json", JSON.stringify(geojson), "utf-8", (err) => {
        
        if(err) throw err
        
        console.log(chalk.green("done writing file"))
    })
});