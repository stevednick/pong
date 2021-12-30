
var width = 0;
var height = 0;

var scores = [0, 0];

// Control variables
const controlKeys = [81, 65, 38, 40];
var currentPressedKeys = [];

// Paddle variables
var paddlePositions = [40, 40];
var paddleVelocities = [0, 0];
var paddleMaxSpeed = 8;
var paddleAcceleration = 0.3; // Rejig all these values with the boys...

var paddleDeceleration = 0.975; /// Change this to paddle decay amount. Should feel more smooth?
var paddleSpeed = 12;
var paddleLengths = [0, 0];
var paddleScreenRatio = [5, 5];
var paddleDeflectionRate = -0.4;
var paddleGap = 30;

// Ball variables
var ballSize = 20;
var ballSpeed = 3;
var ballStartingSpeed = 5;
var ballPosition = [100, 50];
var ballDirection = 0.5; // rejig spin and speed with the lads. 
var ballSpin = 0;
var spinDecay = 0.995;
var spinAdded = 0.001;

/* ----------    Event Listeners   -------------- */

$(document).keydown(function(event) {
  if (controlKeys.includes(event.keyCode) && currentPressedKeys.includes(event.keyCode) == false){
    currentPressedKeys.push(event.keyCode);
  }
});

$(document).keyup(function(event) {
  if (currentPressedKeys.includes(event.keyCode)){
    const index = currentPressedKeys.indexOf(event.keyCode);
    if (index > -1) {
      currentPressedKeys.splice(index, 1);
    }
  }
});

$(window).resize(resize);

/* --------------     Play Loop     -----------------  */

setup();
let timer = setInterval(function() {
  movePaddles();
  moveBall();
}, 1);


// ---------      Paddle Functions        --------

function movePaddles(){

  for (i=0; i<currentPressedKeys.length; i++){
    switch (currentPressedKeys[i]){
      case 81:
        pushPaddle(0, true);
        break;
      case 65:
        pushPaddle(0, false);
        break;
      case 38:
        pushPaddle(1, true);
        break;
      case 40:
        pushPaddle(1, false);
        break;
    }
  }
  movePaddle(0);
  movePaddle(1);
  displayPaddles();

  // Paddle Movement and display functions

  function pushPaddle(paddle, upPressed){
    paddleVelocities[paddle] += paddleAcceleration * reverseValue(upPressed);
    paddleVelocities[paddle] = Math.max(paddleVelocities[paddle], -paddleMaxSpeed);
    paddleVelocities[paddle] = Math.min(paddleVelocities[paddle], paddleMaxSpeed);
  }

  function movePaddle(paddle){
    paddleVelocities[paddle] *= paddleDeceleration;

    paddlePositions[paddle] += paddleVelocities[paddle];
    paddlePositions[paddle] = Math.max(0, paddlePositions[paddle]);
    paddlePositions[paddle] = Math.min(height - paddleLengths[paddle], paddlePositions[paddle]);
  }
  function displayPaddles(){
    $(".left").css("top", paddlePositions[0]);
    $(".right").css("top", paddlePositions[1]);
  }
}

// ------   Ball Movement Functions     -------

function moveBall(){

  decayAndApplySpin();

  // Move ball
  ballPosition[0] += Math.cos(ballDirection) * ballSpeed;
  ballPosition[1] += Math.sin(ballDirection) * ballSpeed;

  // Top and bottom bounces
  if (ballPosition[1] <= 0 || ballPosition[1] >= height - ballSize){
    ballDirection = -ballDirection;
  }

  if (ballPosition[0] <= paddleGap){
    if (ballPosition[1] >= paddlePositions[0] - ballSize && ballPosition[1] <= paddlePositions[0] + (paddleLengths[0])){
      bounceBallOffPaddles(0);
    }
  }
  if (ballPosition[0] >= width - paddleGap - ballSize){
    if (ballPosition[1] >= paddlePositions[1]  - ballSize && ballPosition[1] <= paddlePositions[1] + (paddleLengths[1])){
      bounceBallOffPaddles(1);
    }
  }

  // Goal Scored
  if (ballPosition[0] <= 0){
    goalScored(0);

  }
  if (ballPosition[0] >= width - ballSize){
    goalScored(1);
  }

  keepBallWithinBounds();
  displayBall();

  // Ball movement functions.

  function bounceBallOffPaddles(side){
    ballDirection = Math.PI - ballDirection;
    ballPosition[0] = (side ? width - paddleGap - 5 - ballSize : paddleGap + 5);
    addBallDeflection(getBallPositionOnPaddle(side), side);
    addSpin(side);
  }

  function goalScored(side){
    ballPosition[0] = (side ? width - width/8 : width/8);
    ballDirection = getRandomAngle(side);
    scores[(side ? 0 : 1)] += 1;
    displayScores();
  }

  function keepBallWithinBounds(){
    ballPosition[0] = Math.max(ballPosition[0], 0);
    ballPosition[0] = Math.min(ballPosition[0], width - ballSize)
    ballPosition[1] = Math.max(ballPosition[1], 0);
    ballPosition[1] = Math.min(ballPosition[1], height - ballSize);
  }
  function addSpin(paddle){
    ballSpin -= paddleVelocities[paddle] * spinAdded * reverseValue(paddle);
  }
  function decayAndApplySpin(){
    ballSpin *= spinDecay;
    ballDirection += ballSpin;
  }
  function displayBall() {
    $(".ball").css({left: ballPosition[0], top: ballPosition[1]});
  }
}

// Ball/Paddle interactions

function getBallPositionOnPaddle(paddle){
  var paddleCentre = paddlePositions[paddle] + paddleLengths[paddle]/2;
  var ballPositionOnPaddle = (paddleCentre - ballPosition[1] - ballSize/2)/(paddleLengths[paddle]/2);
  return ballPositionOnPaddle;
}

function addBallDeflection(amount, paddle){
  ballDirection += amount * paddleDeflectionRate * reverseValue(paddle);
}

//    -----------    Scoring    -------------

function displayScores() {
  $(".score-text").text(scores[0] + ":" + scores[1]);
  $("body").addClass('point-scored');
  ballSpeed = 0;
  setTimeout(function(){
    $("body").removeClass('point-scored');

  }, 100);
  setTimeout(function(){
    ballSpeed = ballStartingSpeed;
  }, 400);
  ballSpin = 0;
}

// Calculations

function resize(){

  width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  $(".ball").css({width: ballSize, height: ballSize});
  paddleLengths[0] = height/paddleScreenRatio[0];
  paddleLengths[1] = height/paddleScreenRatio[1];
  $(".left").css("height", paddleLengths[0]);
  $(".right").css("height", paddleLengths[1]);
}

function reverseValue(paddle){
  if (paddle) return -1;
  return 1;
}
function getRandomAngle(isGoingLeft){
  var randomAngle = (Math.random()-0.5)*Math.PI/2;
  if(isGoingLeft) randomAngle += Math.PI;
  return randomAngle;
}
function setup(){
  resize();
  ballSpeed = ballStartingSpeed;
  ballDirection = getRandomAngle(false);
}
