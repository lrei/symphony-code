var cmdParse = require('cmdparse.js');
var analytics = require('analytics.js');

// Creates the store that holds FTSE
var createFTSEStore = function() {
  console.log("creating store");
var storeDef = [
  {
    "name": "FTSE",
    "fields": [
    { "name": "Day", "type": "int", "primary": true},
    { "name": "Date", "type": "datetime"},
    { "name": "Value", "type": "float", "primary":false, "default":false}
    ],
    "keys": [
    ]
  },
   {
    "name": "TweetDay",
    "fields": [
    { "name": "Day", "type": "int", "primary": true},
    { "name": "Vector", "type": "float_v", "primary":false, "default":false}
    ],
    "keys": [
    ]
  }
    ];
  qm.createStore(storeDef);
  // Successful?
  var FTSE = qm.store("FTSE");
  if(FTSE === null) {
    console.log("Unable to create FTSE store.");
    return null;
  }
  return FTSE;
};

// loads ftse json
var loadFTSE = function(FTSE, fileName, verbose) {
 verbose = verbose || false; // defaults to "silent"

  var fin = fs.openRead(fileName);
  var data = JSON.parse(fin.readAll());
  console.log(data.length);
  data.forEach(function(entry) {
    loadEntry(FTSE, entry);
  });
  //fin.close();
};

var loadEntry = function(FTSE, entry) {
  var val = 0;
  try {
    val = parseFloat(entry.Close);
  }
  catch (e) {
    console.log(e);
    console.log(entry.Close);
    return null;
  }

  var d = null;
  var sd = null;
  try {
    d = new Date(entry.Date);
  }
  catch (e) {
    console.log(entry,Date);
    console.log("invalid date");
    console.log(e);
    return;
  }
  try {
    sd = d.toISOString();
  }
  catch (e) {
    console.log("invalid to string");
    console.log(entry.Date);
    console.log(e);
    return;
  }
  var day = parseInt(d.getTime() / 86400, 10);
  var rec = {"Day": day, "Date": sd, "Value": val };
  var res = FTSE.add(rec);
  if(res === null) { console.log("fail"); }

};

/*
* Main
*/
var cmdObj = cmdParse.cmdParse(process.args);
var verbose = false;
if('verbose' in cmdObj) { verbose = true }; 
console.log("\nSymphony");


if('file' in cmdObj) {
  var FTSE = qm.store("FTSE");
  if(cmdObj.file.length !== 0) {
    cmdObj.file.forEach(function(filePath) {
    if(verbose) {
    console.log(filePath);
  }
  if(FTSE === null) {  createFTSEStore(); FTSE = qm.store("FTSE");}
  loadFTSE(FTSE, filePath, verbose);
  });
  console.log(FTSE.length);
}
}

if('extract' in cmdObj) {
  console.log("Extracting features");
  var FTSE = qm.store("FTSE");
  var TweetDay = qm.store("TweetDay");
  var Tweets = qm.store("Tweets");
  var rs = Tweets.recs;
  //eval(breakpoint);
  var splitF = function(rec1, rec2) {
    return rec1.created_at.day !== rec2.created_at.day;
  };
  var rsArr = rs.split(splitF);
  console.log("Split into " + rsArr.length + " days.");
  var ftrX = analytics.newFeatureSpace([
      { type: "text", source: "Tweets", field: "text", 
        tokenizer:{type:'simple', stopwords: 'english'}, ngrams:[1,3], 
        hashDimension: 1e6, hashTable: true }]);

  rsArr.forEach(function(recs) { // for each day
    var day = parseInt(recs[0].created_at.timestamp / 86400, 10);
    console.log("Day: " + day + ", recs = " + recs.length);
    ftrX.updateRecords(recs);
    console.log("extract col");
    var mat = ftrX.ftrColMat(recs);
    console.log("extract vector");
    var ftvec = mat.multiply(la.ones(mat.cols));
    console.log("create rec");
    var rec = {Day: day, Vector: ftvec};
    console.log("save");
    TweetDay.add(rec);
  }); // /for each day
}


