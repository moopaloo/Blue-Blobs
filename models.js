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
    Math.pow((x)- 3, 2) +
    Math.pow((y) + 3, 2)
  );
  var atMostMaximum = (
    Math.pow(5 - (this.xResolution + this.yResolution),2) <=
    Math.pow( (x) - 3, 2) +
    Math.pow( (y) + 3, 2)
  );
  /*var atLeastMinimum = (
    y >= -Math.pow(x, 2)
  );
  var atMostMaximum = (
    y - (this.xResolution + this.yResolution) <= -Math.pow(x, 2)
  );*/
  return  atLeastMinimum && atMostMaximum;
};

var Equation = function Equation(equationString) {
  if (typeof equationString !== "string")
    throw "Equation necessary for processing.";
  this._parseEquation(equationString);
  this._parseExpressions();

};

Equation.prototype._parseExpressions = function () {
  this.parsedExpressions = [];
  this.expressions.forEach(function (expression) {

  })
};

Equation.prototype._parseEquation = function (equationString) {
  equationString = equationString.toLowerCase();

  if (equationString.indexOf("x") == -1 || equationString.indexOf("y") == -1)
    throw "Equation must relate x and y."

  this.comparisonOperators = { "=" : [], "<": [], ">": [], "<=": [], ">=": []};
  //Dynamically add keys to the RegExp for matching.
  var comparisonOperatorsRegExp = new RegExp(
    //Sort comparison operators by length, then join them to match longest first
    Object.keys(this.comparisonOperators).sort(
      function compare(a, b){
        return Math.sign(b.length - a.length);
      }
    ).join("|")
  );
  var searchString = equationString;
  this.expressions = [];

  var lastMatchedLocation = -1;
  //While there is a comparison happening
  while ( (comparisonOperatorsRegExp).test(searchString) ) {
    //Grab the matched operator.
    var matchedOperator = searchString.match(comparisonOperatorsRegExp);
    //Add it's location in the string to the object, plus
    //the location of the current string in the general equation string
    //plus one because length is 1 based, while indices are 0 based.
    this.comparisonOperators[matchedOperator[0]].
    push(matchedOperator.index + lastMatchedLocation + 1);
    lastMatchedLocation = matchedOperator.index;
    //add the expression to the list of expressions to evaluate
    this.expressions.push(
      searchString.substring(0, matchedOperator.index).trim()
    );
    //reevaluate only the new part of the string
    searchString = searchString.substring(
      matchedOperator.index + matchedOperator[0].length
    );
  }
  //Push the last expression that has no comparisonOperators into expressions
  this.expressions.push(searchString.trim());

  //Make sure there's at least one comparison AND no expressions are blank
  if ( this.expressions.length < 2 ||
    this.expressions.reduce(
      function (accumulator, arrayValue) {
        //checks if previous string is empty or if current one is empty.
        return accumulator || (arrayValue.length == 0);
      },
      false
    )
  ) throw "Equation must pose either an equality or inequality";
};

var Expression = function Expression(expressionString) {
  if (typeof expressionString !== "string") throw "Expression must be specified";

  this._compiledExpression = [];

  this.orderOfBinaryOperations = {
    "^": function exponent(a, b) {
      Math.pow(b, a);
    },
    "*": function multiplication(a, b) {
      return b * a;
    },
    "/": function division(a, b) {
      return b / a;
    },
    "+": function addition(a, b) {
      return b + a;
    },
    "-": function subtraction(a, b) {
      return b - a;
    }
  };

  this.orderOfUnaryOperations = {
    "(": function parentheses() {
      throw "Parentheses not implemented";
    },
    "+": function (a) {
      return +a;
    },
    "-": function (a) {
      return -a;
    },
    "sin": function sine(a) {
      return Math.sin(a);
    },
    "cos": function cosine(a) {
      return Math.cos("a");
    }
  }

  //Base case for recursion: if there are no operations being applied to string,
  //return the number or letter in a trimmed string

if (
    Object.keys(this.orderOfUnaryOperations).reduce(
      function (collector, item) {
        return collector && (expressionString.indexOf(item) === -1);
      },
      true
    ) &&
  Object.keys(this.orderOfBinaryOperations).reduce(
    function (collector, item) {
      return collector && (expressionString.indexOf(item) === -1);
    },
    true
  )
) {
  this._compiledExpression.push(expressionString.trim());
  return;
}
  //Split so that right, ex the minus is evaluated first 2x + 3 - 2
  //That way when we break it apart the first term is evaluated first
  var indexOfSymbol = -1; //Keep scope here so I can check if symbol is found.
  var tempExpressionString = expressionString; //for processing string only
  while (indexOfSymbol === -1){
    indexOfSymbol = -1;

    //unary first
    .
    reverse().forEach(
      function (symbol) {



      }.bind(this)
    );

    // Do binary after unary
    Object.keys(this.orderOfBinaryOperations).
    concat(Object.keys(this.orderOfUnaryOperations)).
    reverse().forEach(function (symbol) {
      //detect if is truly a unary symbol by encountering either
      //the string boundary or a non-letter or non-number on the left
      //and it not being a space
      var isUnary = function (symbol, expressionString) {
        var regions = expressionString.split(symbol);
        //get one before last one
        var testStr = regions[regions.length - 2].trim();
        return testStr === "" || /[^A-z0-9]$/.test(expressionString);
      };

      currentIsUnary = isUnary(symbol, expressionString);
      if (currentIsUnary){
        //Don't execute of symbol is already found or isn't unary
        if (indexOfSymbol > -1) return;
        indexOfSymbol = tempExpressionString.lastIndexOf(symbol);
        if (indexOfSymbol > -1) { //symbol has to exist
          if (symbol === "(") {
            var indexOfEndParens = tempExpressionString.lastIndexOf(")");
            this._compiledExpression.concat(
              new Expression(
                tempExpressionString.substring(
                  indexOfSymbol + symbol.length,
                  indexOfEndParens
                )
              )._compiledExpression // Just evaluate stuff inside of parentheses
            );
            tempExpressionString = tempExpressionString.substring(indexOfSymbol);
          } else {
            this._compiledExpression.push("u" + symbol);
            afterText = tempExpressionString.
            split(symbol).pop().
            match(/[A-z0-9]+/)[0];
            this._compiledExpression.push(afterText);
          }
        }
      } else {

        if (indexOfSymbol > -1) return; //Don't execute of symbol is already found
        indexOfSymbol = tempExpressionString.lastIndexOf(symbol);
        if (indexOfSymbol > -1) { //symbol has to exist
          this._compiledExpression.push(symbol);
          this._compiledExpression.concat(
            new Expression(
              tempExpressionString.substring(indexOfSymbol + symbol.length)
            )._compiledExpression
          );
          tempExpressionString = tempExpressionString.substring(indexOfSymbol);
        }
      }

    }.bind(this));
  }

}
