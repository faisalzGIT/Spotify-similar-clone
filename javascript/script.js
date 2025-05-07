// JS
let currentSong = new Audio();
let songs;
let currFolder;

function formatSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Truncate decimals
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getsongs(folder) {	
	currFolder = folder;
	let a = await fetch(`${folder}/`);
	let response = await a.text();

	let div = document.createElement("div")
	div.innerHTML = response;

	let as = div.getElementsByTagName("a");

	songs = [];
	console.log('i wannna say Alhamdulillah');

	// pushing songs into songs[] array variable
	for (let index = 0; index < as.length; index++) {
		const element = as[index];
		if(element.href.endsWith(".mp3")){
			songs.push(element.href.split(`/${folder}/`)[1])
		}
	}
	//show all the songs in  the playlist

	let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
	songUL.innerHTML = "";
	for (const song of songs) {
		console.log("the main song " + song);
		
		songUL.innerHTML = songUL.innerHTML + `<li class="justForHover">
			<div class="info">
				<div>${song.replaceAll("-"," ").replace(".mp3","")}</div>
				<div>Song Artist</div>
			</div>
			<div class="playnow">
				<span>PLAY NOW</span>
				<img src="./assets/images/play.svg" alt="playnowkisvg">
			</div>
		</li>`
	}   

	// attach an event listener to each song
	Array.from(	document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
		e.addEventListener('click',element=>{
			// console.log(e.querySelector(".info").firstElementChild.innerHTML);
			playMusic(e.querySelector(".info").firstElementChild.innerHTML.replaceAll(" ","-") + ".mp3")
		})
	})

	return songs
}

//playMusic ka function
const playMusic = (track, pause=false)=>{ 
	currentSong.src = `/${currFolder}/` + track;
	if(!pause){
		currentSong.play();
		play.src = "./assets/images/pause.svg";
	}

	document.querySelector(".songinfo").innerHTML = track.replaceAll(".mp3","").replaceAll("-"," ");
	document.querySelector(".songtime").innerHTML = "00:00";
}

//display all the albums
async function displayAlbums() { 
	let a = await fetch(`Audios`);
	let response = await a.text();

	let div = document.createElement("div")
	div.innerHTML = response;

	let anchors = div.getElementsByTagName("a");
	let cardContainer = document.querySelector(".cardContainer");

	
	let array = Array.from(anchors)
		// console.log(e.href);
	let cardsHTML = "";
	for (const anchor of anchors) {
		const e = anchor;			
		if(e.href.includes("/Audios/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[1]
			//get the meta data of the folder
			console.log("the folder:"+ folder);
			
			let metadataFetch = await fetch(`Audios/`+folder+`/info.json`);
			console.log(`Fetching from: Audios/${folder}/info.json`);

			let response = await metadataFetch.json();
			// console.log(response);
			const imgSrc =  `/Audios/${folder}/img.jpg`
			cardsHTML += `<div data-folder="${folder}" class="card">
            <img src="${imgSrc}" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
            <div class="play">
                <img src="./assets/images/greenBtn.svg" alt="green button">
            </div>
        </div>`;
		}	
	}
	cardContainer.innerHTML += cardsHTML;

	//load playlist whenever card is clicked
	Array.from(document.getElementsByClassName("card")).forEach(e=>{
		e.addEventListener("click", async (item)=>{
			console.log(item.currentTarget);
			
			songs = await getsongs(`Audios/${item.currentTarget.dataset.folder}`);
			playMusic(songs[0]);
		})
	})
}
async function main() {
	// get the list o f all audios 
	await getsongs('Audios/cs'); 
	// console.log(songs);
	playMusic(songs[0], true);
	
	displayAlbums();
	// attach an EventListener to play
	play.addEventListener("click",()=>{
		if(currentSong.paused){
			currentSong.play();
			play.src = "./assets/images/pause.svg"
		} else{
			currentSong.pause();
			play.src = "./assets/images/play.svg"
		}
	})

	// listen for time update event
	currentSong.addEventListener("timeupdate",()=>{
		// console.log(currentSong.currentTime, currentSong.duration);
		document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/ ${formatSeconds(currentSong.duration)}`
		document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
	})


	//add event listener for seekbar
	document.querySelector(".seekbar").addEventListener("click", (e)=>{
		// console.log(e.target.getBoundingClientRect().width,e.offsetX);
		let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
		document.querySelector(".circle").style.left = percent + "%";
		currentSong.currentTime = (currentSong.duration*percent)/100;	
	})


	//hamburger open 
	document.querySelector(".hamburger").addEventListener("click", ()=>{
		document.querySelector(".left").style.left = "0%"
	})

	//hamburger open by playlist's card click
	document.querySelectorAll(".card").forEach((card)=>{
		card.addEventListener("click", ()=>{
			document.querySelector(".left").style.left = "0%";
		})
	})

	//hamburger close
	document.querySelector(".closeLogo").addEventListener("click", ()=>{
		document.querySelector(".left").style.left = "-100%"
	})

	// add event listener to previous
	previous.addEventListener("click", ()=>{
		let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
		if(index-1 >= 0){
			playMusic(songs[index-1]);
		} else{
			playMusic(songs[songs.length-1]);
		}
	})
	
	// add event listener to next
	next.addEventListener("click", ()=>{
		let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
		if((index+1) >= songs.length){
			playMusic(songs[0]);
		} else{
			playMusic(songs[index+1]);
		}
	})


	//Volume control
	document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
		currentSong.volume = parseInt(e.target.value)/ 100;
	})

	//Add eventlister to mute songs
	volumeKaBtn.addEventListener("click", () => {
    	if (currentSong.muted) {
        	currentSong.muted = false;
        	volumeKaBtn.src = "./assets/images/highVolume.svg"; // Mute icon
    	} else {
			volumeKaBtn.src = "./assets/images/noVolume.svg"; // Unmute icon
			currentSong.muted = true;
    	}
	});

	//Add eventlister to unmute songs when volume range is touched
	const volumeRange = document.getElementById("volumeRange");
	volumeRange.addEventListener("input", (event)=>{
		currentSong.muted = false;
	})
	
	//volume set Eventlistener for range input
	volumeRange.addEventListener("input", (event)=>{
		const volumeValue = event.target.value/100;
		currentSong.volume = volumeValue;
		currentSong.muted = false; // Unmute the audio

		if(volumeValue === 0){
			volumeKaBtn.src = "./assets/images/noVolume.svg"; // muted icon
		} else if(volumeValue <= 0.5){
			volumeKaBtn.src = "./assets/images/lowVolume.svg"; // low volume icon
		} else {
			volumeKaBtn.src = "./assets/images/highVolume.svg"; // high volume icon
		}	
	})


	//add eventListener to the space btn on keyboard
	document.addEventListener("keydown", (event)=>{
		if(event.code === "Space"){
			event.preventDefault(); // Prevent scrolling when pressing the spacebar
				if(currentSong.paused){
					currentSong.play();
					play.src = "./assets/images/pause.svg"
				} else{
					currentSong.pause();
					play.src = "./assets/images/play.svg"
				}
		}
	})
} 

main();   
   