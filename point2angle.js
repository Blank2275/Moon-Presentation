var width = 8192;
var height = 4096;
var x = 500;
var y = 3100;

function point2angle(x, y, width, height) {
    //var relativeX = x - width / -2;
    var relativeY = (y - height / 2) * -1;
    
    //console.log((x - width / 2) / width * 2 * Math.PI);
    var az = (x - width / 2) / width * 2 * Math.PI;
    var alt = Math.asin(relativeY / height);
    return [alt, az];
}

function altaz2xyz(alt, az, r){
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
    var ydp = y;
    
    return [zdp, xdp, ydp];
}
console.log(point2angle(x, y, width, height));