var canvas = document.getElementById('paint');
var ctx = canvas.getContext('2d');

var sketch = document.getElementById('sketch');
var sketch_style = getComputedStyle(sketch);
canvas.width = window.innerWidth - 90;
canvas.height = 2000;

var mouse = {x: 0, y: 0};

canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

/* Drawing on Paint App */
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

ctx.strokeStyle = "red";

function getColor(colour) {
    ctx.strokeStyle = colour;
}

function getSize(size) {
    ctx.lineWidth = size;
}

canvas.addEventListener('mousedown', function (e) {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);

    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function () {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function () {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

download.addEventListener("click", function () {
    html2canvas($("#sketch"), {
        onrendered: function(canvas) {
            var imgData = canvas.toDataURL('image/png');
            var doc = new jsPDF();
            doc.addImage(imgData, 'PNG', 10, 10);
            doc.save('sketch.pdf');
        }
    });
}, false);
