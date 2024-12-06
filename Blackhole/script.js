window.onload = function () {
    // Polyfill for requestAnimationFrame
    window.requestAnimFrame = (function () {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        );
    })();

    var C = document.getElementById("C"); // Canvas element
    var ctx = C.getContext("2d"); // Canvas rendering context
    var num = 5000; // Number of stars
    var added_mass = 0;
    var holeRadius = 100;
    var radiusLimit = (C.width + C.height) / 30;
    var hole_volume = 0;
    var G = 0.05; // Gravitational constant

    var R = []; // Array to store stars
    var centerX = 0; // Global center X
    var centerY = 0; // Global center Y

    // Star object constructor
    var star = function (x, y, r, volume, color, angle, orbitRadius, angularSpeed, randomSpeed0, acceleration) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.volume = volume;
        this.color = color;
        this.angle = angle;
        this.orbitRadius = orbitRadius;
        this.angularSpeed = angularSpeed;
        this.randomSpeed0 = randomSpeed0;
        this.acceleration = acceleration;
    };

    // Function to create a star
    function makeStar(new_star) {
        var x, y, r, volume, color, angle, orbitRadius, angularSpeed, randomSpeed0, acceleration;

        x = centerX;
        y = centerY;
        r = Math.random() * 2 + 0.5;
        volume = (4 / 3) * Math.PI * Math.pow(r, 3);
        color = "rgba(255,255,255,1)";
        angle = Math.random() * 2 * Math.PI;

        if (new_star == 0) {
            orbitRadius = (Math.random() * (C.width + C.height)) / 3;
        } else {
            orbitRadius =
                Math.sqrt((C.width / 2 - C.width) ** 2 + (C.height / 2 - C.height) ** 2) + Math.random() * 200;
        }

        angularSpeed = 0.3 * Math.random() * (Math.PI / orbitRadius);
        randomSpeed0 = Math.random() * (Math.PI / (10 * orbitRadius));
        acceleration = 0;

        R.push(new star(x, y, r, volume, color, angle, orbitRadius, angularSpeed, randomSpeed0, acceleration));
    }

    // Function to set canvas size dynamically
    function setCanvasSize() {
        const pixelRatio = window.devicePixelRatio || 1; // Get device pixel ratio
        C.width = window.innerWidth * pixelRatio; // Scale canvas width
        C.height = window.innerHeight * pixelRatio; // Scale canvas height
        C.style.width = window.innerWidth + "px"; // CSS width
        C.style.height = window.innerHeight + "px"; // CSS height
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transforms
        ctx.scale(pixelRatio, pixelRatio); // Scale context for high-DPI displays

        // Update global center coordinates
        centerX = C.width / (2 * pixelRatio); // Logical center X
        centerY = C.height / (2 * pixelRatio); // Logical center Y

        radiusLimit = (C.width + C.height) / 10;
    }

    // Function to set the background color
    function setBG() {
        ctx.fillStyle = "rgba(255, 255, 255, 1)"; // White background
        ctx.fillRect(0, 0, C.width, C.height);
    }

    // Function to draw the center (black hole)
    function drawCenter() {
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#111";
        ctx.shadowBlur = holeRadius * 1.5;

        ctx.beginPath();
        ctx.arc(centerX, centerY, holeRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "none";
        ctx.shadowBlur = 0;

        if (holeRadius <= radiusLimit) {
            holeRadius = 2 * Math.sqrt(added_mass / Math.PI) + 75;
        }
    }

    // Function to update star properties
    function updateStar(i) {
        var star = R[i];

        star.x = centerX + Math.cos(star.angle) * star.orbitRadius;
        star.y = centerY + Math.sin(star.angle) * star.orbitRadius;
        star.angle += star.angularSpeed;

        star.acceleration =
            G * (star.r * hole_volume) / Math.pow(star.orbitRadius, 2) + 0.1;

        star.color =
            "rgba(111," +
            Math.round(255 * ((star.orbitRadius - holeRadius) / 200)) +
            "," +
            Math.round(255 * ((star.orbitRadius - holeRadius) / 200)) +
            ",1)";

        if (star.orbitRadius >= holeRadius) {
            star.orbitRadius -= star.acceleration;
        } else {
            added_mass += star.r;

            R.splice(i, 1);
            makeStar(1);
        }
    }

    // Function to check if a star is visible
    function isVisible(star) {
        if (
            star.x > C.width ||
            star.x + star.r < 0 ||
            star.y > C.height ||
            star.y + star.r < 0
        )
            return false;

        return true;
    }

    // Function to draw a star
    function drawStar(star) {
        ctx.fillStyle = star.color;

        ctx.beginPath();
        ctx.fillRect(star.x, star.y, star.r, star.r);
        ctx.fill();
    }

    // Main animation loop
    function loop() {
        setBG();
        var star;

        hole_volume = (3 / 4) * Math.PI * Math.pow(holeRadius, 3);
        for (var i = 0; i < R.length; i++) {
            star = R[i];
            if (isVisible(star)) drawStar(star);

            updateStar(i);
        }

        drawCenter();
        requestAnimFrame(loop);
    }

    // Initialize stars
    function init() {
        for (var i = 0; i < num; i++) {
            makeStar(0);
        }
    }

    // Event listener for window resizing
    window.addEventListener("resize", function () {
        setCanvasSize();
    });

    // Initial setup and start animation
    setCanvasSize();
    setBG();
    init();
    loop();
};