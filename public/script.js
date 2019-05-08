
const sketch = function(p) {
    console.log(p);
    const BASE_URL = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/';
    const availableModels = ['bird', 'ant','ambulance','angel','alarm_clock','antyoga','backpack','barn','basket','bear','bee','beeflower','bicycle','book','brain','bridge','bulldozer','bus','butterfly','cactus','calendar','castle','cat','catbus','catpig','chair','couch','crab','crabchair','crabrabbitfacepig','cruise_ship','diving_board','dog','dogbunny','dolphin','duck','elephant','elephantpig','everything','eye','face','fan','fire_hydrant','firetruck','flamingo','flower','floweryoga','frog','frogsofa','garden','hand','hedgeberry','hedgehog','helicopter','kangaroo','key','lantern','lighthouse','lion','lionsheep','lobster','map','mermaid','monapassport','monkey','mosquito','octopus','owl','paintbrush','palm_tree','parrot','passport','peas','penguin','pig','pigsheep','pineapple','pool','postcard','power_outlet','rabbit','rabbitturtle','radio','radioface','rain','rhinoceros','rifle','roller_coaster','sandwich','scorpion','sea_turtle','sheep','skull','snail','snowflake','speedboat','spider','squirrel','steak','stove','strawberry','swan','swing_set','the_mona_lisa','tiger','toothbrush','toothpaste','tractor','trombone','truck','whale','windmill','yoga','yogabicycle'];
    let model;
    
    // Model
    let modelState; 
    const temperature = 0.1; // Very low so that we draw very well.
    let modelLoaded = false;
    let modelIsActive = false;
    let cur_modelIsActive = false;
    
    // Model pen state.
    let dx, dy; 
    let x, y; 
    let startX, startY;  // Keep track of the first point of the last raw line.
    let pen = [0,0,0]; // Model pen state, [pen_down, pen_up, pen_end].
    let previousPen = [1, 0, 0]; // Previous model pen state.
    const PEN = {DOWN: 0, UP: 1, END: 2};
    const epsilon = 2.0; // to ignore data from user's pen staying in one spot.
    
    // Human drawing.
    let currentRawLine = [];
    let userPen = 0; // above = 0 or below = 1 the paper.
    let previousUserPen = 0;
    let currentColor = 'black';
    
    // Keep track of everyone's last attempts to that we can reverse them.
    let lastHumanStroke;  // encode the human's drawing as a sequence of [dx, dy, penState] strokes
    let lastHumanDrawing; // the actual sequence of lines that the human drew, so we can replay them.
    let lastModelDrawing = []; // the actual sequence of lines that the model drew, so that we can erase them.
    
    // Don't record mouse events when the splash is open.
    //let splashIsOpen = true;
    let splashIsOpen = false;
    /*
     * Main p5 code
     */
  
    p.setup = function() {
      // Initialize the canvas.
      const containerSize = document.getElementById('sketch').getBoundingClientRect();
      const screenWidth = Math.floor(containerSize.width);
      const screenHeight = Math.floor(containerSize.height);
      p.createCanvas(screenWidth, screenHeight);
      p.frameRate(60);
  
      restart();
      initModel(22);  // Cat!
      
      selectModels.innerHTML = availableModels.map(m => `<option>${m}</option>`).join('');
      selectModels.selectedIndex = 22; 
      selectModels.addEventListener('change', () => initModel(selectModels.selectedIndex));
      btnClear.addEventListener('click', restart);
      btnRetry.addEventListener('click', retryMagic);
      btnHelp.addEventListener('click', () => {
        splash.classList.remove('hidden');
        splashIsOpen = true;
      });
      //btnGo.addEventListener('click', () => {
      //  splashIsOpen = false;
      //  splash.classList.add('hidden');
      //});
      btnSave.addEventListener('click', () => {
        p.saveCanvas('magic-sketchpad', 'jpg');
      });
    };
    
    p.windowResized = function () {
      console.log('resize canvas');
      const containerSize = document.getElementById('sketch').getBoundingClientRect();
      const screenWidth = Math.floor(containerSize.width);
      const screenHeight = Math.floor(containerSize.height);
      p.resizeCanvas(screenWidth, screenHeight);
    };
  
   /*
    * Model is drawing.
    */
    p.draw = function() {
      if (!cur_modelIsActive){
        cur_modelIsActive = modelIsActive
      }
      if (!modelLoaded || !cur_modelIsActive) {
        return;
      }
      console.log("Model is drawing.")
      
      // New state.
      pen = previousPen;
      modelState = model.update([dx, dy, ...pen], modelState);
      const pdf = model.getPDF(modelState, temperature);
      [dx, dy, ...pen] = model.sample(pdf);
  
      // If we finished the previous drawing, start a new one.
      if (pen[PEN.END] === 1) {
        console.log('finished this one');
        cur_modelIsActive = false;
      } else {
        // Only draw on the paper if the pen is still touching the paper.
        if (previousPen[PEN.DOWN] === 1) {
          p.line(x, y, x+dx, y+dy);
          lastModelDrawing.push([x, y, x+dx, y+dy]);
        }
        // Update.
        x += dx;
        y += dy;
        previousPen = pen;
      }
    };
  
    //&&Start: Initial and Get data, change function
    
    
    //var t0, t1
    //t0 = performance.now();


    var GmouseX, GmouseY;
    var GcurPressed = 0, 
        GprevPressed = 0;
    var Gdx, Gdy; 
    var Gx, Gy; 
    var GstartX, GstartY;  // Keep track of the first point of the last raw line.
    var GcurrentRawLine = [];
    var GuserPen = 0; // above = 0 or below = 1 the paper.
    var GpreviousUserPen = 0;

    var GcurrentColor = 'black';
    var GcurrentColorIndex = 0;

    var RcurrentColor = 'blue';
    var RcurrentColorIndex = 5;

    document.getElementById("color" + GcurrentColorIndex.toString()).className = "gactive";
    document.getElementById("color" + RcurrentColorIndex.toString()).className = "ractive";
  
    //var GlastHumanStroke;  // encode the human's drawing as a sequence of [dx, dy, penState] strokes
    //var GlastHumanDrawing; // the actual sequence of lines that the human drew, so we can replay them.
  
    
    var RmouseX, RmouseY;
    var RcurPressed = 0,
        RprevPressed = 0;
    var Rdx, Rdy; 
    var Rx, Ry; 
    var RstartX, RstartY;  // Keep track of the first point of the last raw line.
    var RcurrentRawLine = [];
    var RuserPen = 0; // above = 0 or below = 1 the paper.
    var RpreviousUserPen = 0;
    
    var idx = -1;    
    var id = setInterval(getData, 10);
  
    function getData() {
        idx += 1;
        //if (idx >= 100) {
            //t1 = performance.now();
          //  console.log("stop reading data");
           // clearInterval(id);
            //console.log("it took " + (t1 - t0) + " milliseconds.")
        //} else {
            $.get("/getData", function (data) {
                data = JSON.parse(data);
                console.log(data);
                //console.log(p.width, p.height);
                document.getElementById("green-cursor").style.left = data["gx"] + "px";
                document.getElementById("green-cursor").style.top = (data["gy"] + 144) + "px";
                GmouseX = data["gx"];
                GmouseY = data["gy"];
                GprevPressed = GcurPressed;
                GcurPressed = data["gpressed"];

                document.getElementById("red-cursor").style.left = data["rx"] + "px";
                document.getElementById("red-cursor").style.top = (data["ry"] + 144) + "px";
                RmouseX = data["rx"];
                RmouseY = data["ry"];
                RprevPressed = RcurPressed;
                RcurPressed = data["rpressed"];

                if (GcurPressed === 1 && data['gjstick'] !== -1) {
                  GcurrentColorIndex = Math.floor(data['gjstick'] / 15);
                  GcurrentColor = COLORS[GcurrentColorIndex].hex;
                  document.querySelector('.gactive').classList.remove('gactive');
                  document.getElementById("color" + GcurrentColorIndex.toString()).className = "gactive";
                } 
                if (RcurPressed === 1 && data['rjstick'] !== -1) {
                  RcurrentColorIndex = Math.floor(data['rjstick'] / 15);
                  RcurrentColor = COLORS[RcurrentColorIndex].hex;
                  document.querySelector('.ractive').classList.remove('ractive');
                  document.getElementById("color" + RcurrentColorIndex.toString()).className = "ractive";
                }

                if (GprevPressed === 0 && GcurPressed === 1) {
                    GmousePressed();
                } else if (GprevPressed === 1 && GcurPressed === 1) {
                    GmouseDragged();
                } else if (GprevPressed === 1 && GcurPressed === 0) {
                    GmouseReleased();
                }

                if (RprevPressed === 0 && RcurPressed === 1) {
                    RmousePressed();
                } else if (RprevPressed === 1 && RcurPressed === 1) {
                    RmouseDragged();
                } else if (RprevPressed === 1 && RcurPressed === 0) {
                    RmouseReleased();
                }

                //need to edit
                
                if (GcurPressed === 1 && !GisInBounds() || (RcurPressed === 1 && !RisInBounds())) {
                    console.log("start draw");
                    modelIsActive = true;
                }
            })
        //}
    }
  
    function GisInBounds() {
        return GmouseX >= 0 && GmouseY >= 200 && GmouseX < p.width && GmouseY < p.height;
    }

    function RisInBounds() {
        return RmouseX >= 0 && RmouseY >= 200 && RmouseX < p.width && RmouseY < p.height;
    }
  
    function GmousePressed() {
        console.log("mouse pressed.")
        if (!splashIsOpen && GisInBounds()) {
            Gx = GstartX = GmouseX;
            Gy = GstartY = GmouseY;
            GuserPen = 1; // down!

            modelIsActive = false;
            GcurrentRawLine = [];
            lastHumanDrawing = [];
            GpreviousUserPen = GuserPen;
            p.stroke(GcurrentColor);
        }
    }

    function RmousePressed() {
        console.log("mouse pressed.")
        if (!splashIsOpen && RisInBounds()) {
            Rx = RstartX = RmouseX;
            Ry = RstartY = RmouseY;
            RuserPen = 1; // down!

            modelIsActive = false;
            RcurrentRawLine = [];
            lastHumanDrawing = [];
            RpreviousUserPen = RuserPen;
            p.stroke(RcurrentColor);
        }
    }
  
    function GmouseReleased() {
        console.log("mouse released.")
        if (!splashIsOpen && GisInBounds()) {
            GuserPen = 0;  // Up!
            const currentRawLineSimplified = model.simplifyLine(GcurrentRawLine);

            // If it's an accident...ignore it.
            if (currentRawLineSimplified.length > 1) {
                // Encode this line as a stroke, and feed it to the model.
                lastHumanStroke = model.lineToStroke(currentRawLineSimplified, [GstartX, GstartY]);
                encodeStrokes(lastHumanStroke);
            }
            GcurrentRawLine = [];
            GpreviousUserPen = GuserPen;
        }
    }

    function RmouseReleased() {
        console.log("mouse released.")
        if (!splashIsOpen && RisInBounds()) {
            RuserPen = 0;  // Up!
            const currentRawLineSimplified = model.simplifyLine(RcurrentRawLine);

            // If it's an accident...ignore it.
            if (currentRawLineSimplified.length > 1) {
                // Encode this line as a stroke, and feed it to the model.
                lastHumanStroke = model.lineToStroke(currentRawLineSimplified, [RstartX, RstartY]);
                encodeStrokes(lastHumanStroke);
            }
            RcurrentRawLine = [];
            RpreviousUserPen = RuserPen;
        }
    }
  
    function GmouseDragged() {
        //console.log("mouse dragged.")
        if (!splashIsOpen && !modelIsActive && GisInBounds()) {
            p.stroke(GcurrentColor);
            const dx0 = GmouseX - Gx;
            const dy0 = GmouseY - Gy;
            if (dx0 * dx0 + dy0 * dy0 > epsilon * epsilon) { // Only if pen is not in same area.
                Gdx = dx0;
                Gdy = dy0;
                GuserPen = 1;
                if (GpreviousUserPen == 1) {
                    p.line(Gx, Gy, Gx + Gdx, Gy + Gdy); // draw line connecting prev point to current point.
                    lastHumanDrawing.push([Gx, Gy, Gx + Gdx, Gy + Gdy]);
                }
                Gx += Gdx;
                Gy += Gdy;
                GcurrentRawLine.push([Gx, Gy]);
            }
            GpreviousUserPen = GuserPen;
        }
        return false;
    }

    function RmouseDragged() {
        //console.log("mouse dragged.")
        if (!splashIsOpen && !modelIsActive && RisInBounds()) {
            p.stroke(RcurrentColor);
            const dx0 = RmouseX - Rx;
            const dy0 = RmouseY - Ry;
            if (dx0 * dx0 + dy0 * dy0 > epsilon * epsilon) { // Only if pen is not in same area.
                Rdx = dx0;
                Rdy = dy0;
                RuserPen = 1;
                if (RpreviousUserPen == 1) {
                    p.line(Rx, Ry, Rx + Rdx, Ry + Rdy); // draw line connecting prev point to current point.
                    lastHumanDrawing.push([Rx, Gy, Rx + Rdx, Ry + Rdy]);
                }
                Rx += Rdx;
                Ry += Rdy;
                RcurrentRawLine.push([Rx, Ry]);
            }
            RpreviousUserPen = RuserPen;
        }
        return false;
    }
    
    //&&End
    
    /*
    * Helpers.
    */
    function retryMagic() {
      p.stroke('white');
      p.strokeWeight(6);
      
      // Undo the previous line the model drew.
      for (let i = 0; i < lastModelDrawing.length; i++) {
        p.line(...lastModelDrawing[i]);
      }
      
      // Undo the previous human drawn.
      for (let i = 0; i < lastHumanDrawing.length; i++) {
        p.line(...lastHumanDrawing[i]);
      }
      
      p.strokeWeight(3.0);
      p.stroke(currentColor);
      
      // Redraw the human drawing.
      for (let i = 0; i < lastHumanDrawing.length; i++) {
        p.line(...lastHumanDrawing[i]);
      }
      
      // Start again.
      encodeStrokes(lastHumanStroke);
    }
    
    function restart() {
      p.background(255, 255, 255, 255);
      p.strokeWeight(3.0);
  
      // Start drawing in the middle-ish of the screen
      startX = x = p.width / 2.0;
      startY = y = p.height / 3.0;
  
      // Reset the user drawing state.
      userPen = 1;
      previousUserPen = 0;
      currentRawLine = [];
      strokes = [];
  
      // Reset the model drawing state.
      modelIsActive = false;
      previousPen = [0, 1, 0];
    };
  
    function initModel(index) {
      console.log(index);
      modelLoaded = false;
      document.getElementById('sketch').classList.add('loading');
      
      if (model) {
        model.dispose();
      }
      
      model = new ms.SketchRNN(`${BASE_URL}${availableModels[index]}.gen.json`);
      model.initialize().then(() => {
        modelLoaded = true;
        document.getElementById('sketch').classList.remove('loading');
        console.log(`🤖${availableModels[index]} loaded.`);
        model.setPixelFactor(5.0);  // Bigger -> large outputs
      });
    };
  
    function encodeStrokes(sequence) {
      if (sequence.length <= 5) {
        return;
      }
  
      // Encode the strokes in the model.
      let newState = model.zeroState();
      newState = model.update(model.zeroInput(), newState);
      newState = model.updateStrokes(sequence, newState, sequence.length-1);
  
      // Reset the actual model we're using to this one that has the encoded strokes.
      modelState = model.copyState(newState);
      
      const lastHumanLine = lastHumanDrawing[lastHumanDrawing.length-1];
      x = lastHumanLine[0];
      y = lastHumanLine[1];
  
      // Update the pen state.
      const s = sequence[sequence.length-1];
      dx = s[0];
      dy = s[1];
      previousPen = [s[2], s[3], s[4]];
  
      lastModelDrawing = [];
      //modelIsActive = true;
    }
    
    /*
    * Colours.
    */
    const COLORS = [
      { name: 'black', hex: '#000000'},
      { name: 'red', hex: '#f44336'},
      { name: 'pink', hex: '#E91E63'},
      { name: 'purple', hex: '#9C27B0'},
      { name: 'deeppurple', hex: '#673AB7'},
      { name: 'indigo', hex: '#3F51B5'},
      { name: 'blue', hex: '#2196F3'},
      { name: 'cyan', hex: '#00BCD4'},
      { name: 'teal', hex: '#009688'},
      { name: 'green', hex: '#4CAF50'},
      { name: 'lightgreen', hex: '#8BC34A'},
      { name: 'lime', hex: '#CDDC39'},
      { name: 'yellow', hex: '#FFEB3B'},
      { name: 'amber', hex: '#FFC107'},
      { name: 'orange', hex: '#FF9800'},
      { name: 'deeporange', hex: '#FF5722'},
      { name: 'brown', hex: '#795548'}
    ];
  };
  
  const p5Sketch = new p5(sketch, 'sketch');