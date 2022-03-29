function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function getDistance(x1, y1, x2, y2){
    let y = x2 - x1;
    let x = y2 - y1;

    return Math.sqrt(x * x + y * y);
}
function GetCursorPosition(canvas, event) {
    let rect = canvas.getBoundingClientRect()
    let x = event.clientX - rect.left
    let y = event.clientY - rect.top
    CursorPosition = [x, y]
}
function DrawSelector (Triangles) {
    for (let tri of Triangles) {
        for (let point of tri.points) {
            // console.log(point)
            if (
                getDistance(...ClosestPoint.position, ...CursorPosition) >
                getDistance(...point.position, ...CursorPosition)
            )
            {
                ClosestPoint = point
            }
        }
    }
    ctx.beginPath();
    ctx.arc(...ClosestPoint.position, 5, 0, 2 * Math.PI);
    ctx.stroke()
    return ClosestPoint
}
function DrawTriangle (triangles) {
    if (CurrentTriangle.length <= 1) {
        console.log("1 long")
        return
    }

    ctx.beginPath();
    for (let i in triangles.points) {
        tri = triangles.points[i]
        let [x, y] = tri.position
        ctx.lineTo(x,y);
        ctx.moveTo(x,y)
        ctx.font = "30px Arial";
        ctx.fillText(`${tri.angle}°`, x,y);
        if (i === "2") {
            ctx.lineTo(...triangles.points[0].position)
        }
    }
    ctx.stroke();
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d');

ctx.strokeStyle = 'red';
ctx.lineWidth = 5;

class Triangle {
    constructor() {
        this.points = []
    }
    push([x,y]) {
        this.points.push(new Point([x,y]))
        if (this.points.length > 3) {
            this.points.shift()
        }
    }
}
class Point {
    constructor([x,y]) {
        this.x = x
        this.y = y
        this.position = [this.x,this.y]
        this.angle = 0
    }
}
const CurrentTriangle = new Triangle()
var MouseUp_Interval_ID = 0

window.onmousedown = function (e) {
    console.log(e)
    if (e.button === 0){
        MouseUp_Interval_ID = setInterval(SetClosest, 20)
    }
    else {
        CurrentTriangle.push(CursorPosition)
    }
}

canvas.onmouseup = function (e) {
    clearInterval(MouseUp_Interval_ID)
}

function SetClosest() {
    ClosestPoint.position = CursorPosition
}


var ClosestPoint = new Point([null,null])
var CursorPosition = [null, null]
document.onmousemove = function(e) {
    GetCursorPosition(canvas, e)
}


setInterval(main, 20);
function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    DrawTriangle(CurrentTriangle)
    DrawSelector([CurrentTriangle])
    ShowWork(CurrentTriangle)
    // ShowWork(CurrentTriangle)
}

function ShowWork (triangle) {
    let WorkLines = []

    let sides = []
    let points = triangle.points
    for (let i = 0; i < points.length; i++){
        let [x1,y1] = points[i].position // current point
        let [x2,y2] = points[(i===2) ? 0: i+1].position // next point
        let a = x1 - x2
        let b = y1 - y2
        sides.push(Math.hypot(a,b))
    }

    {
        let [a, b, c] = sides // Round all values to 2 decimal points
        // let [a, b, c] = [12,10,11]
        WorkLines.push(`${b}^2=${a}^2+${c}^2-2(${a})(${b})Cos(B)`)

        let v = [b*b,a*a,c*c,2*a*c]
        let f = v.map(round, 2)
        WorkLines.push(`${f[0]}=${f[1]}+${f[2]}-${f[3]}Cos(B)`)

        v = [v[0], v[1]+v[2], v[3]]
        f = v.map(round, 2)
        WorkLines.push(`${f[0]}=${f[1]}-${f[2]}Cos(B)`)
        WorkLines.push(`-${f[1]} -${f[1]}`)

        v = [v[0]-v[1], v[2]]
        f = v.map(round, 2)
        WorkLines.push(`${f[0]}=-${f[1]}`)
        WorkLines.push(`-${f[1]} -${f[1]}`)

        v = [v[0]/v[1]]
        f = v.map(round, 2)
        WorkLines.push(`Cos(B)=${f[0]}`)

        v = [
            Math.acos(v[0] * -1) *// Inverse of cosine
            (180/Math.PI) // convert from radians to degrees
        ]
        f = v.map(round, 2)
        WorkLines.push(`Cos^-1(B)=${f[0]}°`)
        points[0].angle = f
        console.log(sides)

    }
}
