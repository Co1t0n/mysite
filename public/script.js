console.clear();

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
