window.musicQueue = [];
window.musicActive = {none: 'none'};
window.musicHistory = [];
window.player = new Plyr("audio", {})

$("#main_player").bind("ended", function () {
  endedSong();
});

document.getElementById("searchbox1").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById('sbuton').click()
  }
});

document.getElementById("partyfield1").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById('gobtnjoin').click()
  }
});

// live.js
// Listening parties scripts.

function artistToString(artists) {
  if (artists.length == 1) {
    return artists[0].name
  }
  
  snippet = ''

  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i].name;
    if (i == artists.length - 1) {
      // Last item
      snippet = snippet + 'and ' + artist
    }
    else {
      // Regular item
      snippet = snippet + artist + ', '
    }
  }

  return snippet
}

var firebaseConfig = {
  apiKey: "AIzaSyBNf1JpByuDebVLq_lns8fYv4Pyo3kzvoM",
  authDomain: "eonsound.firebaseapp.com",
  databaseURL: "https://eonsound.firebaseio.com",
  projectId: "eonsound",
  storageBucket: "eonsound.appspot.com",
  messagingSenderId: "824179683788",
  appId: "1:824179683788:web:81830e10e40b4b887ded69",
};
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.

		window.user = user;

    if (!user.emailVerified) {
      window.location.replace("app.html");
      return;
    }

    left()

  } else {
    window.location.replace("welcome.html");
  }
});

async function createParty() {
  // Generate ID, show ID, open the ID.

  docRef = await db.collection('parties').add({
    owner: user.uid
  })

  Snackbar.show({text: "Party created"})

  joinParty(docRef.id)

}

async function joinParty(id) {
  // Opening party

  doc = await db.collection('parties').doc(id).get()

  if (doc.data().owner == user.uid) {
    $('#owner').removeClass('hidden')
    $('#nonowner').addClass('hidden')
    loadOwner(doc)
  }
  else {
    $('#nonowner').removeClass('hidden')
    $('#nonowner').addClass('hidden')
    loadNonOwner(doc)
  }

  joined()
}

async function joined() {
  $('#unjoined').addClass('hidden')
  $('#joined').removeClass('hidden')
}

async function left() {
  $('#unjoined').removeClass('hidden')
  $('#joined').addClass('hidden')
}

async function loadNonOwner(doc) {

}

async function loadOwner(doc) {
  initSpotifyCode();
}

async function initSpotifyCode() {
  // Check if access token stored in database is valid
  doc = await db.collection("users").doc(user.uid).collection("access").doc("spotify").get();
  if (!doc.exists) {
    alert('Cannot authenticate.'); window.location.replace("auth.html");
  }

  token = doc.data().access; window.spotifyToken = token;
  // Exchange refresh token for a new token
  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=", },
    body: `grant_type=refresh_token&refresh_token=${token}`,
  });
  if (result.status >= 400 && result.status < 600) {
    throw new Error("Bad response from server");
  }
  const data = await result.json();
  window.spotifyCode = data.access_token;
  } catch (error) {
    alert('Cannot authenticate. Try reauthenticating or contact support.')
    Snackbar.show({text: "If your password was changed, please reauthenticate <a href='auth.html'>here</a>."})
  }
}

async function refreshCode() {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=", },
    body: `grant_type=refresh_token&refresh_token=${spotifyToken}`,
  });

  const data = await result.json();
  window.spotifyCode = data.access_token;
}

async function search(term) {
  $('#searchbox1').val('')
  if (term == '') {
    return;
  }

  const result = await fetch( `https://api.spotify.com/v1/search?q=${term}&type=track`, { method: "GET", headers: { Authorization: `Bearer ${spotifyCode}`, }, } );
  const data = await result.json();

  if (data.error) { 
    if (sessionStorage.getItem("errorAvoid") == "true") {
      // Don't start a loop of errors wasting code use.
      Snackbar.show({ text: "An error occured while searching" });
      return;
    }
    console.log("Error occured. Likely invalid code - request and do it again.");

    sessionStorage.setItem("errorAvoid", "true");  refreshCode(); search(term); return;
  }
  refreshCode(); sessionStorage.setItem("errorAvoid", "false");

  console.log(data);

  for (let i = 0; i < data.tracks.items.length; i++) {
    // Build search element.
    element = data.tracks.items[i]

    a = document.createElement('div')
    a.setAttribute('class', 'track')
    a.setAttribute('onclick', `queueSongWithoutData('${element.id}')`)

    a.innerHTML = `
      <img src="${element.album.images[0].url}"></img>
      <h3>${element.name}</h3>
      <p>${artistToString(element.artists)}</p>
    `
    
    $('#musicSearch').get(0).appendChild(a)
  }
  
  console.log(term);

}

async function downloadSong(trackID, spotifyURL, trackName) {
  return new Promise(async (resolve, reject) => {
    var requestSong = await firebase.functions().httpsCallable("requestSong");
    try {
      downloadedTrack = await requestSong({ trackID: trackID, trackURL: spotifyURL});
    } catch (error) {
      Snackbar.show({text: `${trackName} could not be downloaded.`,  pos: 'top-right'})
      resolve('no')
    }
    if(typeof(downloadedTrack.data) == 'string') {
      // default
      resolve(downloadedTrack.data)
    }
    else{
      resolve(downloadedTrack.data.song)
    }
    resolve(downloadedTrack)
  })
}

async function queueSongWithoutData(id, skipMsg) {
  return new Promise(async (resolve, reject) => {
    // Gather data, then queue
    const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyCode}`,
      },
    });

    const data = await result.json();

    if (data.error) {
      if (sessionStorage.getItem("errorAvoid") == "true") {
        Snackbar.show({ text: "An error occured while playing song",  pos: 'top-right' });
        return;
      }
      console.log("Error occured. Likely invalid code - request and do it again.");
      sessionStorage.setItem("errorAvoid", "true");
      refreshCode();
      queueSongWithoutData(id, skipMsg);
      return;
    }

    refreshCode();
    sessionStorage.setItem("errorAvoid", "false");

    savedData = {
      art: data.album.images[0].url,
      artists: artistToString(data.artists),
      id: data.id,
      name: data.name,
      url: undefined,
      spotifyURL: data.external_urls.spotify,
    }

    await queueSong(savedData, skipMsg)    
    resolve('Skidop freshski')
  })
}

async function endedQueue() {
  $('#queueProgress').addClass('zoomOut')
  $('#playing_album_cover').removeClass('zoomIn')
  $('#playing_album_cover').addClass('zoomOut')
  $('#nowplayingbutton').get(0).setAttribute('disabled', 'true')
  $('#nowplayingbutton').addClass('btn-disabled')
  $('#InjectedWidth').get(0).innerHTML = ``
  hidePlayer()
  visualQ_build()
  $('#showQueue').addClass('hidden')
}

async function queueSong(data, skipMsg) {
  return new Promise((resolve, reject) => {
    if (musicActive.none !== 'none') {
      // There's a song playing so add it to queue
      musicQueue.push(data)
      if (!skipMsg) {
        Snackbar.show({text: "Added to queue.", pos: 'top-right'})
        $('#showQueue').removeClass('hidden')
        visualQ_build()
      }
      resolve('Skiddyo potpot')
    }
    else {
      // Just play it
      resolve(loadSong(data))
      $('#showQueue').addClass('hidden')
    }
  })
}

async function loadSong(data) {
  return new Promise(async (resolve, reject) => {
    url = data.url
    showPlayer()
    $('#queueProgress').removeClass('zoomOut')
    $('#queueProgress').removeClass('hidden')
    $('#queueProgress').addClass('zoomIn')
    $('#playing_album_cover').removeClass('zoomIn')
    $('#playing_album_cover').addClass('zoomOut')
    $('#nowplayingbutton').get(0).setAttribute('disabled', 'true')
    $('#nowplayingbutton').addClass('btn-disabled')
    if (!data.url) {
      loadertimer = window.setTimeout(() => {
        showLoader()
      }, 1500)
      url = await downloadSong(data.id, data.spotifyURL, data.name)
      window.clearInterval(loadertimer)
      hideLoader()
    }
  
    musicActive = data
    musicActive.url = url
  
    console.log(data);
    $('#main_player').get(0).setAttribute('src', url)
    $('#playing_album_cover').get(0).setAttribute('src', data.art)
    $('#playing_track_details').get(0).innerHTML = `<b>${data.name}</b>${data.artists}`
    $('#nowplayingbutton').get(0).onclick = () => {
      // More options button to set library changes to song
      window.prepare_library_changes = data
    }
  
    $('#queueProgress').removeClass('zoomIn')
    $('#queueProgress').addClass('zoomOut')
    $('#playing_album_cover').removeClass('zoomOut')
    $('#playing_album_cover').removeClass('hidden')
    $('#playing_album_cover').addClass('zoomIn')
    $('#nowplayingbutton').get(0).removeAttribute('disabled')
    $('#nowplayingbutton').removeClass('btn-disabled')
    calculatePlayerWidths()
    player.play()
    visualQ_build()

    resolve('successo expresso')
  })
}

async function endedSong() {
  // Song did end
  player.pause()

  // Move active song to history
  musicHistory.push(musicActive);

  musicActive = {none: 'none'}
  if (musicQueue.length > 0) {
    // Check if hide queue btn
    if (musicQueue.length == 1) {
      $('#showQueue').addClass('hidden')
    }

    // Next song
    loadSong(musicQueue[0])
    musicQueue.splice(0, 1)
  }
  else {
    // End queue
    endedQueue()
  }
}

function skipPrevious() {
  // Delete last element of history, to move it to first of queue
  // Twice as a dummy element to keep active song in front of next song.

  if (!musicHistory.length) {
    // Stop if there is no history to play.
    return;
  }

  if (musicActive.none !== "none") {
    // Song is playing, move it to first of queue
    musicQueue.unshift(musicActive);
  }

  // Play last element of history
  loadSong(musicHistory[musicHistory.length - 1], true);

  // Delete last element of history
  musicHistory.splice(musicHistory.length - 1, 1);
}

function skipForward() {
  endedSong();
}

function visualQ_build() {
  $('#queueItems').empty()

  document.getElementById('queueNow').innerHTML = `
    <div class="userSong animated fadeInUp song" track_details="${musicActive.id}">
      <img src="${musicActive.art}"></img>
      <b>${musicActive.name}</b>
      <p>${musicActive.artists}</p>
    </div>
  `

  if (musicQueue.length || musicActive.none !== 'none') {
    $('#qesit').removeClass('hidden')
    $('#quenot').addClass("hidden")
  }
  else {
    $('#qesit').addClass('hidden')
    $('#quenot').removeClass("hidden")
  }

  for (let i = 0; i < musicQueue.length; i++) {
    const data = musicQueue[i]
    p = document.createElement('div')
    p.setAttribute('class', 'userSong animated flipInX song')
    p.setAttribute('track_details', data.id)
    p.onclick = () => {
      playSongsAtQueueIndex('0', 'queue')
    }
  
    p.innerHTML = `
      <img src="${data.art}"></img>
      <b>${data.name}</b>
      <p>${data.artists}</p>
    `
    
    document.getElementById('queueItems').appendChild(p)
  }

}

function showPlayer() {
  $('#InjectedPlayer').get(0).innerHTML = `
    #usercard {
      bottom: 86px !important;
      transition: all 0.5s !important;
    }
    #loader {

    }
    
    #content {
      height: calc(100% - 131px) !important;
      transition: all 0.5s;
    }

    #chat {
      height: calc(100% - 95px) !important;
      transition: all 0.5s;
    }
  `
  $('#player').removeClass('fadeOutDown')
  $('#player').addClass('fadeInUp')
  $('#player').removeClass('hidden')
}

function hidePlayer() {
  $('#InjectedPlayer').get(0).innerHTML = ``
  $('#player').addClass('fadeOutDown')
  $('#player').removeClass('fadeInUp')
}

function calculatePlayerWidths() {
  textWidth = $('#playing_track_details').width()

  // + 32 - padding
  // + 50 - album image
  songActionWidth = textWidth + 32 + 50
  // + 185 - song action width
  // + 24 - padding
  contentWidth = songActionWidth + 185 + 24
  playerWidth = 'calc(100% - ' + contentWidth + 'px)'

  $('#InjectedWidth').get(0).innerHTML = `
  .songactions {
    left: ${songActionWidth}px !important;
    transition: all 1s !important;
  }

  #player .plyr {
    width: ${playerWidth} !important;
    transition: all 1s !important;
  }
  `
}

function showLoader() {
  $('#loader').removeClass('fadeOutRight')
  $('#loader').addClass('fadeInRight')
  $('#loader').removeClass('hidden')
}

function hideLoader() {
  $('#loader').removeClass('fadeInRight')
  $('#loader').addClass('fadeOutRight')
}
