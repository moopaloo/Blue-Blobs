"use strict";
var Blob = function (x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius || 0.33;
}

Blob.prototype.hasHit = function ( checkX, checkY ) {
  // Distance between blob center and graph coordinate
  var pointDistance =
    Math.sqrt( Math.pow(checkX - this.x, 2) + Math.pow(checkY - this.y, 2) );

  return (pointDistance < this.radius);
};



var GameState = function (windowObj) {
  this._blobs = [];
  this.setWindow(windowObj);
};

GameState.prototype.createBlobs = function (coordinateList) {
  if (this._blobs.length > 0) throw "Blobs are already created.";
  if ( !(coordinateList instanceof Array) )
    throw "coordinateList must be array.";
  if (coordinateList.length === 0) throw "coordinateList must not be empty.";

  coordinateList.forEach(function(coordinate){
    // x, y in nested array
    this._blobs.push(new Blob(coordinate[0], coordinate[1]));
  }.bind(this));
};

GameState.prototype.destroyBlobs = function () {
  this._blobs = [];
};

GameState.prototype.getBlobs = function () {
  return this._blobs;
};

GameState.prototype.createRandomBlobs = function (blobsToCreate) {
  if (typeof blobsToCreate !== "number")
    throw "Number of blobs must be integer";

  if (blobsToCreate < 1) throw "Number of blobs must be non-zero";

  var coordinates = [];
  for (var i = 0; i < blobsToCreate; i++) {
    coordinates.push(
      [
        Math.random() *
        (
          this._graphWindow.maxX -
          this._graphWindow.minX
        ) + this._graphWindow.minX,
        Math.random() *
        (
          this._graphWindow.maxY -
          this._graphWindow.minY
        ) + this._graphWindow.minY,
      ]);
  }

  this.createBlobs(coordinates);
};

GameState.prototype.setWindow = function (windowObj) {
  var allNums;
  for(var name in windowObj){
    allNums = typeof windowObj[name] === "number";
    allNums = allNums && ["minX", "maxX", "minY", "maxY"].includes(name);
    if(!allNums) break;
  }

  if (!allNums)
    throw "Not correct properties on window object." +
    " Check types and that you have minX, maxX, minY, maxY.";

  if ((windowObj.minX >= windowObj.maxX) && (windowObj.minY >= windowObj.maxY))
    throw "minX must be less than maxX and minY must be less than maxY";
  if (windowObj.minX >= windowObj.maxX) throw "minX must be less than maxX";
  if (windowObj.minY >= windowObj.maxY) throw "minY must be less than maxY";

  this._graphWindow = windowObj;
};


var Graph = function (expression, xResolution, yResolution) {
  this._compileExpression(expression);
  this.xResolution = xResolution;
  this.yResolution = yResolution;
};

Graph.prototype._compileExpression =
function (expression) {
  // TODO: precompile expression for easy rendering.
  console.error("compileExpression() is not yet implemented");
};

Graph.prototype.hasPoint = function (x, y) {
  //dx is width of domain to check for point
  //dy is height of range to check for point
  if (typeof x === "object") {
    y = x.y; //Use y component of object as y
    x = x.x; //Use x component of object as x
  }
  //TODO: Implement evaluation for any equation.
  //console.error("hasPoint() not yet implemented.");
  var atLeastMinimum = (
    Math.pow(5, 2) >=
    Math.pow((x - this.xResolution / 2) - 3, 2) +
    Math.pow((y - this.yResolution / 2) + 3, 2)
  );
  var atMostMaximum = (
    Math.pow(5,2) <=
    Math.pow( (x + this.xResolution / 2) - 3, 2) +
    Math.pow( (y + this.yResolution / 2) + 3, 2)
  );
  return  atLeastMinimum && atMostMaximum;
};
