// All needed class
let sidenav = document.querySelector(".sidenav");
let circle = document.querySelector('.circle');

// All needed id
let ms = document.querySelector("#brushsize");
let z = document.querySelector("#zoomval");
let bs = document.querySelector("#brushshow");
let img = document.querySelector("#img");
let au = document.querySelector("#audio");
let aurgb = document.querySelector("#audio-rgb");
let vol = document.querySelector("#volume");
let volshow = document.querySelector("#volumeshow");
let rgbeff = document.querySelector("#rgb");
let circleStyle = circle.style;

bs.innerHTML = ms.value; // Set show value in HTML to slider default value
volshow.innerHTML = vol.value; // Set show value in HTML to slider default value
// Set audio volume to slider default value
au.volume = vol.value / 100;
aurgb.volume = vol.value / 100;

// Clear all console
console.clear();
// We use PIXI Js (https://pixijs.com/) to create the liquidify effect
// Create new app with full width and height
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {
  autoStart: false, 
  backgroundColor: 0x000000, 
  view: myCanvas
});

// All variables for RGB effect
var rt = [], rts = [], bgs = [], containers = [], channelsContainer = [], displacementFilters = [], brushes = [];
// All variables for normal effect
var bg, brush, displacementFilter;

// CAPTURING CACHE //
for (var i=0;i<3;i++) {
  rt.push(PIXI.RenderTexture.create(app.screen.width, app.screen.height));
  rts.push(rt);
}
// Set current index = 0
var current = 0;



// CHANNEL FILTERS FOR RGB COLOR // 
var redChannelFilter = new PIXI.filters.ColorMatrixFilter();
redChannelFilter.matrix = [
  1, 0, 0, 0, 0, 
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 
  0, 0, 0, 1, 0
];

var greenChannelFilter = new PIXI.filters.ColorMatrixFilter();
greenChannelFilter.matrix = [
  0, 0, 0, 0, 0, 
  0, 1, 0, 0, 0, 
  0, 0, 0, 0, 0, 
  0, 0, 0, 1, 0
];

var blueChannelFilter = new PIXI.filters.ColorMatrixFilter();
blueChannelFilter.matrix = [
  0, 0, 0, 0, 0, 
  0, 0, 0, 0, 0, 
  0, 0, 1, 0, 0, 
  0, 0, 0, 1, 0
];
// Add all RGB channel to arrays
channelsContainer.push(redChannelFilter,greenChannelFilter,blueChannelFilter);

// CONTAINERS FOR NORMAL //
var container = new PIXI.Container(); 
// CONTAINERS FOR RGB //
var containerRed = new PIXI.Container();
    containerRed.position.x = 0;
var containerGreen = new PIXI.Container();
    containerGreen.position.x = 0;
var containerBlue = new PIXI.Container();
    containerBlue.position.x = 0;
// Add all RGB channel to arrays 
containers.push(containerRed,containerGreen,containerBlue);


function appLoader(img){
  // Set stage to container that already define 
  app.stage.addChild(container);
  // Load image
  app.loader.add('bg', img);
  // Load for centering image
  app.loader.add('one', 'https://raw.githubusercontent.com/PavelLaptev/test-rep/master/dis-varOne.png');
  app.loader.load(function(loader, resources) {
    // Create for tempBg with texture
      var tempBg = new PIXI.Sprite(resources.bg.texture);
      tempBg.width = app.screen.width;
      tempBg.height = app.screen.height; 
    // Render app with tempBg and rt
      app.renderer.render(tempBg, rt[0]);
    // Create bg
      bg = new PIXI.Sprite(rt[0]);
    // Create brush
      brush = new PIXI.Sprite(resources.one.texture);
      // Set brush to match with cursor
      brush.anchor.set(0.5);
      // Create effect filter
      displacementFilter = new PIXI.filters.DisplacementFilter(brush);
      // Set container with filter that already defined
      container.filters = [displacementFilter];
      // Set initial filter position
      displacementFilter.scale.x = 10;
      displacementFilter.scale.y = 10;
    
      // Set bg and brush to container
      container.addChild(bg, brush);
    
      // Add all event to call function
      app.stage.interactive = true;
      app.stage.on('pointerdown', onPointerDown)
              .on('pointerup', onPointerUp)
              .on('pointermove', onPointerMove);
    
      app.start(); 
  }); 
}

function appLoaderRGB(img){
     // Load image
  app.loader.add('bg', img);
    // Load for centering image
  app.loader.add('one', 'https://raw.githubusercontent.com/PavelLaptev/test-rep/master/dis-varOne.png');
  app.loader.load(function(loader, resources) {
        // Create for tempBg with texture
    var tempBg = new PIXI.Sprite(resources.bg.texture);
        tempBg.width = app.screen.width;
        tempBg.height = app.screen.height;
      // Render app with tempBg and rt
    app.renderer.render(tempBg, rt[0]);
    // Clear all bgs, brushes and filters
    bgs = [];
    brushes = [];
    displacementFilters = [];
    // Adding all require variables to arrays
    // Use arrays because every RGB variables need to define and set
    for (var i=0, len=containers.length; i<len; i++) {
      // Set stage to container that already define 
      app.stage.addChild(containers[i]);
      // Add brush to array
      brushes.push(new PIXI.Sprite(resources.one.texture));
      // Add filter to array
      displacementFilters.push(new PIXI.filters.DisplacementFilter(brushes[i]));
      // Create new bg
      bg = new PIXI.Sprite(rts[0][0]);
      // Add bg to array
      bgs.push(bg);
      // Define container filter with channel color and filters
      containers[i].filters = [channelsContainer[i],displacementFilters[i]];
      // Add bgs and brushes to containers
      containers[i].addChild(bgs[i],brushes[i]); 
    }
    
    // Set every color brush to match with cursor postion 
    brushes[0].anchor.set(0.5);
    brushes[1].anchor.set(0.6); 
    brushes[2].anchor.set(0.4); 
    containers[1].filters[1].blendMode = PIXI.BLEND_MODES.ADD;
    containers[2].filters[1].blendMode = PIXI.BLEND_MODES.ADD;

  // Add all event to call function
    app.stage.interactive = true;
    app.stage.on('pointerdown', onPointerDown);
    app.stage.on('pointerup', onPointerUp);
    app.stage.on('pointermove', onPointerMove);
  
    app.start();
  }); 
}

// Reset APP
function resetApp(dir){
  // Reset all loader
  app.loader.reset();
  // Create new app
  app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    autoStart: false, 
    backgroundColor: 0x000000, 
    view: myCanvas
  });
  
  // Catch all cache
  rt = []; 
  for (var i=0;i<3;i++) rt.push(PIXI.RenderTexture.create(app.screen.width, app.screen.height));
  current = 0;
  // Create new container
  container = new PIXI.Container(); 
  // Call loader
  appLoader(dir);
}

// Reset for RGB
function resetAppRGB(dir){
    // Reset all loader
  app.loader.reset();
    // Create new app
  app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    autoStart: false, 
    backgroundColor: 0x000000, 
    view: myCanvas
  });
  // Catch all cache
  rt = [];
  rts = [];
  for (var i=0;i<3;i++) {
    rt.push(PIXI.RenderTexture.create(app.screen.width, app.screen.height));
    rts.push(rt);
  }
  current = 0;
// Define the color channels
channelsContainer =[];
var redChannelFilter = new PIXI.filters.ColorMatrixFilter();
redChannelFilter.matrix = [
  1, 0, 0, 0, 0, 
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 
  0, 0, 0, 1, 0
];
var greenChannelFilter = new PIXI.filters.ColorMatrixFilter();
greenChannelFilter.matrix = [
  0, 0, 0, 0, 0, 
  0, 1, 0, 0, 0, 
  0, 0, 0, 0, 0, 
  0, 0, 0, 1, 0
];

var blueChannelFilter = new PIXI.filters.ColorMatrixFilter();
blueChannelFilter.matrix = [
  0, 0, 0, 0, 0, 
  0, 0, 0, 0, 0, 
  0, 0, 1, 0, 0, 
  0, 0, 0, 1, 0
];
channelsContainer.push(redChannelFilter,greenChannelFilter,blueChannelFilter);
// Create new containers
  containers = [];
  var containerRed = new PIXI.Container();
      containerRed.position.x = 0;
  var containerGreen = new PIXI.Container();
      containerGreen.position.x = 0;
  var containerBlue = new PIXI.Container();
      containerBlue.position.x = 0;
  containers.push(containerRed,containerGreen,containerBlue);
  // Call loader
  appLoaderRGB(dir);
}

appLoader("./assets/bg1.jpg"); // To load app in the beginning

// Function to handle if the mouse dragging
function snap(event) {
  if(rgbeff.checked){ // If RGB in on
    // Render app
    app.renderer.render(app.stage, rts[0][1 - current]);
  // Set texture in every element of array
    for (var i=0, len=containers.length; i<len; i++) {
      bgs[i].texture = rts[i][1 - current];
    }
    current = 1 - current;
  }else{
    // Render app
    app.renderer.render(app.stage, rt[2 - current]);
    // Set texture
    bg.texture = rt[2 - current];
    current = 2 - current;
  }
}

// Check if mouse dragging
var dragging = false;

// Function to handle click
function onPointerDown(event) {
    dragging = true; // Set mouse is draggin
    onPointerMove(event); // Call handler for pointer moving
} 
 
// FUnction to handle pointer move
function onPointerMove(event) {
  const x = event.data.global.x; // Define cursor position for x (horizontally)
  const y = event.data.global.y; // Define cursor position for y (vertically)
  if(rgbeff.checked) { // If rgb is o
    for (var i=0, len=containers.length; i<len; i++) {
      // Define scale for the filter in every color
      displacementFilters[i].scale.x = Math.atan(x - brushes[i].x)* (ms.value / 2); // Math atan for get the angle, ms value for the size
      displacementFilters[i].scale.y = Math.atan(y - brushes[i].y)* (ms.value / 2);  // Math atan for get the angle, ms value for the size
  
      brushes[i].position.copy(event.data.global); // Copy brush position with current cursor position
    }
  }else{
    // Define scale for the filter
    displacementFilter.scale.x = Math.atan(x - brush.x) * (ms.value / 2);  // Math atan for get the angle, ms value for the size
    displacementFilter.scale.y = Math.atan(y - brush.y) * (ms.value / 2);  // Math atan for get the angle, ms value for the size
    brush.position.copy(event.data.global); // Copy brush position with current cursor position
  }
  // If mouse dragging
    if (dragging){
      snap(event); // Call function
      if(rgbeff.checked){ // RGB on
        aurgb.play(); // Play audio for RGB
      }else{
        au.play(); // Play audio for normal
      }
    } 
}

// Function to handle if mouse not clicked
function onPointerUp() {
  // Set dragging to false
    dragging = false;
    if(rgbeff.checked){ // RGB on
      // Stop the audio
      aurgb.pause();
      aurgb.currentTime = 0;
    }else{
       // Stop the audio
      au.pause();
      au.currentTime = 0;
    }
}



// Style for circle cursor
document.addEventListener('mousemove', e => {
  // If the mouse move, the style also move with cursor
  window.requestAnimationFrame(() => {
    circleStyle.top = `${ e.clientY - circle.offsetHeight/2 }px`; // Set vertically position for circle
    circleStyle.left = `${ e.clientX - circle.offsetWidth/2 }px`; // Set horizontally position for circle
  });
});


// Hide cursor if hover nav
sidenav.addEventListener("mouseover", e => { // If the cursor hover the side nav
  // Set width, height and border to 0 to hide the circle
  circle.style.width = '0px';
  circle.style.height = '0px';
  circle.style.border = '0px';
});

// Hide cursor if not hover nav
sidenav.addEventListener("mouseleave", e => { // If the not hover the side nav
  // Set width, height and border to brush size, and border with the value below
  circle.style.width = `${ms.value}px`;
  circle.style.height = `${ms.value}px`;
  circle.style.border = '1px solid hsla(0, 0%, 100%, .7)';
});

// Function to change brush size
function brushSizeChange(){
  circle.style.width = `${ms.value}px`; // Change the width of the circle
  circle.style.height = `${ms.value}px`; // Change the height of the circle
  bs.innerHTML = ms.value; // Change value that show in the web
}

// Function to change volume
function volumeChange(){
  volshow.innerHTML = vol.value; // Change value that show in the web
  au.volume = vol.value / 100; // Change normal effect volume
  aurgb.volume  = vol.value / 100; // Change RGB effect volume
}

// Function to change RGB or not
function rgbChange(){
  if(rgbeff.checked){ // If RGB on
       resetAppRGB(`./assets/${img.value}.jpg`); // Load RGB App
  }else{
      resetApp(`./assets/${img.value}.jpg`); // Load normal app
  }
}


// Function to change background
function bgChange(){
  var dir = `./assets/${img.value}.jpg` // Set directiory for the image
  if(rgbeff.checked){ // RGB on
    resetAppRGB(dir); // Load RGB App
}else{
   resetApp(dir); // Load normal app
}
}

// Function to random image
function randomImage(){
  var bgnum = Math.floor(Math.random() * 8) + 1; // Get number item between 1 - 8
  var bgDir =  `./assets/bg${bgnum}.jpg` // Set directiory with randomize number
  img.value = `bg${bgnum}` // Update image value in the select input
  if(rgbeff.checked){ // RGB on
    resetAppRGB(bgDir); // Load RGB app
}else{
   resetApp(bgDir); // Load normal app
}
}

// Function reset texture
function resetEffect(){
  if(rgbeff.checked){ // RGB on
    resetAppRGB(`./assets/${img.value}.jpg`);  // Load RGB app with current image
}else{
   resetApp(`./assets/${img.value}.jpg`);  // Load normal app with current image
}
}



