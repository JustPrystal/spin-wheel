const main = document.getElementById("main");
        const closePopup = document.getElementById("closePopup");
        const openPopup = document.getElementById("openPopup");
        const button = document.getElementById("spinButton");
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
        }, 1000);

        closePopup.addEventListener("click", () => {
            main.classList.remove("active");
            console.log("close");
        });
        openPopup.addEventListener("click", () => {
            main.classList.add("active");
        });

        const colors = ["#672cb8", "#956bcd"]; // Cycle between the first and second colors
        const values = [
            { label: "100 EUR Rabatt", value: "100" },
            { label: "0 EUR", value: "€0" },
            { label: "200 EUR Rabatt", value: "200" },
            { label: "75 EUR Rabatt", value: "75" },
            { label: "10 EUR Rabatt", value: "10" },
            { label: "20 EUR Rabatt", value: "20" },
            { label: "0 EUR", value: "0" },
            { label: "50 EUR Rabatt", value: "50" },
            { label: "30 EUR Rabatt", value: "30" },
            { label: "150 EUR Rabatt", value: "150" }
        ];

        let startAngle = 0;
        const arc = Math.PI * 2 / values.length; // Calculate arc based on the number of values
        let spinTimeout = null;
        let spinArcStart = 10;
        let spinTime = 0;
        let spinTimeTotal = 0;

        let ctx;
        const img = new Image();
        img.src = 'pointer.svg';

        let isSpinning = false;

        let spinResult = localStorage.getItem('spinResult');
        let hasSpun = localStorage.getItem('hasSpun') === 'true';

        const drawSpinWheel = () => {
            const button = document.getElementById("spinButton");
            const canvas = document.getElementById("wheelCanvas");

            canvas.width = 600; // Set canvas width dynamically
            canvas.height = 600; // Set canvas height dynamically

            if (canvas.getContext) {
                const canvasSize = Math.min(canvas.width, canvas.height);
                const outsideRadius = canvasSize / 2 - 20; // Reduce outer circle radius to add a smaller gap
                const textRadius = outsideRadius - 100; // Adjust text radius for responsiveness
                const insideRadius = 0;

                ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;

                ctx.font = `${canvasSize / 30}px Adamina, serif`; // Adjust font size based on canvas size

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(Math.PI / 2);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);

                for (let i = 0; i < values.length; i++) {
                    const angle = startAngle + i * arc;
                    ctx.fillStyle = colors[i % colors.length]; // Cycle through colors

                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
                    ctx.arc(canvas.width / 2, canvas.height / 2, insideRadius, angle + arc, angle, true);
                    ctx.fill();

                    ctx.save();
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = "white";
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.translate(canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius,
                        canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius);
                    ctx.rotate(angle + arc / 2); // Rotate the text to align with the arcs
                    const text = values[i].label;
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }

                ctx.restore();

                // Add border around the wheel
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, 0, Math.PI * 2, false);
                ctx.lineWidth = 5;
                ctx.strokeStyle = 'white';
                ctx.stroke();
            }
        };

        window.addEventListener('resize', drawSpinWheel); // Redraw the wheel on window resize

        const spin = () => {
            if (isSpinning) return;
            isSpinning = true;
            document.getElementById("spinButton").removeEventListener("click", spin); // Remove event listener to disable the button
            spinAngleStart = Math.random() * 10 + 10;
            spinTime = 0;
            spinTimeTotal = Math.random() * 3 + 6 * 1000;
            rotateWheel();
        };

        const rotateWheel = () => {
            spinTime += 15;

            if (spinTime >= spinTimeTotal) {
                stopRotateWheel();
                return;
            }
            const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
            startAngle += (spinAngle * Math.PI / 180);
            drawSpinWheel();
            spinTimeout = setTimeout(rotateWheel, 15);
        };

        const stopRotateWheel = () => {
            clearTimeout(spinTimeout);
            const degrees = startAngle * 180 / Math.PI + 90;
            const arcd = arc * 180 / Math.PI;
            const index = Math.floor((360 - degrees % 360) / arcd);
            const text = values[index].value;
            const messageElement = document.getElementById("message");
            const descriptionElement = document.getElementById("description");

            // Apply fade-out animation
            messageElement.classList.remove("fade-in");
            messageElement.classList.add("fade-out");
            descriptionElement.classList.remove("fade-in");
            descriptionElement.classList.add("fade-out");
            button.classList.remove("fade-in");
            button.classList.add("fade-out");

            // Change the text after the fade-out animation completes
            setTimeout(() => {
                localStorage.setItem('hasSpun', true);
                if (!localStorage.getItem('spinResult')) {
                    localStorage.setItem('spinResult', text);
                }
                messageElement.innerHTML = `<p>Herzlichen Glückwunsch, Du hast einen ${text}€ Tattoo-Rabatt gewonnen 🎉</p>`;
                descriptionElement.innerHTML = "Klicke jetzt den Button um den Rabatt zu erhalten";
                button.innerHTML = "Rabatt anfordern!";
                button.setAttribute('href', '/?coupon=' + text); // Set the href attribute

                messageElement.classList.remove("fade-out");
                messageElement.classList.add("fade-in");

                descriptionElement.classList.remove("fade-out");
                descriptionElement.classList.add("fade-in");

                button.classList.remove("fade-out");
                button.classList.add("fade-in");

                // Add a new event listener to redirect to the link
                button.addEventListener("click", () => {
                    window.location.href = button.getAttribute('href');
                });

            }, 1000); // Match the duration of the fade-out animation

            isSpinning = false;
        };

        if (hasSpun) {
            spinResult = localStorage.getItem('spinResult');
            const messageElement = document.getElementById("message");
            const descriptionElement = document.getElementById("description");
            const button = document.getElementById("spinButton");

            messageElement.innerHTML = `<p>Herzlichen Glückwunsch, Du hast einen ${spinResult}€ Tattoo-Rabatt gewonnen 🎉</p>`;
            descriptionElement.innerHTML = "Klicke jetzt den Button um den Rabatt zu erhalten";
            button.innerHTML = "Rabatt anfordern!";
            button.setAttribute('href', '/?coupon=' + spinResult); // Set the href attribute

            // Add a new event listener to redirect to the link
            button.addEventListener("click", () => {
                window.location.href = button.getAttribute('href');
            });
        }

        const easeOut = (t, b, c, d) => {
            const ts = (t /= d) * t;
            const tc = ts * t;
            return b + c * (tc + -3 * ts + 3 * t);
        };

        document.getElementById("spinButton").addEventListener("click", spin); // Change event listener to the spin button

        img.onload = drawSpinWheel;
