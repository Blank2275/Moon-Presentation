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
        
        this.targetFreePosition = [0, 0, 0];
        this.currentFreePosition = [0, 0, 0];
        this.currentLookAtLocation = [0, 0, 0];
        this.targetLookAtLocation = [0, 0, 0];
        this.distCutoff = 0.5;
        this.panSpeed = 0.03;
        this.lastModeFree = false;
        
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
    changeStop(n){
        const previousMode = this.mode;
        this.transitionToFocused = false;
        this.stop += n;
        if(this.stop >= this.stops.length){
            this.stop = 0;
        } else if(this.stop < 0){
            this.stop = this.stops.length - 1;
        }
        var stop = this.stops[this.stop];
        var coord = stop["coords"];
        
        this.mode = stop["mode"];
        this.closeR = stop["closeR"] || this.defaultCloseR;
        this.farR = stop["farR"] || this.defaultFarR;
        
        if(this.mode == "point"){
            // if(this.lastModeFree == true){
            //     this.freeToFocused();
            // } else{
                this.smoothZoomToPoint(coord[0], coord[1]);
            //}
            
        } else if(this.mode == "rotate") {
            // if(this.lastModeFree = true){
            //     this.freeToFocused();
            // } else{
            //     console.log("lol")
                this.rotateIdleSpeed = stop["speed"] || 0.001;
                this.smoothZoomToPoint(this.az2x(this.currentAngle[1]), 2048);
            //}
            
        } else if(this.mode == "free"){
            this.targetFreePosition = stop["coords"];
            this.currentFreePosition = [camera.position.x, camera.position.y, camera.position.z];
            this.targetLookAtLocation = stop["lookAt"];
        }
        this.present();
        this.lastModeFree = false;
    }
    freeToFocused(){
            var angle = this.point2angle(4000, 2048, 8192, 4096);
            var pos = this.altaz2xyz(angle[0], angle[1], this.r);
            this.targetFreePosition = pos;
            this.currentFreePosition = [camera.position.x, camera.position.y, camera.position.z];
            this.targetLookAtLocation = [0, 0, 0];
            this.transitionToFocused = true;
            this.mode = "free";
            
    }
    update(){//update every frame
        this.updateAngle(this.currentAngle, this.targetAngle, this.rotateSpeed);
        //this.updateFreePosition(this.currentFreePosition, this.targetFreePosition, this.panSpeed);
        if(this.mode == "point" || this.mode == "rotate"){
            this.setCameraFromAngle(this.currentAngle, this.r);
        } else if(this.mode == "free"){
            this.setCameraFromPosition();
        }
        
    }
    updateFreePosition(current, target, panSpeed) {
        if(current != target){
            var currentX = current[0];
            var currentY = current[1];
            var currentZ = current[2];
            var targetX = target[0];
            var targetY = target[1];
            var targetZ = target[2];
            
            this.currentFreePosition[0] = this.lerp(currentX, targetX, panSpeed);
            this.currentFreePosition[1] = this.lerp(currentY, targetY, panSpeed);
            this.currentFreePosition[2] = this.lerp(currentZ, targetZ, panSpeed);
            
            //lerp lookat location
            current = this.currentLookAtLocation;
            target = [...this.targetLookAtLocation];
            var currentX = current[0];
            var currentY = current[1];
            var currentZ = current[2];
            var targetX = target[0];
            var targetY = target[1];
            var targetZ = target[2];
            
            this.currentLookAtLocation[0] = this.lerp(currentX, targetX, panSpeed);
            this.currentLookAtLocation[1] = this.lerp(currentY, targetY, panSpeed);
            this.currentLookAtLocation[2] = this.lerp(currentZ, targetZ, panSpeed);
            
            var dist = this.distance3D(currentX, currentY, currentZ, targetX, targetY, targetZ);
            if(dist < this.distCutoff){
                this.currentFreePosition = this.targetFreePosition;
                this.currentLookAtLocation = this.targetLookAtLocation;
                
                if(this.transitionToFocused == true){
                    this.mode == "point";
                    this.lastModeFree = true;
                    this.transitionToFocused = false;
                }
                
            }
        } 
    }
    setCameraFromPosition(){
        var pos = this.currentFreePosition;
        camera.position.set(pos[0], pos[1], pos[2]);
        var lookPos = this.currentLookAtLocation;
        camera.lookAt(lookPos[0], lookPos[1], lookPos[2]);
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
    az2x(az){
        let theta = (az - Math.PI / 2) / (2 * Math.PI);
        let x = theta * width + width;
        console.log(x)
        return x;
    }
    point2angle(x, y, width, height) {
        //var relativeX = x - width / -2;
        var relativeY = (y - height / 2) * -1;
        
        var az = (x - width / 2) / width * 2 * Math.PI + Math.PI / 2;
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
    distance3D(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2));
    }
}