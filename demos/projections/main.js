/** GLOBALS */
import { P3, axoProjMat } from "./draw.js";

// function creates a 3D point (vertex)
function vertex(x, y, z) {
  return {
    x,
    y,
    z,
  };
}
// an array of vertices
const vertices = []; // an array of vertices

// create the 8 vertices that make up a box
const boxSize = 20; // size of the box
const hs = boxSize / 2; // half size shorthand for easier typing
vertices.push(vertex(-hs, -hs, -hs)); // lower top left  index 0
vertices.push(vertex(hs, -hs, -hs)); // lower top right
vertices.push(vertex(hs, hs, -hs)); // lower bottom right
vertices.push(vertex(-hs, hs, -hs)); // lower bottom left
vertices.push(vertex(-hs, -hs, hs)); // upper top left  index 4
vertices.push(vertex(hs, -hs, hs)); // upper top right
vertices.push(vertex(hs, hs, hs)); // upper bottom right
vertices.push(vertex(-hs, hs, hs)); // upper  bottom left index 7

const colours = {
  dark: "#040",
  shade: "#360",
  light: "#ad0",
  bright: "#ee0",
};

function createPoly(indexes, colour) {
  return {
    indexes,
    colour,
  };
}

const polygons = [];

polygons.push(createPoly([1, 2, 6, 5], colours.shade)); // right face
polygons.push(createPoly([2, 3, 7, 6], colours.light)); // front face
polygons.push(createPoly([4, 5, 6, 7], colours.bright)); // top face

// Document Elements
var canvas = document.getElementById("board");
var CTX = canvas.getContext("2d");

// Window events
window.onload = function () {
  setCanvas(); // set canvas size and style
  render();
};
window.onresize = function () {
  location.reload(); // refresh the entire page
};

// JQuery
$("#projectionSelector").on("change", function () {
  let projection = this.value;
  axoProjMat.setProjection(projection);
  render(); // re-render
});

/** FUNCTIONS */

function setCanvas() {
  // Set canvas width and height based on parent node width
  canvas.width = 0.7 * canvas.parentNode.clientWidth;
  canvas.height = canvas.width * (3 / 4); // 4:3 aspect ratio
  // style the canvas
  canvas.style.border = "5px solid gray";
}

function clearCanvas() {
  CTX.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.border = "5px solid gray";
}

function render() {
  // clear the canvas
  clearCanvas();
  // set offsets
  let offsetX = canvas.height / 2;
  let offsetY = 0;
  if ($("#projectionSelector option:selected").val() == "TopDown") {
    console.log("topdown")
    offsetX = canvas.height / 2;
    offsetY = -canvas.width / 2;
  }
  // render the shape
  let x, y, z;
  for (z = 0; z < 4; z++) {
    const hz = z / 2;
    for (y = hz; y < 4 - hz; y++) {
      for (x = hz; x < 4 - hz; x++) {
        // move the box
        const translated = vertices.map((vert) => {
          return P3(vert.x + x * boxSize + offsetX, vert.y + y * boxSize + offsetY, vert.z + z * boxSize);
        });

        // create a new array of 2D projected verts
        const projVerts = translated.map((vert) => axoProjMat.project(vert));
        // and render
        polygons.forEach((poly) => {
          CTX.fillStyle = poly.colour;
          CTX.strokeStyle = poly.colour;
          CTX.lineWidth = 1;
          CTX.beginPath();
          poly.indexes.forEach((index) => CTX.lineTo(projVerts[index].x, projVerts[index].y));
          CTX.stroke();
          CTX.fill();
        });
      }
    }
  }
}
