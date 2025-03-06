//===================== Clases =====================
class RotatingBoundary {
  constructor(x1, y1, x2, y2) {
    this.originalA = createVector(x1, y1);
    this.originalB = createVector(x2, y2);
    this.center = p5.Vector.lerp(this.originalA, this.originalB, 0.5);
    this.angle = random(TWO_PI);
    this.length = dist(x1, y1, x2, y2);
  }
  update() {
    this.angle += rotationSpeed;
  }
  show() {
    let offsetX = (this.length / 2) * cos(this.angle);
    let offsetY = (this.length / 2) * sin(this.angle);
    let a = createVector(this.center.x - offsetX, this.center.y - offsetY);
    let b = createVector(this.center.x + offsetX, this.center.y + offsetY);
    stroke(255);
    strokeWeight(2);
    line(a.x, a.y, b.x, b.y);
    this.a = a;
    this.b = b;
  }
}

class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }
  update() {}
  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

class Particle {
  constructor(x = width / 2, y = height / 2, isFlash = false) {
    this.pos = createVector(x, y);
    this.vel = isFlash ? p5.Vector.random2D().mult(3) : createVector(0, 0);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }
  update(x, y) {
    if (x !== undefined && y !== undefined) {
      this.pos.set(x, y);
    } else {
      this.pos.add(this.vel);
    }
  }
  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(255, 100);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }
  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4);
  }
}

class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }
  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    }
  }
}

// ==================== Projects con órbita e interactividad ====================
class ProjectThumbnail {
  constructor(x, y, w, h, img = null) {
    // Elegimos un "centro" de órbita. Puede ser el centro de la pantalla:
    this.cx = width / 2;
    this.cy = height / 2;

    // Calculamos un radio inicial como la distancia desde (x,y) hasta (cx,cy):
    this.orbitRadius = dist(x, y, this.cx, this.cy);

    // Definimos un ángulo orbital aleatorio
    this.orbitAngle = random(TWO_PI);

    this.w = w;
    this.h = h;
    // Ángulo de rotación del rect
    this.angle = random(TWO_PI);
    // Velocidad de giro sobre sí mismo
    this.rotationSpeed = random(0.005, 0.02);

    this.img = img;

    // Color base aleatorio (puedes ajustarlo a tu gusto)
    this.baseColor = color(random(255), random(255), random(255));

    // Magnitud con la que reacciona al mouse
    // (es como “qué tanto se deforma el radio para acercarse o alejarse del mouse”)
    this.followStrength = 0.10;
  }

  update() {
    // Incrementamos el ángulo orbital para que de vueltas
    this.orbitAngle += 0.1;

    // Rotación propia
    this.angle += this.rotationSpeed;

    // Empuje hacia/desde el mouse:
    // Tomamos la distancia mouse->centro y la dividimos,
    // para que no se aleje/acerque directo al mouse sino algo sutil
    let targetRadius = dist(mouseX, mouseY, this.cx, this.cy) / 10;

    let diff = targetRadius - this.orbitRadius;
    this.orbitRadius += diff * this.followStrength;

    // Calculamos la posición final en la órbita
    this.x = this.cx + this.orbitRadius * cos(this.orbitAngle);
    this.y = this.cy + this.orbitRadius * sin(this.orbitAngle);
  }

  show() {
    // Checamos si el mouse está encima para “hover”
    let d = dist(mouseX, mouseY, this.x, this.y);
    let hovered = (d < this.w / 2 || d < this.h / 2);

    push();
      translate(this.x, this.y);
      rotate(this.angle);

      // Si “hover”, llenamos de color, sino es un rect sin relleno
      if (hovered) {
        fill(red(this.baseColor), green(this.baseColor), blue(this.baseColor), 150);
      } else {
        noFill();
      }
      stroke(255);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    pop();
  }

  contains(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < max(this.w, this.h) / 2;
  }
}


class ParticleBurst {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push(new BurstParticle(x, y));
    }
  }
  update() {
    for (let p of this.particles) {
      p.update();
    }
    this.particles = this.particles.filter(p => !p.finished());
  }
  show() {
    for (let p of this.particles) {
      p.show();
    }
  }
  isFinished() {
    return this.particles.length === 0;
  }
}

class BurstParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5));
    this.lifetime = 255;
  }
  update() {
    this.pos.add(this.vel);
    this.lifetime -= 4;
  }
  finished() {
    return this.lifetime < 0;
  }
  show() {
    noStroke();
    fill(255, this.lifetime);
    ellipse(this.pos.x, this.pos.y, 4);
  }
}

class Ripple {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 0;
    this.alpha = 255;
  }
  update() {
    this.r += 1;
    this.alpha -= 2;
  }
  finished() {
    return this.alpha <= 0;
  }
  show() {
    noFill();
    stroke(255, this.alpha);
    strokeWeight(2);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

class NeonPulse {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 5;
    this.alpha = 200;
  }
  update() {
    this.r += 2;
    this.alpha -= 5;
  }
  finished() {
    return this.alpha <= 0;
  }
  show() {
    noFill();
    stroke(0, 255, 255, this.alpha);
    strokeWeight(3);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

class SocialMediaParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(0.5);
    this.acc = createVector(0, 0);
    this.size = 30;
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
    this.acc.mult(0.9);
  }
  show() {
    noStroke();
    fill(0, 255, 255);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  applyForce(force) {
    this.acc.add(force);
  }
}

//===================== Variables Globales =====================
let walls = [];
let particle;
let flashes = [];
let cubeTextures = [];

let wallCount = 5;
let rayCount = 1;
let rotationSpeed = 0.01;
let maxFlashes = 1;
// --- Variables globales para el botón "Back" ---
let backBtnMargin = 10;
let backBtnW = 100;
let backBtnH = 30;
let backBtnX, backBtnY;
// Secciones: 1->About, 2->Game, 3->Projects, 4->Contact, 5->Social

// Projects
let projects = [];
let projectParticleBursts = [];

// Efectos
let menuRipples = [];
let contactNeonPulses = [];
let socialMediaParticles = [];

// About me
let aboutActive = false;
let aboutText =
  "Hi! My name is Camilo Mejía, I’m a 26-year-old designer from Colombia with a passion for creativity. I like 3D design, crafting immersive visuals that bring ideas to life. When I’m not working on a design, you’ll probably find me gathering inspiration from the world around me. I believe every project is an opportunity to tell a story—whether through dynamic animations, intricate renders, or impactful visuals. My goal is to blend technical expertise with imagination to create designs that not only look stunning but also connect on an emotional level. Let’s create something amazing together! If you'd like to see more of my work or collaborate, feel free to explore my portfolio and reach out.";

let textScale = 1.0, imageScale = 1.0, buttonScale = 1.0; 

// Contact
let contactActive = false;
let contactText =
  "Thank you for your interest! You can reach me for design projects, collaborations, or just to say hi. I'm open to new ideas and always looking to expand my creative network. My goal is to provide solutions that blend technology and art in an innovative way. Feel free to send me a message and I'll respond as soon as possible. Let's talk and build something great together!";

// Manejo del formulario
let inputName, inputEmail, inputIdea, sendButton;
let formVisible = true; // si el formulario está visible
let sendMessage = "";   // mensaje final tras enviar

// Social media (detail)
let smDetailActive = false;
let socialText =
  "Here are my social media channels! Feel free to follow me and check out my creative work. Click on any icon to open my profile in a new tab. Let's connect and share inspiration!";

let smTextScale = 1.0, smButtonScale = 1.0;
let instagramIcon, behanceIcon, tiktokIcon;
let iconLinks = [
  { img: null, url: "https://instagram.com/cam__studio_", x: 0, y: 0, size: 100 },
  { img: null, url: "https://www.behance.net/camilozuleta1",   x: 0, y: 0, size: 100 },
  { img: null, url: "https://www.tiktok.com/@cam__studio_?_t=ZS-8uS2qtImD0J&_r=1",    x: 0, y: 0, size: 100 }
  
];

// Landing
let landing = true;
let landingIndex = [
  "About me",
  "Game Section",
  "Projects",
  "Contact here",
  "Social Media"
];
let logoImage;

// Projects detail
let projectDetail = false;

// Game
let portadRetrogameImg;
let gameButtonURL = "https://www.youtube.com/watch?v=4RTZSV919Aw"; 

// Fuentes
let pressStartFont, manropeFont;

// p5.Graphics
let pg3D;

//===================== PRELOAD =====================
function preload() {
  pressStartFont = loadFont("PressStart2P-Regular.ttf");
  manropeFont = loadFont("Manrope-VariableFont_wght.ttf");
  
  camiloImage = loadImage("Camilo.jpg");
  logoImage = loadImage("Logo extenso.png");
  portadRetrogameImg = loadImage("PortadRetrogame.png");
  
  instagramIcon = loadImage("Instagram.png");
  behanceIcon   = loadImage("Behance.png");
  tiktokIcon    = loadImage("Tiktok.png");
  
  iconLinks[0].img = instagramIcon;
  iconLinks[1].img = behanceIcon;
  iconLinks[2].img = tiktokIcon;

  // Cubo
  cubeTextures[0] = loadImage("Portfolio 3.jpg");
  cubeTextures[1] = loadImage("Portfolio.png");
  cubeTextures[2] = loadImage("Portfolio1.jpg");
  cubeTextures[3] = loadImage("Portfolio 3.jpg");
  cubeTextures[4] = loadImage("Portfolio.png");
  cubeTextures[5] = loadImage("Portfolio1.jpg");
}

//===================== SETUP =====================
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Asignar posición: 10 píxeles desde el borde izquierdo y 10 desde el inferior
  backBtnX = backBtnMargin;
  backBtnY = height - backBtnH - backBtnMargin;
  resetSectionElements();
  
  particle = new Particle();
  
  projects.push(new ProjectThumbnail(width * 0.3, height * 0.4, 100, 70));
  projects.push(new ProjectThumbnail(width * 0.5, height * 0.5, 120, 80));
  projects.push(new ProjectThumbnail(width * 0.7, height * 0.4, 90, 90));

  for (let i = 0; i < 10; i++) {
    socialMediaParticles.push(new SocialMediaParticle(random(width), random(height)));
  }

  pg3D = createGraphics(400, 400, WEBGL);
  pg3D.noStroke();
  pg3D.ambientLight(150);

  // Botón Home (parte superior izquierda)
  homeButton = createButton("Home");
  homeButton.position(10, 10);
  homeButton.style("background-color", "white");
  homeButton.style("color", "black");
  homeButton.style("font-size", "16px");
  homeButton.mousePressed(() => {
    location.reload();
  });
  
  // Inicializar posiciones para social icons
  let baseX = width / 2 - 200; 
  let baseY = height / 2 + 50;
  for (let i = 0; i < iconLinks.length; i++) {
    iconLinks[i].x = baseX + i * 150;
    iconLinks[i].y = baseY;
  }
}

//===================== Función para reiniciar =====================
function resetSectionElements() {
  walls = [];
  for (let i = 0; i < wallCount; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = random(width);
    let y2 = random(height);
    walls.push(new RotatingBoundary(x1, y1, x2, y2));
  }
  walls.push(new Boundary(-1, -1, width, -1));
  walls.push(new Boundary(width, -1, width, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));
  flashes = [];
}

//===================== LANDING =====================
function drawLandingLogo() {
  let logoX = width * 0.25; 
  let logoY = height / 2;
  let logoScale = 0.4;
  
  push();
    translate(logoX, logoY);
    imageMode(CENTER);
    image(logoImage, 0, 0, logoImage.width * logoScale, logoImage.height * logoScale);
  pop();
}

function drawLandingBackground() {
  push();
  let t = frameCount * 0.005;
  for (let i = 0; i < width; i += 50) {
    for (let j = 0; j < height; j += 50) {
      let n = noise(i * 0.01, j * 0.01, t);
      let alpha = map(n, 0, 1, 50, 200);
      let col = lerpColor(color(80, 0, 150), color(255, 100, 255), n);
      fill(col.levels[0], col.levels[1], col.levels[2], alpha);
      let r = map(n, 0, 1, 8, 30);
      let d = dist(mouseX, mouseY, i, j);
      if (d < 50) r *= 1.3;
      ellipse(i + (mouseX * 0.002), j + (mouseY * 0.002), r);
    }
  }
  pop();
}

function drawLandingIndexBackground() {
  push();
  noStroke();
  fill(0, 0, 0, 150);
  rect(width * 0.54, height * 0.28, width * 0.45, 300, 10);
  pop();
}

function drawLandingIndex() {
  push();
    textFont(manropeFont);
    textSize(32);
    textAlign(LEFT, CENTER);
    for (let i = 0; i < landingIndex.length; i++) {
      let x = width * 0.55;
      let y = height * 0.3 + i * 50;
      let d = dist(mouseX, mouseY, x, y);
      let s = (d < 40) ? lerp(1.0, 1.2, 0.1) : 1.0;
      let col = (d < 40) ? color(255, 0, 0) : color(255);
      push();
        translate(x, y);
        scale(s);
        fill(col);
        noStroke();
        ellipse(-40, 0, 12);
        text(landingIndex[i], 0, 0);
      pop();
    }
  pop();
}

function landingIndexClicked() {
  for (let i = 0; i < landingIndex.length; i++) {
    let x = width * 0.55;
    let y = height * 0.3 + i * 50;
    let w = textWidth(landingIndex[i]);
    if (mouseX > x && mouseX < x + w && abs(mouseY - y) < 20) {
      maxFlashes = i + 1;
      landing = false;
      if (maxFlashes === 1) {
        aboutActive = false;
      }
    }
  }
}

//===================== ABOUT ME (detalle) =====================
// Ajustamos también la posición del botón "Atras" en la parte superior izquierda, debajo del Home
function drawAboutMeBackground() {
  push();
    noStroke();
    for (let i = 0; i < width; i += 60) {
      for (let j = 0; j < height; j += 60) {
        let n = noise(i * 0.005, j * 0.005, frameCount * 0.01);
        let alpha = map(n, 0, 1, 80, 150);
        let col = lerpColor(color(200, 50, 255), color(50, 255, 200), n);
        fill(red(col), green(col), blue(col), alpha);
        let r = map(n, 0, 1, 20, 50);
        let offsetX = 10 * sin(frameCount * 0.02 + i);
        let offsetY = 10 * cos(frameCount * 0.02 + j);
        ellipse(i + offsetX, j + offsetY, r);
      }
    }
  pop();
}

function drawAboutMe() {
  cursor(ARROW);
  
  let textX = 50;
  let textY = 50;
  let textW = width / 2;
  let textH = height - 100;
  
  let targetWidth = width / 4;
  let aspect = camiloImage.width / camiloImage.height;
  let targetHeight = targetWidth / aspect;
  let imgCenterX = width - (targetWidth / 2 + 50);
  let imgCenterY = height / 2; 

  // Posición del botón "Atras" en la parte superior izquierda, debajo del Home
let btnCenterX = backBtnX + backBtnW / 2;
let btnCenterY = backBtnY + backBtnH / 2;
let hoverButton = (mouseX >= backBtnX && mouseX <= backBtnX + backBtnW &&
                   mouseY >= backBtnY && mouseY <= backBtnY + backBtnH);

  let hoverText = (mouseX >= textX && mouseX <= textX + textW &&
                   mouseY >= textY && mouseY <= textY + textH);
  let hoverImage = (mouseX >= imgCenterX - targetWidth / 2 && mouseX <= imgCenterX + targetWidth / 2 &&
                    mouseY >= imgCenterY - targetHeight / 2 && mouseY <= imgCenterY + targetHeight / 2);


  let smoothing = 0.1;
  textScale = hoverText ? lerp(textScale, 1.05, smoothing) : lerp(textScale, 1.0, smoothing);
  imageScale = hoverImage ? lerp(imageScale, 1.05, smoothing) : lerp(imageScale, 1.0, smoothing);
  buttonScale = hoverButton ? lerp(buttonScale, 1.05, smoothing) : lerp(buttonScale, 1.0, smoothing);

  // Fondo recuadro
  push();
    translate(textX + textW/2, textY + textH/2);
    scale(textScale);
    translate(-textX - textW/2, -textY - textH/2);
    noStroke();
    fill(200, 50, 250, 180);
    rect(textX - 10, textY - 10, textW + 20, textH + 20, 20);
  pop();

  // Texto
  push();
    translate(textX + textW/2, textY + textH/2);
    scale(textScale);
    translate(-textX - textW/2, -textY - textH/2);
    fill(255);
    textFont(manropeFont);
    textSize(20);
    textLeading(28);
    textAlign(LEFT, TOP);
    text(aboutText, textX, textY, textW, textH);
  pop();

  // Imagen
  push();
    translate(imgCenterX, imgCenterY);
    scale(imageScale);
    translate(-imgCenterX, -imgCenterY);
    imageMode(CENTER);
    image(camiloImage, imgCenterX, imgCenterY, targetWidth, targetHeight);
  pop();

  // Botón "Atras"

push();
  translate(backBtnX + backBtnW/2, backBtnY + backBtnH/2);
  let sc = isHover ? 1.1 : 1.0;
  scale(sc);
  translate(- (backBtnX + backBtnW/2), - (backBtnY + backBtnH/2));
  fill(50, 50, 50, 200);
  rect(0, 0, backBtnW, backBtnH, 5);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Back", backBtnW/2, backBtnH/2);
pop();



}

//===================== CONTACT (detalle) ======================
// Fondo interactivo distinto: “floating squares”
function drawContactBackground() {
  background(10, 10, 80); // un color base diferente
  push();
    for (let i = 0; i < 50; i++) {
      let x = noise(i, frameCount * 0.01) * width;
      let y = noise(i + 1000, frameCount * 0.01) * height;
      fill(255, 50);
      noStroke();
      rect(x, y, 20, 20);
    }
  pop();
}

// Crea los elementos del formulario al entrar
function createContactForm() {
  inputName = createInput("");
  inputName.position(width/2 - 150, height/2 - 80);
  inputName.size(300, 20);
  inputName.attribute("placeholder", "Name");

  inputEmail = createInput("");
  inputEmail.position(width/2 - 150, height/2 - 40);
  inputEmail.size(300, 20);
  inputEmail.attribute("placeholder", "Email");

  inputIdea = createInput("");
  inputIdea.position(width/2 - 150, height/2);
  inputIdea.size(300, 20);
  inputIdea.attribute("placeholder", "Your idea");

  sendButton = createButton("Send");
  sendButton.position(width/2 - 30, height/2 + 50);
  sendButton.mousePressed(handleSend);

  formVisible = true;
  sendMessage = "";
}

// Destruye los inputs cuando salimos o reenviamos
function removeContactForm() {
  if (inputName)  { inputName.remove();  inputName = null; }
  if (inputEmail) { inputEmail.remove(); inputEmail = null; }
  if (inputIdea)  { inputIdea.remove();  inputIdea = null; }
  if (sendButton) { sendButton.remove(); sendButton = null; }
}

function handleSend() {
  // Al presionar el botón Send
  formVisible = false;
  sendMessage = "Check your email, I have sent you valuable information.";
  // Cambiamos el texto del botón a "Sent" (si quisieras que quedara en pantalla)
  sendButton.html("Sent");
  // Ocultamos los inputs
  removeContactForm();
}

function drawContactDetail() {
  cursor(ARROW);

  drawContactBackground();
  
  // Creamos / mostramos el formulario sólo si formVisible y no existe
  if (formVisible && !inputName) {
    createContactForm();
  }
  
  // Botón "Atras" en la parte superior izquierda, debajo de Home
let isHover = (mouseX >= backBtnX && mouseX <= backBtnX + backBtnW &&
               mouseY >= backBtnY && mouseY <= backBtnY + backBtnH);

push();
  translate(backBtnX + backBtnW/2, backBtnY + backBtnH/2);
  let sc = isHover ? 1.1 : 1.0;
  scale(sc);
  translate(- (backBtnX + backBtnW/2), - (backBtnY + backBtnH/2));
  fill(50, 50, 50, 200);
  rect(0, 0, backBtnW, backBtnH, 5);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Back", backBtnW/2, backBtnH/2);
pop();




  // Texto principal
  let textX = 50, textY = 50, textW = width - 100, textH = 200;
  push();
    fill(255);
    textFont(manropeFont);
    textSize(20);
    textLeading(28);
    textAlign(LEFT, TOP);
    text(contactText, textX, textY, textW, textH);
  pop();

  // Si ya enviamos el formulario, mostramos el mensaje
  if (!formVisible && sendMessage !== "") {
    push();
      fill(255, 200, 0);
      textAlign(CENTER, CENTER);
      textSize(20);
      text(sendMessage, width/2, height/2);
    pop();
  }
}

//===================== SOCIAL MEDIA (detalle) ======================
let orbitAngle = 0;
function drawSocialMediaBackground() {
  push();
    background(40, 0, 60);
    translate(width/2, height/2);
    orbitAngle += 0.01;
    let numArcs = 10;
    for (let i = 0; i < numArcs; i++) {
      let radius = 50 + i*30;
      let startA = orbitAngle + i * 0.3;
      let endA = startA + 1.2;
      strokeWeight(3);
      let col = lerpColor(color(255, 0, 150), color(0, 255, 200), i / numArcs);
      stroke(col);
      noFill();
      arc(0, 0, radius*2, radius*2, startA, endA);
    }
  pop();
}

function drawSocialMediaDetail() {
  cursor(ARROW);
  drawSocialMediaBackground();

  // Botón "Atras"
let isHover = (mouseX >= backBtnX && mouseX <= backBtnX + backBtnW &&
               mouseY >= backBtnY && mouseY <= backBtnY + backBtnH);

push();
  translate(backBtnX + backBtnW/2, backBtnY + backBtnH/2);
  let sc = isHover ? 1.1 : 1.0;
  scale(sc);
  translate(- (backBtnX + backBtnW/2), - (backBtnY + backBtnH/2));
  fill(50, 50, 50, 200);
  rect(0, 0, backBtnW, backBtnH, 5);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Back", backBtnW/2, backBtnH/2);
pop();







  // Texto
  let textX = 50, textY = 50, textW = width - 100, textH = height * 0.3;
  push();
    fill(255);
    textFont(manropeFont);
    textSize(20);
    textLeading(28);
    textAlign(LEFT, TOP);
    text(socialText, textX, textY, textW, textH);
  pop();

  // Íconos
  for (let i = 0; i < iconLinks.length; i++) {
    let iconObj = iconLinks[i];
    let d = dist(mouseX, mouseY, iconObj.x, iconObj.y);
    let over = (d < iconObj.size * 0.5);
    let scaleIcon = over ? 1.2 : 1.0;
    
    push();
      translate(iconObj.x, iconObj.y);
      scale(scaleIcon);
      imageMode(CENTER);
      image(iconObj.img, 0, 0, iconObj.size, iconObj.size);
    pop();
  }
}

//===================== PROJECTS (detalle) ======================
function drawProjectDetailBackground() {
  push();
    noStroke();
    for (let i = 0; i < width; i += 80) {
      for (let j = 0; j < height; j += 80) {
        let n = noise(i * 0.01, j * 0.01, frameCount * 0.02);
        let col = lerpColor(color(0, 100, 200), color(200, 100, 0), n);
        fill(red(col), green(col), blue(col), 150);
        rect(i, j, 60, 60);
      }
    }
  pop();
}

function drawProjectDetail() {
  drawProjectDetailBackground();
  
  pg3D.background(0, 0, 0, 0);
  pg3D.push();
    pg3D.ambientLight(150, 150, 150);
    pg3D.rotateX(frameCount * 0.005);
    pg3D.rotateY(frameCount * 0.005);
    drawTexturedCube(400);
  pg3D.pop();
  imageMode(CENTER);
  image(pg3D, width / 2, height / 2);
  imageMode(CORNER);
  
  // Botón "Atras" (arriba izq)
let isHover = (mouseX >= backBtnX && mouseX <= backBtnX + backBtnW &&
               mouseY >= backBtnY && mouseY <= backBtnY + backBtnH);


push();
  translate(backBtnX + backBtnW/2, backBtnY + backBtnH/2);
  let sc = isHover ? 1.1 : 1.0;
  scale(sc);
  translate(- (backBtnX + backBtnW/2), - (backBtnY + backBtnH/2));
  fill(50, 50, 50, 200);
  rect(0, 0, backBtnW, backBtnH, 5);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Back", backBtnW/2, backBtnH/2);
pop();





}

//===================== Cubo texturizado =====================
function drawTexturedCube(size) {
  pg3D.textureMode(NORMAL);
  
  // Front face
  pg3D.beginShape();
    pg3D.texture(cubeTextures[0]);
    pg3D.vertex(-size/2, -size/2,  size/2, 0, 0);
    pg3D.vertex( size/2, -size/2,  size/2, 1, 0);
    pg3D.vertex( size/2,  size/2,  size/2, 1, 1);
    pg3D.vertex(-size/2,  size/2,  size/2, 0, 1);
  pg3D.endShape(CLOSE);
  
  // Right face
  pg3D.beginShape();
    pg3D.texture(cubeTextures[1]);
    pg3D.vertex( size/2, -size/2,  size/2, 0, 0);
    pg3D.vertex( size/2, -size/2, -size/2, 1, 0);
    pg3D.vertex( size/2,  size/2, -size/2, 1, 1);
    pg3D.vertex( size/2,  size/2,  size/2, 0, 1);
  pg3D.endShape(CLOSE);
  
  // Back face
  pg3D.beginShape();
    pg3D.texture(cubeTextures[2]);
    pg3D.vertex( size/2, -size/2, -size/2, 0, 0);
    pg3D.vertex(-size/2, -size/2, -size/2, 1, 0);
    pg3D.vertex(-size/2,  size/2, -size/2, 1, 1);
    pg3D.vertex( size/2,  size/2, -size/2, 0, 1);
  pg3D.endShape(CLOSE);
  
  // Left face
  pg3D.beginShape();
    pg3D.texture(cubeTextures[3]);
    pg3D.vertex(-size/2, -size/2, -size/2, 0, 0);
    pg3D.vertex(-size/2, -size/2,  size/2, 1, 0);
    pg3D.vertex(-size/2,  size/2,  size/2, 1, 1);
    pg3D.vertex(-size/2,  size/2, -size/2, 0, 1);
  pg3D.endShape(CLOSE);
  
  // Top face
  pg3D.beginShape();
    pg3D.texture(cubeTextures[4]);
    pg3D.vertex(-size/2, -size/2, -size/2, 0, 0);
    pg3D.vertex( size/2, -size/2, -size/2, 1, 0);
    pg3D.vertex( size/2, -size/2,  size/2, 1, 1);
    pg3D.vertex(-size/2, -size/2,  size/2, 0, 1);
  pg3D.endShape(CLOSE);
  
  // Bottom face
  pg3D.beginShape();
    pg3D.texture(cubeTextures[5]);
    pg3D.vertex(-size/2,  size/2,  size/2, 0, 0);
    pg3D.vertex( size/2,  size/2,  size/2, 1, 0);
    pg3D.vertex( size/2,  size/2, -size/2, 1, 1);
    pg3D.vertex(-size/2,  size/2, -size/2, 0, 1);
  pg3D.endShape(CLOSE);
}

//===================== Gradiente de fondo para Overviews =====================
function drawGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

//===================== DRAW =====================
function draw() {
  if (landing) {
    // Ocultamos el botón home en landing
    homeButton.hide();
    cursor(ARROW);
    drawLandingBackground();
    drawLandingIndexBackground();
    drawLandingIndex();
    drawLandingLogo();
    textFont(manropeFont);
    textSize(16);
    textAlign(CENTER, CENTER);
    fill(255);
    text("Scroll to change section", width / 2, height - 20);
    return;
  } else {
    homeButton.show();
  }
  
  // Cursor
  if (aboutActive || projectDetail || contactActive || smDetailActive) {
    cursor(ARROW);
  } else {
    noCursor();
  }

  // Cambiamos colores de gradient en overview
  let c1, c2;
  switch (maxFlashes) {
    case 1:
      c1 = color(10, 0, 30);
      c2 = color(30, 0, 50);
      break;
    case 2:
      c1 = color(0, 10, 0);
      c2 = color(10, 30, 10);
      break;
    case 3:
      c1 = color(30, 0, 0);
      c2 = color(50, 10, 10);
      break;
    case 4:
      // Contact overview con color diferente
      c1 = color(10, 10, 40);
      c2 = color(25, 25, 90);
      break;
    case 5:
      // Social media overview con color diferente
      c1 = color(40, 0, 20);
      c2 = color(80, 0, 60);
      break;
    default:
      c1 = color(0);
      c2 = color(0);
  }
  drawGradient(0, 0, width, height, c1, c2);

  // Ray caster + paredes en Overviews (si NO estamos en un detail)
  if (!aboutActive && !projectDetail && !contactActive && !smDetailActive) {
    for (let wall of walls) {
      wall.update();
      wall.show();
    }
    particle.update(mouseX, mouseY);
    particle.show();
    particle.look(walls);
    for (let i = flashes.length - 1; i >= 0; i--) {
      flashes[i].update();
      flashes[i].show();
      flashes[i].look(walls);
    }
  }

  // Detalles
  if (maxFlashes === 1 && aboutActive) {
    drawAboutMeBackground();
    drawAboutMe();
  }
  else if (maxFlashes === 3 && projectDetail) {
    drawProjectDetail();
  }
  else if (maxFlashes === 4 && contactActive) {
    drawContactDetail();
  }
  else if (maxFlashes === 5 && smDetailActive) {
    drawSocialMediaDetail();
  }

  // Título de sección en overview
  if (!aboutActive && !projectDetail && !contactActive && !smDetailActive) {
    displaySectionTitle();
  }

  // Mensaje "Scroll..."
  textFont(manropeFont);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(255);
  text("Scroll to change section", width / 2, height - 20);

  // Projects overview
  if (maxFlashes === 3 && !projectDetail) {
    for (let project of projects) {
      project.update();
      project.show();
    }
    for (let i = projectParticleBursts.length - 1; i >= 0; i--) {
      projectParticleBursts[i].update();
      projectParticleBursts[i].show();
      if (projectParticleBursts[i].isFinished()) {
        projectParticleBursts.splice(i, 1);
      }
    }
  }

  // Game Section
  if (maxFlashes === 2 && !aboutActive && !projectDetail && !contactActive && !smDetailActive) {
  // Definir la región donde se muestra "Game Section"
  let gameText = "Game Section";
  let tw = textWidth(gameText);
  let regionX = width / 2 - tw / 2 - 10;
  let regionY = height / 2 - 32 - 10;
  let regionW = tw + 20;
  let regionH = 64 + 20;
  if (mouseX > regionX && mouseX < regionX + regionW &&
      mouseY > regionY && mouseY < regionY + regionH) {
    window.open("https://www.youtube.com/watch?v=4RTZSV919Aw", "_blank");
   
  }
}

  if (maxFlashes === 2 && !aboutActive && !projectDetail && !contactActive && !smDetailActive) {
    push();
      tint(255, 200);
      imageMode(CORNER);
      image(portadRetrogameImg, 0, 0, width, height);
    pop();
    
    textFont(pressStartFont);
    textSize(64);
    textAlign(CENTER, CENTER);
    let gameText = "Game Section";
    let d = dist(mouseX, mouseY, width / 2, height / 2);
    let scaleFactor = (d < 80) ? lerp(1.0, 1.1, 0.1) : lerp(1.1, 1.0, 0.1);
    let fillColor = (d < 80) ? color(255, 0, 0) : color(255);
    push();
      translate(width / 2, height / 2);
      scale(scaleFactor);
      fill(fillColor);
      text(gameText, 0, 0);
    pop();

    // Texto parpadeante
    if (frameCount % 60 < 30) {
      textSize(20);
      fill(255, 255, 0);
      text("Press Game Section to start", width / 2, height / 2 + 70);
    }
    
    // Efecto ripple
    let tw = textWidth(gameText);
    let regionX = width / 2 - tw / 2 - 10;
    let regionY = height / 2 - 32 - 10;
    let regionW = tw + 20;
    let regionH = 64 + 20;
    if (mouseX > regionX && mouseX < regionX + regionW &&
        mouseY > regionY && mouseY < regionY + regionH) {
      if (frameCount % 15 === 0) {
        menuRipples.push(new Ripple(mouseX, mouseY));
      }
    }
    for (let i = menuRipples.length - 1; i >= 0; i--) {
      menuRipples[i].update();
      menuRipples[i].show();
      if (menuRipples[i].finished()) {
        menuRipples.splice(i, 1);
      }
    }
  }

  // Contact overview (efecto NeonPulse)
  if (maxFlashes === 4 && !contactActive) {
    if (frameCount % 5 === 0) {
      contactNeonPulses.push(new NeonPulse(mouseX, mouseY));
    }
    for (let i = contactNeonPulses.length - 1; i >= 0; i--) {
      contactNeonPulses[i].update();
      contactNeonPulses[i].show();
      if (contactNeonPulses[i].finished()) {
        contactNeonPulses.splice(i, 1);
      }
    }
  }

  // Social media overview
  if (maxFlashes === 5 && !smDetailActive) {
    for (let p of socialMediaParticles) {
      p.update();
      p.show();
      let d = dist(mouseX, mouseY, p.pos.x, p.pos.y);
      if (d < 50) {
        let repulse = p5.Vector.sub(p.pos, createVector(mouseX, mouseY));
        repulse.setMag(0.5);
        p.applyForce(repulse);
      }
    }
    // Líneas entre partículas
    for (let i = 0; i < socialMediaParticles.length; i++) {
      for (let j = i + 1; j < socialMediaParticles.length; j++) {
        let d = dist(
          socialMediaParticles[i].pos.x,
          socialMediaParticles[i].pos.y,
          socialMediaParticles[j].pos.x,
          socialMediaParticles[j].pos.y
        );
        if (d < 150) {
          let alpha = map(d, 0, 150, 255, 0);
          stroke(0, 255, 255, alpha);
          strokeWeight(2);
          line(
            socialMediaParticles[i].pos.x,
            socialMediaParticles[i].pos.y,
            socialMediaParticles[j].pos.x,
            socialMediaParticles[j].pos.y
          );
        }
      }
    }
  }
}

//===================== Título Sección Overview =====================
function displaySectionTitle() {
  let textContent = "";
  switch (maxFlashes) {
    case 1: textContent = "About me"; break;

    case 3: textContent = "Projects"; break;
    case 4: textContent = "Contact here"; break;
    case 5: textContent = "Social Media"; break;
  }
  let d = dist(mouseX, mouseY, width / 2, height / 2);
  let scaleFactor = (d < 80) ? lerp(1.0, 1.1, 0.1) : lerp(1.1, 1.0, 0.1);
  let fillColor = (d < 80) ? color(255, 0, 0) : color(255);
  push();
    translate(width / 2, height / 2);
    scale(scaleFactor);
    textFont(manropeFont);
    textSize(64);
    textAlign(CENTER, CENTER);
    fill(fillColor);
    text(textContent, 0, 0);
  pop();
}

//===================== mouseWheel =====================
function mouseWheel(event) {
  if (landing) return;
  if (aboutActive || projectDetail || contactActive || smDetailActive) {
    return;
  }
  if (event.delta < 0 && maxFlashes < 5) {
    maxFlashes++;
  } else if (event.delta > 0 && maxFlashes > 1) {
    maxFlashes--;
  }
  flashes = [];
  for (let i = 0; i < maxFlashes; i++) {
    flashes.push(new Particle(random(width), random(height), true));
  }
}

//===================== mousePressed =====================
function mousePressed() {
  // Landing
  if (landing) {
    landingIndexClicked();
    return;
  }

  // About me
  if (maxFlashes === 1) {
    if (!aboutActive) {
      let d = dist(mouseX, mouseY, width / 2, height / 2);
      if (d < 80) {
        aboutActive = true;
      }
    } else {
      // Botón "Back" (10,60,100,30)
      if (mouseX >= backBtnX && mouseX <= backBtnX + backBtnW &&
    mouseY >= backBtnY && mouseY <= backBtnY + backBtnH) {
  aboutActive = false;
}{
        aboutActive = false;
      }
    }
  }

  // Projects
  if (maxFlashes === 3) {
    if (!projectDetail) {
      for (let project of projects) {
        if (project.contains(mouseX, mouseY)) {
          projectDetail = true;
          break;
        }
      }
    } else {
      // Botón "Back" (10,60,100,30)
      if (mouseX > 10 && mouseX < 110 && mouseY > 60 && mouseY < 90) {
        projectDetail = false;
      }
    }
    // Burst
    if (!projectDetail) {
      for (let project of projects) {
        if (project.contains(mouseX, mouseY)) {
          projectParticleBursts.push(new ParticleBurst(project.pos.x, project.pos.y));
        }
      }
    }
  }

  // Contact
  if (maxFlashes === 4) {
    if (!contactActive) {
      let d = dist(mouseX, mouseY, width / 2, height / 2);
      if (d < 80) {
        contactActive = true;
        // Reiniciamos el formulario
        formVisible = true;
        sendMessage = "";
        removeContactForm();
      }
    } else {
      // Botón "Back"
      if (mouseX > 10 && mouseX < 110 && mouseY > 60 && mouseY < 90) {
        contactActive = false;
        removeContactForm();
      }
    }
  }

  // Social Media
  if (maxFlashes === 5) {
    if (!smDetailActive) {
      let d = dist(mouseX, mouseY, width / 2, height / 2);
      if (d < 80) {
        smDetailActive = true;
      }
    } else {
      // Botón "Back"
      if (mouseX >= backBtnX && mouseX <= backBtnX + backBtnW &&
    mouseY >= backBtnY && mouseY <= backBtnY + backBtnH) {
  aboutActive = false;
} {
        smDetailActive = false;
        
        for (let i = 0; i <                 iconLinks.length; i++) {
        let iconObj = iconLinks[i];
        let dIcon = dist(mouseX,           mouseY, iconObj.x,                 iconObj.y);
  if (dIcon < iconObj.size / 2) {
    window.open(iconObj.url, "_blank");
    }
  }

      }
      // Clic en un icono
      for (let i = 0; i < iconLinks.length; i++) {
        let iconObj = iconLinks[i];
        let dIcon = dist(mouseX, mouseY, iconObj.x, iconObj.y);
        if (dIcon < iconObj.size / 2) {
          window.open(iconObj.url, "_blank");
        }
      }
    }
  }

  // **Aquí agregas el bloque para Game Section:**
  if (maxFlashes === 2 && !aboutActive && !projectDetail && !contactActive && !smDetailActive) {
    let gameText = "Game Section";
    let tw = textWidth(gameText);
    let regionX = width / 2 - tw / 2 - 10;
    let regionY = height / 2 - 32 - 10;
    let regionW = tw + 20;
    let regionH = 64 + 20;
    if (mouseX > regionX && mouseX < regionX + regionW &&
        mouseY > regionY && mouseY < regionY + regionH) {
     
    }
  }
}


//===================== keyPressed =====================
function keyPressed() {
  // Sin efecto ESC: solo se sale con el botón "Back"
}
