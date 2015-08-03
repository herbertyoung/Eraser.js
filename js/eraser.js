(function(exports){
    var document = exports.document,
        hastouch = 'ontouchstart' in exports ? true : false,
        tapstart = hastouch ? 'touchstart' : 'mousedown',
        tapmove = hastouch ? 'touchmove' : 'mousemove',
        tapend = hastouch ? 'touchend' : 'mouseup',
        x1, y1, x2, y2;

    function Eraser(canvas, imgUrl){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imgUrl = imgUrl;
        this.timer = null;
        this.lineWidth = 30;
        this.gap = 10;
    };
    exports.Eraser = Eraser;

    Eraser.prototype = {
        init: function(args){
            for(var p in args){
                this[p] = args[p];
            }
            var _this = this,
                img = new Image();

            this.canvasWidth = this.canvas.width = Math.min(document.body.offsetWidth, 640);
            // this.canvasHeight = this.canvas.height;
            img.src = this.imgUrl;
            img.onload = function(){
                _this.canvasHeight = _this.canvasWidth * this.height / this.width;
                _this.canvas.height = _this.canvasHeight;
                _this.ctx.drawImage(this, 0, 0, _this.canvasWidth, _this.canvasHeight);
                _this.initEvent();
            };
        },
        initEvent: function(){
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.globalCompositeOperation = 'destination-out';

            this.tapMoveHandler = this.onTapMove.bind(this);
            this.tapStartHandler = this.onTapStart.bind(this);
            this.tapEndHandler = this.onTapEnd.bind(this);
            this.canvas.addEventListener(tapstart, this.tapStartHandler, false);
            this.canvas.addEventListener(tapend, this.tapEndHandler, false);
        },
        onTapStart: function(ev){
            ev.preventDefault();
            x1 = hastouch ? ev.targetTouches[0].pageX - this.canvas.offsetLeft : ev.pageX - this.canvas.offsetLeft;
            y1 = hastouch ? ev.targetTouches[0].pageY - this.canvas.offsetTop : ev.pageY - this.canvas.offsetTop;

            // this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, 1, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            // this.ctx.restore();

            this.canvas.addEventListener(tapmove, this.tapMoveHandler, false);
        },
        onTapMove: function(ev){
            ev.preventDefault();
            var _this = this,
                timer = this.timer;
            if(!timer){
                timer = setTimeout(function(){
                    x2 = hastouch ? ev.targetTouches[0].pageX - _this.canvas.offsetLeft : ev.pageX - _this.canvas.offsetLeft;
                    y2 = hastouch ? ev.targetTouches[0].pageY - _this.canvas.offsetTop : ev.pageY - _this.canvas.offsetTop;

                    // _this.ctx.save();
                    _this.ctx.moveTo(x1, y1);
                    _this.ctx.lineTo(x2, y2);
                    _this.ctx.stroke();
                    // _this.ctx.restore();

                    x1 = x2;
                    y1 = y2;
                }, 40);
            }
        },
        onTapEnd: function(ev){
            ev.preventDefault();
            var _this = this,
                i = 0,
                count = 0,
                imgData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

            for(var x=0; x<imgData.width; x+=this.gap){
                for(var y=0; y<imgData.height; y+=this.gap){
                    i = (y * imgData.width + x) * 4;
                    if(imgData.data[i + 3] > 0){
                        count++;
                    }
                }
            }
            if(count / (imgData.width * imgData.height / (this.gap * this.gap)) < 0.6){
                setTimeout(function(){
                    _this.removeEvent();
                    document.body.removeChild(_this.canvas);
                    _this.canvas = null;
                }, 40);
            }else{
                this.canvas.removeEventListener(tapmove, this.tapMoveHandler, false);
            }
        },
        removeEvent: function(){
            this.canvas.removeEventListener(tapstart, this.tapStartHandler, false);
            this.canvas.removeEventListener(tapend, this.tapEndHandler, false);
            this.canvas.removeEventListener(tapmove, this.tapMoveHandler, false);
        }
    };
})(window);