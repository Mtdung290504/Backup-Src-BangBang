import Game from "./modules/Game.class.js";

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', startGame)
    : startGame('development');

/**
 * @param {'development' | 'production'} mode 
 */
function startGame(mode) {
    if(mode == 'development') {
        document.getElementById("start").style.display = 'none';
        const game = new Game();
        return;
    }

    document.getElementById("start").addEventListener("click", function(event) {
        event.target.style.display = 'none';
        if (isMobileDevice()) {
            setViewportScale(0.4);
        }
        requireConditions(() => {
            const game = new Game();
        });
    });

    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    function setViewportScale(scale) {
        let viewport = document.querySelector("meta[name=viewport]");
        if (!viewport) {
            viewport = document.createElement("meta");
            viewport.name = "viewport";
            document.head.appendChild(viewport);
        }
        viewport.content = `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=no`;
    }
}

function requireConditions(callback) {
    openFullScreen();
    lockOrientation();
    callback();
    
    function openFullScreen() {
        const elem = document.documentElement; // chọn toàn bộ trang web
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
    }

    function lockOrientation() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape").catch(function(error) {
                console.error("Khóa màn hình ngang thất bại:", error);
            });
        } else {
            alert("Thiết bị của bạn không hỗ trợ khóa màn hình.");
        }
    }    
}