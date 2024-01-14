
let currentSong = new Audio();
let currFolder;
let songs;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    /// show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
    <img class="invert" src="img/music.svg" alt="">
    <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
    </div>
    <div class="playnow">
        <span>
            Play Now
        </span>
        <img  class="invert" src="img/play.svg" alt="">
    </div>
</li>`;
    }
    // attach a eventlistner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());


        });
    });

    return songs;
}
//playing song..
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songsInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let ancors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    // console.log(ancors);
    let array = Array.from(ancors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // Array.from(ancors).forEach(async e => {

        if (e.href.includes("/songs/") && !e.href.includes(".htaaccess")) {
            let folder = e.href.split("/").slice(-2)[1];   //yha pe slice -1 or -2 dono dega..
            // Get the meta data of the folder.
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
            <div class="svg">
                <svg class="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    style="width: 50px; height: 50px;">
                    <circle cx="12" cy="12" r="11" fill="#00FF00" />
                    <path
                        d="M10.6219 8.41459C10.5562 8.37078 10.479 8.34741 10.4 8.34741C10.1791 8.34741 10 8.52649 10 8.74741V15.2526C10 15.3316 10.0234 15.4088 10.0672 15.4745C10.1897 15.6583 10.4381 15.708 10.6219 15.5854L15.5008 12.3328C15.5447 12.3035 15.5824 12.2658 15.6117 12.2219C15.7343 12.0381 15.6846 11.7897 15.5008 11.6672L10.6219 8.41459Z"
                        fill="#000000" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div> `

        }
    }
    // load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    })
}

async function main() {
    // let currentSong;
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // dipslay all the albums hwic are being played..
    displayAlbums();
    const play = document.getElementById('play');
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg";
        }
    });



    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}:
        ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    // add Event listener to seekbar
    document.querySelector(".seekar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;

    })


    // addEventListener for hamburger icon 
    const left = document.querySelector(".left");
    document.querySelector(".hamburger").addEventListener("click", () => {
        left.style.left = "0";

    })

    // addEventListener for close icon

    const leftt = document.querySelector(".left");
    document.querySelector(".close").addEventListener("click", () => {
        leftt.style.left = "-120%";

    });

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        // console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        // console.log(index);
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // add an event to volume
    // let range = document.querySelector(".range");
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume == 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/volume.svg", "img/mute.svg");
        }
        else{
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg");

        }
    });
    

    // load the playist whenever the card is clicked..
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);        //ye yha pe hame sare cards load karke dega..
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })

    // setting Event Listner to volume button 
    let volume = document.querySelector(".volume>img");

    volume.addEventListener("click", (e) => {
        // console.log(e.target);
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = "img/volume.svg";
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;


        }

    })

    // document.addEventListener("contextmenu", function (e) {
    //     e.preventDefault();
    // }, false);

}

main()















