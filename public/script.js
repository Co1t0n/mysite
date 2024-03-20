console.clear();
import gsap from "https://cdn.skypack.dev/gsap";
import zdog from "https://cdn.skypack.dev/zdog";
// Get body element
const body = document.querySelector('body');
// Set canvas width and height 
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth; 
canvas.height = window.innerHeight;

const { Illustration, TAU, Shape, Group, Ellipse } = zdog;


const Scene = new Illustration({
  element: "canvas",
  resize: "fullscreen",
  dragRotate: true,
  rotate: {
    x: TAU * -0.075,
    y: 0
  }
});

const AXIS_LENGTH = Math.max(300, window.innerWidth * 0.25);
const PIPE_LIFESPAN = 3000; // Increase this value to make the pipes last longer
const PIPES = [];
const PIPE_SPEED = 0.004;
const PIPE_STROKE = 10;
const TEAPOT_PROBABILITY = 0.99;
const PIPE_COLORS = [
  "#f27935",
  "#fef160",
  "#7befb2",
  "#6bb9f0",
  "#be90d4",
  "#f64747"
];
let CURRENT_PIPE = undefined;
class Pipe {
  IS_ALIVE = true;
  ACTIVE_AXIS = undefined;
  LENGTH = 0;
  SHAPE = undefined;
  constructor(opts) {
    this.SHAPES = [];
    this.SHAPE = new Shape({
      addTo: Scene,
      stroke: PIPE_STROKE,
      closed: false,
      ...opts
    });
    this.SHAPES.push(this.SHAPE);
    this.SHAPES.push(
      new Shape({
        addTo: Scene,
        stroke: PIPE_STROKE * 2,
        translate: opts.path[0],
        color: opts.color
      })
    );
    this.start();
  }
  start = () => {
    this.ACTIVE_AXIS = ["x", "y", "z"].filter((v) => v !== this.ACTIVE_AXIS)[
      this.ACTIVE_AXIS
        ? Math.floor(Math.random() * 2)
        : Math.floor(Math.random() * 3)
    ];
    this.SHAPE.path = [
      ...this.SHAPE.path,
      { ...this.SHAPE.path[this.SHAPE.path.length - 1] }
    ];
    const currentPos = this.SHAPE.path[this.SHAPE.path.length - 1][
      this.ACTIVE_AXIS
    ];
    const newPos = gsap.utils.random(-AXIS_LENGTH / 2, AXIS_LENGTH / 2);
    const distance = Math.abs(newPos - currentPos);
    this.LENGTH += distance;
    const duration = distance * PIPE_SPEED;
    this.__ANIMATION = gsap.to(this.SHAPE.path[this.SHAPE.path.length - 1], {
      [this.ACTIVE_AXIS]: newPos,
      duration,
      ease: "none",
      onComplete: () => {
        if (Math.random() > TEAPOT_PROBABILITY) {
          // Add a teapot 🥚
          this.SHAPES.push(
            Teapot.copyGraph({
              addTo: Scene,
              translate: this.SHAPE.path[this.SHAPE.path.length - 1],
              children: [
                ...Teapot.children.map((c) => (c.color = this.SHAPE.color))
              ]
            })
          );
        } else {
          this.SHAPES.push(
            new Shape({
              addTo: Scene,
              stroke: PIPE_STROKE * 2,
              color: this.SHAPE.color,
              translate: this.SHAPE.path[this.SHAPE.path.length - 1]
            })
          );
        }
        if (this.LENGTH > PIPE_LIFESPAN) {
          this.IS_ALIVE = false;
        } else {
          this.start();
        }
      }
    });
  };
}
const Teapot = new Group();
new Shape({
  stroke: 15,
  addTo: Teapot,
  color: "green"
});
new Shape({
  stroke: 3,
  color: "red",
  addTo: Teapot,
  rotate: {
    z: TAU * -0.05
  },
  path: [
    { x: 0, y: 0 },
    { x: 12, y: 0 }
  ]
});
new Ellipse({
  addTo: Teapot,
  color: "blue",
  diameter: 8,
  stroke: 2,
  translate: {
    x: -7
  }
});
const TeapotLid = new Ellipse({
  diameter: 7,
  color: "orange",
  addTo: Teapot,
  stroke: 4,
  rotate: {
    x: TAU * 0.25
  },
  translate: {
    y: -7
  }
});
TeapotLid.copy({
  translate: {
    y: 7
  }
});
new Shape({
  stroke: 4,
  addTo: Teapot,
  color: "purple",
  translate: {
    y: -10
  }
});

const movePipes = () => {
  PIPES.forEach(pipe => {
    if(pipe.IS_ALIVE) {
      // Increment x position of each pipe
      pipe.SHAPE.path.forEach(point => {
        point.x += (0.5 * canvasWidth) / window.innerWidth; // Scale movement based on canvas size
      });  

      // Reset position if off screen
      if(pipe.SHAPE.path[0].x > canvasWidth) {
        const diff = pipe.SHAPE.path[0].x - canvasWidth;
        pipe.SHAPE.path.forEach(point => {
          point.x -= diff;
        });
      }
    }
  });
};



const draw = () => {
  if (!CURRENT_PIPE || !CURRENT_PIPE.IS_ALIVE) {
    const PIPE_OPTIONS = {
      color: PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)],
      path: [
        {
          x: gsap.utils.random(-AXIS_LENGTH / 2, AXIS_LENGTH / 2),
          y: gsap.utils.random(-AXIS_LENGTH / 2, AXIS_LENGTH / 2),
          z: gsap.utils.random(-AXIS_LENGTH / 2, AXIS_LENGTH / 2)
        }
      ]
    };
    CURRENT_PIPE = new Pipe(PIPE_OPTIONS);
    PIPES.push(CURRENT_PIPE);
  }
  if (CURRENT_PIPE && CURRENT_PIPE.IS_ALIVE) {
    CURRENT_PIPE.SHAPE.updatePathCommands();
  }
  // Scene.rotate.y += 0.003
  Scene.updateRenderGraph();
};

gsap.to(Scene.rotate, {
  y: TAU,
  ease: "none",
  duration: 30,
  repeat: -1
});
gsap.ticker.add(draw);
canvas.style.maxWidth = "100vw";
canvas.style.maxHeight = "100vh";
// Define the function to be executed
// Define the function to be executed
const RESET = () => {
  canvas.classList.add('fade');
  setTimeout(() => {
    PIPES.forEach((child) => {
      child.__ANIMATION.kill();
      child.SHAPES.forEach(shape => shape.remove());
    });
    CURRENT_PIPE = undefined;
    canvas.classList.remove('fade');
  }, 1000); // delay should match the transition duration
};

  
setInterval(RESET, 30000); // 10000 milliseconds = 10 seconds

canvas.style.transform = "scale(2)";
 // Get the main window elements
const mainWindow = document.getElementById('main-window');
const titleBar = document.getElementById('title-bar');
const windowBody = document.getElementById('window-body');

// Get the sidebar window elements
const sidebarWindow = document.getElementById('sidebar-window');
const sidebarTitleBar = document.getElementById('sidebar-title-bar');


let isDraggingMainWindow = false;
let isDraggingSidebarWindow = false;
let offsetXMainWindow, offsetYMainWindow;
let offsetXSidebarWindow, offsetYSidebarWindow;

// Function to handle mouse down event on title bar for dragging for main window
function handleMouseDownForDraggingMainWindow(event) {
  if (event.target.classList.contains('title-bar')) {
    isDraggingMainWindow = true;
    offsetXMainWindow = event.clientX - mainWindow.offsetLeft;
    offsetYMainWindow = event.clientY - mainWindow.offsetTop;
  }
}

// Function to handle mouse move event for dragging for main window
function handleMouseMoveMainWindow(event) {
  if (isDraggingMainWindow) {
    mainWindow.style.left = (event.clientX - offsetXMainWindow) + 'px';
    mainWindow.style.top = (event.clientY - offsetYMainWindow) + 'px';
  }
}

// Function to handle mouse up event to stop dragging for main window
function handleMouseUpMainWindow() {
  isDraggingMainWindow = false;
}

// Function to handle mouse down event on title bar for dragging for sidebar window
function handleMouseDownForDraggingSidebarWindow(event) {
  if (event.target.classList.contains('title-bar')) {
    isDraggingSidebarWindow = true;
    offsetXSidebarWindow = event.clientX - sidebarWindow.offsetLeft;
    offsetYSidebarWindow = event.clientY - sidebarWindow.offsetTop;
  }
}

// Function to handle mouse move event for dragging for sidebar window
function handleMouseMoveSidebarWindow(event) {
  if (isDraggingSidebarWindow) {
    sidebarWindow.style.left = (event.clientX - offsetXSidebarWindow) + 'px';
    sidebarWindow.style.top = (event.clientY - offsetYSidebarWindow) + 'px';
  }
}

// Function to handle mouse up event to stop dragging for sidebar window
function handleMouseUpSidebarWindow() {
  isDraggingSidebarWindow = false;
}

// Add event listeners for mouse events on the title bar for dragging for main window
titleBar.addEventListener('mousedown', handleMouseDownForDraggingMainWindow);
// Add event listeners for mouse events on the document for moving for main window
document.addEventListener('mousemove', handleMouseMoveMainWindow);
document.addEventListener('mouseup', handleMouseUpMainWindow);

// Add event listeners for mouse events on the title bar for dragging for sidebar window
sidebarTitleBar.addEventListener('mousedown', handleMouseDownForDraggingSidebarWindow);
// Add event listeners for mouse events on the document for moving for sidebar window
document.addEventListener('mousemove', handleMouseMoveSidebarWindow);
document.addEventListener('mouseup', handleMouseUpSidebarWindow);
// Get the blog window elements
const blogWindow = document.getElementById('blog-window');
const blogTitleBar = document.getElementById('blog-title-bar');
const blogWindowBody = document.getElementById('blog-window-body');

let isDraggingBlogWindow = false;
let offsetXBlogWindow, offsetYBlogWindow;

// Function to handle mouse down event on title bar for dragging for blog window
function handleMouseDownForDraggingBlogWindow(event) {
    if (event.target.classList.contains('title-bar')) {
        isDraggingBlogWindow = true;
        offsetXBlogWindow = event.clientX - blogWindow.offsetLeft;
        offsetYBlogWindow = event.clientY - blogWindow.offsetTop;
    }
}

// Function to handle mouse move event for dragging for blog window
function handleMouseMoveBlogWindow(event) {
    if (isDraggingBlogWindow) {
        blogWindow.style.left = (event.clientX - offsetXBlogWindow) + 'px';
        blogWindow.style.top = (event.clientY - offsetYBlogWindow) + 'px';
    }
}

// Function to handle mouse up event to stop dragging for blog window
function handleMouseUpBlogWindow() {
    isDraggingBlogWindow = false;
}

// Add event listeners for mouse events on the title bar for dragging for blog window
blogTitleBar.addEventListener('mousedown', handleMouseDownForDraggingBlogWindow);
// Add event listeners for mouse events on the document for moving for blog window
document.addEventListener('mousemove', handleMouseMoveBlogWindow);
document.addEventListener('mouseup', handleMouseUpBlogWindow);

// Add event listeners for blog window controls (minimize, maximize, close)
const blogMinimizeBtn = document.querySelector('.blog-minimize-btn');
const blogMaximizeBtn = document.querySelector('.blog-maximize-btn');
const blogCloseBtn = document.querySelector('.blog-close-btn');

blogMinimizeBtn.addEventListener('click', () => {
    blogWindow.style.display = 'none';
});

blogMaximizeBtn.addEventListener('click', () => {
    blogWindow.style.display = 'block';
});

blogCloseBtn.addEventListener('click', () => {
    blogWindow.style.display = 'none';
});

// Add event listener for blog window button in the toolbar
const blogWindowButton = document.querySelector('.blog-window-button');
blogWindowButton.addEventListener('click', () => {
    if (blogWindow.style.display === 'none') {
        blogWindow.style.display = 'block';
    } else {
        blogWindow.style.display = 'none';
    }
});
// new window
// Get the blog window elements
const newwin = document.getElementById('new-window');
const newbar = document.getElementById('new-title-bar');
const newbody = document.getElementById('new-window-body');

let isDraggingNewWindow = false;
let offsetXNewWindow, offsetYNewWindow;

// Function to handle mouse down event on title bar for dragging for blog window
function handleMouseDownForDraggingNewWindow(event) {
    if (event.target.classList.contains('title-bar')) {
        isDraggingNewWindow = true;
        offsetXNewWindow = event.clientX - newwin.offsetLeft;
        offsetYNewWindow = event.clientY - newwin.offsetTop;
    }
}

// Function to handle mouse move event for dragging for blog window
function handleMouseMoveNewWindow(event) {
    if (isDraggingNewWindow) {
        newwin.style.left = (event.clientX - offsetXNewWindow) + 'px';
        newwin.style.top = (event.clientY - offsetYNewWindow) + 'px';
    }
}

// Function to handle mouse up event to stop dragging for blog window
function handleMouseUpNewWindow() {
    isDraggingNewWindow = false;
}

// Add event listeners for mouse events on the title bar for dragging for blog window
newbar.addEventListener('mousedown', handleMouseDownForDraggingNewWindow);
// Add event listeners for mouse events on the document for moving for blog window
document.addEventListener('mousemove', handleMouseMoveNewWindow);
document.addEventListener('mouseup', handleMouseUpNewWindow);

// Add event listeners for blog window controls (minimize, maximize, close)
const NewMinimizeBtn = document.querySelector('.new-minimize-btn');
const NewMaximizeBtn = document.querySelector('.new-maximize-btn');
const NewCloseBtn = document.querySelector('.new-close-btn');

NewMinimizeBtn.addEventListener('click', () => {
    newwin.style.display = 'none';
});

blogMaximizeBtn.addEventListener('click', () => {
    newwin.style.display = 'block';
});

NewCloseBtn.addEventListener('click', () => {
    newwin.style.display = 'none';
});

// Add event listener for blog window button in the toolbar
const NewWindowButton = document.querySelector('.new-window-button');
NewWindowButton.addEventListener('click', () => {
    if (newwin.style.display === 'none') {
        newwin.style.display = 'block';
    } else {
        newwin.style.display = 'none';
    }
});
