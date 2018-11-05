// speech recognition
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;

// html
// let container = document.querySelector('.container');

let audioContext;
let mic;
let pitch;
let speech;
let lastF = 0;
let lastSpeechWord = "";
let lastAppendWord = "";
var fhistory = [];
var whistory = [];
let playing = false;
let debug = false;
let scaleFactor = 1.5;

function setup() {
    // noCanvas();
    createCanvas(800, 600);
    audioContext = getAudioContext();
    mic = new p5.AudioIn();
    mic.start(startPitch);
    textSize(8);
    textFont('Georgia');
}

function draw() {
    if(debug)console.log(whistory);
    if(playing) {
        // frequency
        fhistory.push(lastF);

        // word
        try{
            lastSpeechWord = speech.split(" ").slice(-1)[0];
            if(lastSpeechWord != lastAppendWord){
                whistory.push(lastSpeechWord);
                lastAppendWord = lastSpeechWord
            }
            else { 
                whistory.push("");
            }
        } 
        catch(err) {
            whistory.push("");
        }
    }

    ///////////////////////////////
    ///// draw ////////////////////
    ///////////////////////////////
    
    scale(scaleFactor, 1);
    background(255);
    stroke(0);
    noFill();
        beginShape();
        for(var i=0; i < fhistory.length; i++){
            var y = map(fhistory[i], 0, 600, 0, height);
            var display_y = height - y;
            if(i == fhistory.length-1 && debug) console.log('[map] y = ' + y);
            vertex(i, display_y);
        }
        endShape();
        
        for(var j=0; j < whistory.length; j++) {
            var yy = map(fhistory[j], 0, 600, 0, height);
            var display_y = height - yy;
            push();
            scale(1/scaleFactor, 1);
            fill(0);
            textAlign(CENTER);
            text(whistory[j], j, display_y-30);
            pop();
        }

    // red line
    stroke(255, 0, 0);
    line(fhistory.length, 0, fhistory.length, height);

    // array splice
    if (fhistory.length > width/scaleFactor - 100) {
        fhistory.splice(0, 1);
        whistory.splice(0, 1);
    }
}

function keyPressed(){
    if (keyCode == 32) {
        playing = !playing;
        if(playing) select('#working').html('Working');
        else select('#working').html("Not Working");
    }
}


///////////////////////////
///////////////////////////
///////////////////////////


function startPitch() {
    pitch = ml5.pitchDetection('./model/', audioContext , mic.stream, modelLoaded);
    console.log("start pitch function");
}

function modelLoaded() {
    select('#status').html('Model Loaded');
    console.log("model loaded function");
    getPitch();
    dictate();
}

function getPitch() {
    pitch.getPitch(function(err, frequency) {
      if (frequency) {
        select('#result').html(frequency);
        if(debug) console.log(frequency);
        lastF = frequency;
      } else {
        select('#result').html('No pitch detected');
      }
      getPitch();
    })
}

const dictate = () => {
    recognition.start();
    recognition.onresult = (event) => {
        speech = event.results[0][0].transcript;
        select("#text-box").html(speech);
    }
}