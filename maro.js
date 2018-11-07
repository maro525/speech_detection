// const recognition;

// speech recognition
// function vr_start(){
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;
// }

// vr_start();

// html
// let container = document.querySelector('.container');

let audioContext;
let mic;
let pitch;

let data = new Array();
// let speech; // word array
// let pitch; // pitch array
let lastF = 0;
// let lastSpeechWord = "";
// let lastAppendWord = "";
// var fhistory = [];
// var whistory = [];

let playing = false;
let bRecog = false;
let debug = false;
let scaleFactor = 0.2;

// var recog_time_s;
// var s_s;
// var recog_time_f;
// var s_f;

var start;

recognition.onsoundend = function(){
    console.log('RECOGNITION Stopped');
    bRecog = false;
    select('#working').html('Not Working');
    vr_start();
};

recognition.onsoundstart = function(){
    console.log('RECOGNITION Start');
    bRecog = true;
    select('#working').html("WORKING");
}

function setup() {
    createCanvas(800, 600);
    frameRate(30);
    background(255);

    audioContext = getAudioContext();
    mic = new p5.AudioIn();
    mic.start(startPitch);

    textSize(13);
    textFont('Georgia');
    textAlign(CENTER);

    var st = new Date();
    start = st.getTime();
}

function draw() {
    // console.log("DRAW FUNCTION");
    // if(debug)console.log(whistory);

    // if(playing) {
    //     // frequency
    //     fhistory.push(lastF); 

    //     // word
    //     try{
    //         lastSpeechWord = speech.split(" ").slice(-1)[0];
    //         if(lastSpeechWord != lastAppendWord){
    //             whistory.push(lastSpeechWord);

    //             recog_time_f = new Date();
    //             s_f = recog_time_f.getTime();
    //             var diff_s = s_f - s_s;
    //             console.log(diff_s);

    //             lastAppendWord = lastSpeechWord
    //         }
    //         else { 
    //             whistory.push("");
    //         }
    //     } 
    //     catch(err) {
    //         whistory.push("");
    //     }
    // }

    ///////////////////////////////
    ///// draw ////////////////////
    ///////////////////////////////
    
    scale(scaleFactor, 1);
    background(255);
    stroke(0);
    noFill();

    push();
    let t = new Date();
    let elapsed = t.getTime() - start;
    let x_diff = (width/scaleFactor-50) - elapsed;
    translate(x_diff, 0);

    if(data.length != 0) {
        for(var i=0; i < data.length; i++) {
            let t_x = data[i][2];
            let t_y = height - data[i][1];
            let word = data[i][0];

            push();
            fill(0);
            scale(1/scaleFactor, 1);
            text(word, t_x, t_y);
            pop();
        }
    }
        // beginShape();
        // for(var i=0; i < fhistory.length; i++){
        //     var y = map(fhistory[i], 0, 400, 0, height);
        //     var display_y = height - y;
        //     if(i == fhistory.length-1 && debug) console.log('[map] y = ' + y);
        //     vertex(i, display_y);
        // }
        // endShape();
        
        // for(var j=0; j < whistory.length; j++) {
        //     var yy = map(fhistory[j], 0, 600, 0, height);
        //     var display_y = height - yy;
        //     push();
        //     scale(1/scaleFactor, 1);
        //     fill(0);
        //     textAlign(CENTER);
        //     text(whistory[j], j, display_y-30);
        //     pop();
        // }

    // red line
    stroke(255, 0, 0);
    let line_x = elapsed;
    line(line_x, 0, line_x, height);

    pop();

    // // array splice
    // if (fhistory.length > width/scaleFactor - 100) {
    //     fhistory.splice(0, 1);
    //     whistory.splice(0, 1);
    // }
}

function keyPressed(){
    if (keyCode == 32) {
        if(!bRecog) recognition.start();
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
        lastF = frequency;
      } else {
        select('#result').html('No pitch detected');
      }
      getPitch();
    })
}

const dictate = () => {
    console.log('Recognition Start');
    recognition.start();
    recognition.onresult = (event) => {
        let recog_time = new Date();
        let s = recog_time.getTime();
        let time = s - start;

        // let pitch = getPitch();

        speech = event.results[0][0].transcript;
        select("#text-box").html(speech);

        let l_w = speech.split(" ").slice(-1)[0];

        let bNew = false;

        if(data.length != 0){
            let lastW = data[data.length-1][0];
            if(l_w !== lastW) { bNew = true; }
        } else {
            bNew = true;
        }

        if(bNew) {
            let info = [l_w, lastF, time];
            data.push(info);
        }
    }
}
