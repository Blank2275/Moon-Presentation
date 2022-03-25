class Presentation{
    constructor(data, camera){
        this.data = data;
        this.stops = data["stops"];
        this.targetAngle = [0, 0];
        this.currentAngle = [0, 0];
        this.startLerpAngle = [0, 0];
        this.rotateSpeed = 0.03;
        this.r = 40;
        this.closeR = 23;
        this.farR = 40;
        this.maxRChangeSpeed = 2;
        this.defaultCloseR = this.closeR;
        this.defaultFarR = this.farR;
        this.camera = camera;
        this.lerpCutoff = 0.001;
        this.stop = 0;
        this.presentationData = [];
        this.rotateIdleSpeed = 0.001;
        this.mode = "point";
        
        this.setStartingLocation();
        this.getPresentationData().then(() => this.present());
    }
    async getPresentationData() {
        await fetch("/stops")
        .then(response => response.json())
        .then(data => this.presentationData = data);
    }
    present(){
        document.getElementById("presentation").innerHTML = this.presentationData[this.stop];
    }
    setStartingLocation() {
        var coords = this.stops[0]["coords"];
        this.zoomToPoint(coords[0], coords[1], 8192, 4096, this.closeR);
        this.camera.lookAt(0, 0, 0);
    }
    nextStop(){
        if(this.stop < this.stops.length - 1){
            this.stop += 1;
        } else {
            this.stop = 0;
        }
        var stop = this.stops[this.stop];
        var coord = stop["coords"];
        
        this.mode = stop["mode"];
        this.closeR = stop["closeR"] || this.defaultCloseR;
        this.farR = stop["farR"] || this.defaultFarR;
        
        if(this.mode == "point"){
            this.smoothZoomToPoint(coord[0], coord[1]);
        } else {
            this.smoothZoomToPoint(this.currentAngle[1], 2048);
        }
        this.present();
    }
    update(){//update every frame
        this.updateAngle(this.currentAngle, this.targetAngle, this.rotateSpeed);
        this.setCameraFromAngle(this.currentAngle, this.r);
    }
    //utility functions
    setCameraFromAngle(currentAngle, r) {
        var pos = this.altaz2xyz(currentAngle[0], currentAngle[1], r);
        this.camera.position.set(pos[0], pos[1], pos[2]);
        this.camera.lookAt(0, 0, 0);
    }

    updateAngle(current, target, rotateSpeed){
        if(current != target){
            var currentAlt = current[0];
            var currentAz = current[1];
            var targetAlt = target[0];
            var targetAz = target[1];
            
            //calculate r
            //pf = percent finished
            var pf = Math.abs(currentAz - this.startLerpAngle[1]) / Math.abs(targetAz - this.startLerpAngle[1]);
            var h = pf * (pf - 1) * (this.farR - this.closeR) * -4 + this.closeR;
            //this.r = h; // too sudden in some situations
            var diff = h - this.r;
            if(diff < 0) {this.r += Math.max(diff, -this.maxRChangeSpeed)}
            else {this.r += Math.min(diff, this.maxRChangeSpeed)}
            
            this.currentAngle[0] = this.lerp(currentAlt, targetAlt, rotateSpeed);
            this.currentAngle[1] = this.lerp(currentAz, targetAz, rotateSpeed);
            
            var dist = this.angleDistance(currentAlt, currentAz, targetAlt, targetAz);
            if(dist < this.lerpCutoff){
                this.currentAngle = target;
            }
        } 
            //spin around
        if(this.mode == "rotate"){
            this.targetAngle[1] += this.rotateIdleSpeed;
            this.currentAngle[1] += this.rotateIdleSpeed;
            this.startLerpAngle[1] += this.rotateIdleSpeed;
            if(this.currentAngle[1] > Math.PI * 2) {
                this.targetAngle[1] -= Math.PI * 2;
                this.currentAngle[1] -= Math.PI * 2;
                this.startLerpAngle[1] -= Math.PI * 2;
            }
        }
    }
    
    angleDistance(x1, y1, x2, y2){
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    lerp(a, b, x){
        return a + (b - a) * x;
    }

    smoothZoomToPoint(x, y, width = 8192, height = 4096){
        this.targetAngle = this.point2angle(x, y, width, height);
        this.startLerpAngle = [...this.currentAngle];
    }

    zoomToPoint(x, y, width = 8192, height = 4096, r = 50) {
        var angle = this.point2angle(x, y, width, height);
        var pos = this.altaz2xyz(angle[0], angle[1], r);
        this.startLerpAngle = [...this.currentAngle];
        this.targetAngle = angle;
        this.camera.position.set(pos[0], pos[1], pos[2]);
        this.camera.lookAt(0, 0, 0);
    }

    point2angle(x, y, width, height) {
        //var relativeX = x - width / -2;
        var relativeY = (y - height / 2) * -1;
        
        var az = (x - width / 2) / width * 2 * Math.PI;
        var alt = Math.asin(relativeY / height * 2);
        return [alt, az];
    }

    altaz2xyz(alt, az, r){
        var x = r;
        var y = 0;
        var z = 0;
        
        //z (alt) 
        var xp = x * Math.cos(alt) - y * Math.sin(alt);
        var yp = x * Math.sin(alt) + y * Math.cos(alt);
        var zp = z;
        
        //y (az)
        var zdp = zp * Math.cos(az) - xp * Math.sin(az);
        var xdp = zp * Math.sin(az) + xp * Math.cos(az);
        var ydp = yp;

        return [xdp, ydp, zdp];
    }
}