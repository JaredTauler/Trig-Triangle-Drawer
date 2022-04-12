function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function getDistance(x1, y1, x2, y2) {
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

function DrawSelector(Triangles) {
    for (let tri of Triangles) {
        for (let point of tri.points) {
            // console.log(point)
            if (
                getDistance(...ClosestPoint.position, ...CursorPosition) >
                getDistance(...point.position, ...CursorPosition)
            ) {
                ClosestPoint = point
            }
        }
    }
    ctx.beginPath();
    ctx.arc(...ClosestPoint.position, 5, 0, 2 * Math.PI);
    ctx.stroke()
    return ClosestPoint
}

function DrawTriangle(triangles) {
    if (CurrentTriangle.length <= 1) {
        console.log("1 long")
        return
    }

    let sides = []
    let points = CurrentTriangle.points
    let hypo = [0, 0]
    // Get length of sides
    for (let i = 0; i < points.length; i++) {
        let [x1, y1] = points[i].position // current point
        let [x2, y2] = points[(i === 2) ? 0 : i + 1].position // next point

        let a = x1 - x2
        let b = y1 - y2

        let distance = Math.hypot(a, b)
        if (distance > hypo[1]) {
            hypo[0] = i
            hypo[1] = distance
        }
        sides.push([
            distance, // Calculate Distance
            [(x1 + x2) / 2, (y1 + y2) / 2], // Calculate midpoint of side
            i
        ])
    }

    // We need 2 loops because need next index's value when setting current index's value.
    for (let i = 0; i < sides.length; i++) {
        let side = triangles.points[i].side
        let val = sides[(i === 2) ? 0 : i + 1] // next value

        side.length = val[0]
        side.midpoint = val[1]
        side.hypo = val[2] === hypo[0]

    }

    // console.log(COS(sides))
    // console.log(COS(triangles.sides()))
    COS(triangles.sides())

    // Draw stuff
    ctx.beginPath();
    for (let i in triangles.points) {
        point = triangles.points[i]
        let [x, y] = point.position
        ctx.lineTo(x, y);

        ctx.font = "30px Arial";

        // Angle
        ctx.moveTo(x, y)
        ctx.fillText(`${point.angle}°`, x, y);

        // Side
        {
            ctx.font = "15px Arial";
            let [x, y] = point.side.midpoint
            if (point.side.hypo) {
                ctx.fillText(`hypo`, x, y);
            }

            // ctx.fillText(`${point.side.length}`, x, y);
            ctx.fillText(`${i}`, x, y);

        }

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

    push([x, y]) {
        this.points.push(new Point([x, y]))
        if (this.points.length > 3) {
            this.points.shift()
        }
    }
    sides() {
        let list = []
        for (let p of this.points) {
            list.push(p.side.length)
        }
        return list
    }
}

class Point {
    constructor([x, y]) {
        this.x = x
        this.y = y
        this.position = [this.x, this.y]
        this.angle = 0
        this.side = {
            "length": 0,
            "center": [0, 0],
            "hypo": false,
        }
    }
}

const CurrentTriangle = new Triangle()
var MouseUp_Interval_ID = 0

window.onmousedown = function (e) {
    // console.log(e)
    if (e.button === 0) {
        MouseUp_Interval_ID = setInterval(SetClosest, 20)
    } else {
        CurrentTriangle.push(CursorPosition)
    }
}

canvas.onmouseup = function (e) {
    clearInterval(MouseUp_Interval_ID)
}

function SetClosest() {
    ClosestPoint.position = CursorPosition
}


var ClosestPoint = new Point([null, null])
var CursorPosition = [null, null]
document.onmousemove = function (e) {
    GetCursorPosition(canvas, e)
}


setInterval(main, 20);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    DrawTriangle(CurrentTriangle)
    DrawSelector([CurrentTriangle])
    // ShowWork(CurrentTriangle)
    // ShowWork(CurrentTriangle)
}

// COS
function COS (sides) {
    let WorkLines = []
    let [a, b, c] = sides
    console.log(a.point)
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

    function Degrees(x) {
        return x * (180 / Math.PI)
    }

    v = [Math.acos([v[0]] * -1)] // Inverse of cosine
    f = v.map(round, 2)
    WorkLines.push(`Cos^-1(B)=${f[0]}°`)

    // console.log(WorkLines)
    // return Degrees(v[0])
}
