/**
 *  autor: foqc
 *  github: foqc
 */
// noprotect
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

const WIDTH = 800
const HEIGHT = 600
ctx.canvas.width = WIDTH
ctx.canvas.height = HEIGHT

let worker
let colorPalette = []
let REAL_SET = { start: -2, end: 1 }
let IMAGINARY_SET = { start: -1, end: 1 }
const ZOOM_FACTOR = 0.1
const TASKS = []

var zoomingText = false;


var primes = [2,3,5,7,11,13,17,	19,	23,	29,	31,	37,	41,	43,	47,	53,	59,	61,	67,	71,
    73,	79,	83,	89,	97,	101, 103];
 
function hash(input){
    var text = input.toLowerCase();
    var hash = BigInt(1);
    for (var i = 0; i < text.length; i ++){
        hash = hash * BigInt((primes[text.charCodeAt(i) - 96])) * BigInt((text.length - i));
    }
    return(String(hash));
}


var instance = 0;
function zoomText(){
    if (zoomingText == true){
        var text = document.getElementById("input").value;
        var hashed = hash(text);
        console.log(hashed);
    
        var arrayX = hashed.match(/.{1,3}/g)
        var arrayY = [];
    
        for (let i = 1; i < arrayX.length; i = i + 1){
            arrayY.push(arrayX[i]); 
            arrayX.splice(i, 1);
        }
        
        for (let i = 0; i < arrayX.length; i ++){
            arrayX[i] = Number(arrayX[i]);
            if (arrayX[i] > 800) arrayX[i] = arrayX[i] - 200;
        }
        for (let i = 0; i < arrayY.length; i ++){
            arrayY[i] = Number(arrayY[i])
            if (arrayY[i] > 600) arrayY[i] = arrayY[i] - 400;
        }



        if(arrayX.length != arrayY.length){
            if (arrayX.length > arrayY.length){
                arrayX.pop();
            }else{
                arrayY.pop();
            }
        
        }
        console.log(arrayX);
        console.log(arrayY);
        console.log(arrayX.length);
        console.log(arrayY.length);

        var isBorder = false;
        while(isBorder == false){

            if (borders[arrayY[instance]][arrayX[instance]] == true){
                console.log(borders[arrayY[instance]][arrayX[instance]]);
                console.log(arrayX[instance]);
                console.log(arrayY[instance]);

                isBorder = true;
            }else{
                arrayY[instance] ++;
                if (arrayY[instance] > 600){
                    arrayY[instance] = 0;
                }
                arrayX[instance] ++;
                if (arrayX[instance] > 800){
                    arrayX[instance] = 0;
                }
            }
        }

        const zfw = (WIDTH * ZOOM_FACTOR)
        const zfh = (HEIGHT * ZOOM_FACTOR)
    
    
        REAL_SET = {
            start: getRelativePoint(arrayX[instance] - zfw, WIDTH, REAL_SET),
            end: getRelativePoint(arrayX[instance] + zfw, WIDTH, REAL_SET)
        }
        IMAGINARY_SET = {
            start: getRelativePoint(arrayY[instance] - zfh, HEIGHT, IMAGINARY_SET),
            end: getRelativePoint(arrayY[instance] + zfh, HEIGHT, IMAGINARY_SET)
        }
        instance ++;
        if (instance < arrayX.length){
            zoomingText = true;
        } else{
            zoomingText = false;
        }
    
        init()
        borders = new Array(800);
        for (var i = 0; i < borders.length; i++) {
            borders[i] = new Array(600);
        }




    }
}





 

const lagrange = ([X1, Y1], [X2, Y2], x) => (((Y1 * (x - X2)) / (X1 - X2)) + ((Y2 * (x - X1)) / (X2 - X1)))

const makeRGB = (r, g, b, k) => {
    const calculate = pair => parseInt(lagrange(pair[0], pair[1], k))
    if (isNaN(r)) r = calculate(r)
    if (isNaN(g)) g = calculate(g)
    if (isNaN(b)) b = calculate(b)

    return [r, g, b]
}

/**
 * get 250 colors from  interpolation (between 6 colors):
 * rgb(255, 0, 0) -> rgb(255, 255, 0) -> rgb(0, 255, 0)
 * rgb(0,255,255) -> rgb(0, 0, 255) -> rgb(255, 0, 255)
 */
const palette = (size = 250) => {
    const range = parseInt(size / 6)
    const colors = []
    let c
    for (let k = 0; k < size; k++) {
        if (k <= range)//red to yellow
            c = makeRGB(255, [[0, 0], [range, 255]], 0, k)
        else if (k <= range * 2)//yellow to green
            c = makeRGB([[range + 1, 255], [range * 2, 0]], 255, 0, k)
        else if (k <= range * 3)//green to cyan
            c = makeRGB(0, 255, [[range * 2 + 1, 0], [range * 3, 255]], k)
        else if (k <= range * 4)//cyan to blue
            c = makeRGB(0, [[range * 3 + 1, 255], [range * 4, 0]], 255, k)
        else if (k <= range * 5)//blue to purple
            c = makeRGB([[range * 4 + 1, 0], [range * 5, 255]], 0, 255, k)
        else//purple to red
            c = makeRGB(255, 0, [[range * 5 + 1, 255], [size - 1, 0]], k)

        colors.push(c)
    }
    return colors
}

const paletteBW = () => new Array(250).fill(0).map((_, i) => {
    const c = lagrange([0, 0], [250, 255], i)
    return [c, c, c]
})

const start = () => {
    for (let col = 0; col < WIDTH; col++) TASKS[col] = col
    worker.postMessage({ col: TASKS.shift() })
    
}

var borders = new Array(800);
for (var i = 0; i < borders.length; i++) {
    borders[i] = new Array(600);
  }

function getRandomBorderPoint(){
    var isBorder = false;

    while(isBorder == false){
        randomX = Math.floor(Math.random() * 800)
        randomY = Math.floor(Math.random() * 600)

        if (borders[randomY][randomX] == true){
            console.log(randomY + " " + randomX)
            isBorder = true;
            return [randomY, randomX];
        }
    }


}
var oo = 0;
const draw = (res) => {
    if (TASKS.length > 0)
        worker.postMessage({ col: TASKS.shift() })

    const { col, mandelbrotSets } = res.data
    var last = mandelbrotSets[0][1];
    for (let i = 0; i < HEIGHT; i++) {
        const [m, isMandelbrotSet] = mandelbrotSets[i]
        c = isMandelbrotSet ? [0, 0, 0] : colorPalette[m % (colorPalette.length - 1)]
        ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`
        ctx.fillRect(col, i, 1, 1)

        if (last != mandelbrotSets[i][1]){
            last = mandelbrotSets[i][1];
            borders[i][col] = true;
        }
        
    }
    oo ++;
    if(oo == 800){
        zoomText();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }

const init = () => {
    if (worker) worker.terminate()
    worker = new Worker('worker.js')
    worker.postMessage({ w: WIDTH, h: HEIGHT, realSet: REAL_SET, imaginarySet: IMAGINARY_SET, isSettingUp: true })
    start()
    colorPalette = palette()
    worker.onmessage = draw
}

canvas.addEventListener('dblclick', e => {
    const zfw = (WIDTH * ZOOM_FACTOR)
    const zfh = (HEIGHT * ZOOM_FACTOR)

    REAL_SET = {
        start: getRelativePoint(e.pageX - canvas.offsetLeft - zfw, WIDTH, REAL_SET),
        end: getRelativePoint(e.pageX - canvas.offsetLeft + zfw, WIDTH, REAL_SET)
    }
    IMAGINARY_SET = {
        start: getRelativePoint(e.pageY - canvas.offsetTop - zfh, HEIGHT, IMAGINARY_SET),
        end: getRelativePoint(e.pageY - canvas.offsetTop + zfh, HEIGHT, IMAGINARY_SET)
    }

    init()
})

function randomPoint(){
    const zfw = (WIDTH * ZOOM_FACTOR)
    const zfh = (HEIGHT * ZOOM_FACTOR)

    var point = getRandomBorderPoint();

    REAL_SET = {
        start: getRelativePoint(point[1] - zfw, WIDTH, REAL_SET),
        end: getRelativePoint(point[1] + zfw, WIDTH, REAL_SET)
    }
    IMAGINARY_SET = {
        start: getRelativePoint(point[0] - zfh, HEIGHT, IMAGINARY_SET),
        end: getRelativePoint(point[0] + zfh, HEIGHT, IMAGINARY_SET)
    }

    init()
    borders = new Array(800);
    for (var i = 0; i < borders.length; i++) {
        borders[i] = new Array(600);
    }
}


const getRelativePoint = (pixel, length, set) => set.start + (pixel / length) * (set.end - set.start)

init()