console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;
let albumName = document.querySelector(".albumName");
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });


    return songs;
};

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  // Highlight the current song in the playlist and scroll into view
  const songListItems = document.querySelectorAll(".songList li");
  songListItems.forEach((item) => {
    const songName = item
      .querySelector(".info")
      .firstElementChild.innerHTML.trim();
    if (decodeURI(songName) === decodeURI(track)) {
      item.classList.add("highlight");
      item.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      item.classList.remove("highlight");
    }
  });
};



async function displayAlbums() {
  console.log("displaying albums");
  try {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
        let folder = e.href.split("/").slice(-1)[0];
        // Get the metadata of the folder
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        let response = await a.json();
        cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="http://127.0.0.1:5500/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
      }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        console.log("Fetching Songs");
        let folder = item.currentTarget.dataset.folder;
        let albumTitle = item.currentTarget.querySelector("h2").textContent;
        displayAlbumName(albumTitle);
        songs = await getSongs(`songs/${folder}`);
        if (songs.length > 0) {
          playMusic(songs[0]);

        } else {
          console.log("No songs found in this folder.");
        }
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

const displayAlbumName = (albumName) => {
              document.querySelector(
                ".albumName"
              ).innerHTML = ` <svg class="invert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" color="#000000" fill="none">
                <path d="M21.5 12.5C21.5 18.0228 17.0228 22.5 11.5 22.5C5.97715 22.5 1.5 18.0228 1.5 12.5C1.5 6.97715 5.97715 2.5 11.5 2.5C12.6688 2.5 13.7907 2.70051 14.8333 3.06902" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M19.5 9C19.5 10.3807 18.3807 11.5 17 11.5C15.6193 11.5 14.5 10.3807 14.5 9C14.5 7.61929 15.6193 6.5 17 6.5C18.3807 6.5 19.5 7.61929 19.5 9ZM19.5 9V1.5C19.8333 2 20.1 4.1 22.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M13 12.5C13 11.6716 12.3284 11 11.5 11C10.6716 11 10 11.6716 10 12.5C10 13.3284 10.6716 14 11.5 14C12.3284 14 13 13.3284 13 12.5Z" stroke="currentColor" stroke-width="1.5" />
              </svg> ${albumName}`;
};

async function main() {
  // Get the list of all the songs
  await getSongs("songs/Uplifting_(mood)");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();
  displayAlbumName("Get up");

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // // Listen for timeupdate event
  // currentSong.addEventListener("timeupdate", () => {
  //   document.querySelector(
  //     ".songtime"
  //   ).textContent = `${secondsToMinutesSeconds(
  //     currentSong.currentTime
  //   )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
  //   const circle = document.querySelector(".circle");
  //   if (circle) {
  //     circle.style.left =
  //       (currentSong.currentTime / currentSong.duration) * 100 + "%";
  //   }
  // });

  // // Add an event listener to seekbar
  // document.querySelector(".seekbar").addEventListener("click", (e) => {
  //   let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  //   document.querySelector(".circle").style.left = percent + "%";
  //   currentSong.currentTime = (currentSong.duration * percent) / 100;
  // });

currentSong.addEventListener("timeupdate", () => {
  const currentTime = currentSong.currentTime;
  const duration = currentSong.duration;
  const percent = (currentTime / duration) * 100;

  document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(
    currentSong.currentTime
  )} / ${secondsToMinutesSeconds(currentSong.duration)}`;

  document.querySelector(".seekbar-progress").style.width = `${percent}%`;
  document.querySelector(".circle").style.left = `${percent}%`;
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
  const seekbar = e.target.closest(".seekbar");
  const rect = seekbar.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percent = (offsetX / seekbar.offsetWidth) * 100;
  currentSong.currentTime = (percent / 100) * currentSong.duration;

  document.querySelector(".seekbar-progress").style.width = `${percent}%`;
  document.querySelector(".circle").style.left = `${percent}%`;
});



  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
