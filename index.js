let currentSong = new Audio()
let songs
let currentFolder

// Seconds to Minutes Conversion Function 

function secondsToMinutesAndSeconds(seconds) {
    // Ensure the input is a positive number
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the result with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Example usage:
const totalSeconds = 125;
const formattedTime = secondsToMinutesAndSeconds(totalSeconds);


// Get Seperate Songs From Our Songs Directory 
async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songs-lists").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        
                            <div class="song-artist-name">
                                <img class="invert" src="images/music.svg">
                                <p class="song-name">${song.replaceAll("%20", " ")}</p>
                            </div>
                            <div class="play-now">
                                <img class="invert" src="images/play.svg">
                                <p>Play</p>
                            </div>
                        
        </li>`
    }

    // Add an event listener to each song 
    Array.from(document.querySelector(".songs-lists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".song-name").innerHTML.trim())
        })

    })

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = `${track.replaceAll("%20", " ")}`
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}

// Function for Display all the albums on the page 
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]

            // Get the metadata of the folder 
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder ="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            <div class="play-btn">
                <img src="images/play-icon.svg">
            </div>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })

}


async function main() {
    // Show all the songs in the playlist
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page 
    displayAlbums()

    // Add an event listener on play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    // Listen for timupdate Event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener to hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener to close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < (songs.length)) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add an event to mute
     document.querySelector(".volumeIcon").addEventListener("click" , e=>{
        console.log(e)
     })

}

main()