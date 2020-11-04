// music.js
// Code for the music side of EonSound.
// Includes things such as building music components, playing songs, managing song details, etc.

window.musicQueue = [];
window.musicActive = {none: 'none'};
window.musicHistory = [];
window.player = new Plyr("audio", {})

$("#main_player").bind("ended", function () {
  endedSong();
});

function artistToString(artists) {
  if (artists.length == 1) { return artists[0].name }
  snippet = ''; for (let i = 0; i < artists.length; i++) { const artist = artists[i].name; if (i == artists.length - 1) { snippet = snippet + 'and ' + artist } else {snippet = snippet + artist + ', ' } }
  return snippet
}

function category(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    o = document.createElement('div')
    o.setAttribute('category_details', id)
    o.setAttribute('class', 'hidden animated fadeIn faster category')
    o.id = objectID

    o.innerHTML = `
    <img onclick="openCategory('${id}')" src="${data.icons[0].url}">
    <h3>${data.name}</h3>
    `

    $(`#${destinationID}`).get(0).appendChild(o)
    resolve('banger')
  })
}

function album(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {

    a = document.createElement('div')
    a.setAttribute('class', 'hidden animated fadeIn faster album')
    a.setAttribute('album_details', id)
    a.id = objectID

    if (data.artists_formatted) {
      artists = data.artists_formatted
    }
    else {
      artists = artistToString(data.artists)
    }

    if (!data.images || !data.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    if (data.total_tracks && data.total_tracks == 1) {
      data.name = data.name + ' - Single'
    }

    a.innerHTML = `
      <div class="content shadow">
        <img id="${data.id}PreviewImage" crossOrigin="Anonymous" onclick="openAlbum('${data.id}')" src="${data.images[0].url}">
        <div id="${data.id}PreviewFooter" class="albumFooter">
          <h4>${data.name}</h4>
          <p>${artists}</p>
        </div>
      </div>
    `;

    $(`#${destinationID}`).get(0).appendChild(a)
    $(`#${objectID}`).imagesLoaded(() => {
      window.setTimeout(() => {
        // Some browsers will take a while to finish.
        colorThiefify('albumPreview', data.id + 'PreviewImage', data.id + 'PreviewFooter')
      }, 500)
    })
    
    resolve('Success')
  })
}

function artist(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    b = document.createElement('div')
    b.setAttribute('class', 'hidden animated fadeIn faster artist')
    b.setAttribute('artist_details', id)
    b.id = objectID

    if (!data.images || !data.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    b.innerHTML = `
      <div class="content">
        <img onclick="openArtist('${id}')" src="${data.images[0].url}">
        <h4>${data.name}</h4>
      </div>
    `;

    $(`#${destinationID}`).get(0).appendChild(b)
    resolve('Success')
  })
}

function playlist(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    c = document.createElement('div')
    c.setAttribute('class', 'hidden animated fadeIn faster playlist spotifyPlaylist')
    c.setAttribute('playlist_details', id)
    c.id = objectID

    if (!data.images || !data.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    c.innerHTML = `
      <img onclick="openPlaylist('${id}')" src="${data.images[0].url}">
      <h4>${data.name}</h4>
      <p>${data.owner.display_name}</p>
    `;

    $(`#${destinationID}`).get(0).appendChild(c)
    resolve('Success')
  })
}

function userPlaylist(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    e = document.createElement('div')
    e.setAttribute('class', 'hidden animated fadeIn faster userPlaylist')
    e.setAttribute('playlist_details', id)
    e.setAttribute('onclick', "openUserPlaylist('" + id + "')")
    e.id = objectID

    e.innerHTML = `
      <img id="${objectID}image" class="${id}cover" crossOrigin="Anonymous" src="${data.cover}&${new Date().getTime()}">
      <h4>${data.name}</h4>
    `;

    g = document.createElement('button')
    g.setAttribute('class', 'animated fadeIn btn-text-primary playlistButton')
    g.innerHTML = data.name
    g.onclick = () => {
      addTrackToPlaylist(id);
      $('#playlistSelect').modal('hide')
      toggleBottomSheet('librarySheet')
    }
    $(`#playlistSelectItem`).get(0).appendChild(g)

    $(`#${destinationID}`).get(0).appendChild(e)
    resolve('Success')
  })
}

function track(id, data, objectID, destinationID, index, playlist) {
  return new Promise((resolve, reject) => {
    o = document.createElement('div')
    if (playlist == 'tracks') {
      desintationSpecific = ' trackLibraryItem'
    }
    o.setAttribute('class', 'hidden animated fadeIn faster userSong song' + desintationSpecific)
    o.setAttribute('track_details', id)
    o.id = objectID

    if (data.artists_display) {
      // Use first for now
      artists = data.artists_display.split(';').shift()
    }
    else {
      artists = artistToString(data.artists)
    }

    if (data.art) {
      art = data.art
    }
    else {
      if (!data.album.images || !data.album.images.length) {
        console.log('Minor issue. No image found. Skipping.');
        resolve('Nope');
      }
      else {
        art = data.album.images[0].url
      }
    }

    o.onclick = () => {
      queueSongWithoutData(id)
    }

    o.innerHTML = `
      <div class="content">
        <img src="${data.art}"></img>
        <b>${data.name}</b>
        <p>${artists}</p>
      </div>
    `

    $(`#${destinationID}`).get(0).appendChild(o)
    resolve('Success')
  })
}

function searchTrack(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    d = document.createElement('div')
    d.setAttribute('class', 'hidden animated fadeIn faster track song')
    d.setAttribute('track_details', id)
    d.id = objectID

    artists = artistToString(data.artists)

    if (!data.album.images || !data.album.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    d.innerHTML = `
      <img onclick="queueSongWithoutData('${id}')" src="${data.album.images[0].url}">
      <h4>${data.name}</h4>
      <p>${artists}</p>
    `;

    $(`#${destinationID}`).get(0).appendChild(d)
    resolve('Success')
  })
}

function userPlaylistSong(id, data, objectID, destinationID, index, playlist) {
  return new Promise((resolve, reject) => {
    f = document.createElement('div')
    f.setAttribute('class', 'userSong animated flipInX song')
    f.setAttribute('id', objectID)
    f.setAttribute('track_details', id)
    f.onclick = () => {
      playSongsAtIndex(index, playlist)
    }

    f.innerHTML = `
      <img src="${data.art}"></img>
      <b>${data.name}</b>
      <p>${data.artists}</p>
    `
    $(`#${destinationID}`).get(0).appendChild(f)
    resolve('Success')
  })
}

function albumSong(id, data, objectID, destinationID, index, album, art) {
  return new Promise((resolve, reject) => {
    h = document.createElement('div')
    h.setAttribute('class', 'albumSong animated flipInX song')
    h.setAttribute('id', objectID)
    h.setAttribute('track_details', id)
    h.onclick = () => {
      playSongsAtIndex(index, album)
    }

    h.innerHTML = `
      <div class="content">
        <img src="${art}"></img>
        <b>${data.name}</b>
        <p>${artistToString(data.artists)}</p>
      </div>
    `
    $(`#${destinationID}`).get(0).appendChild(h)
    resolve('Success')
  })
}

function playSongsAtIndex(index, content) {
  songSelection = [...musicData[content]]
  for (let i = 0; i < index; i++) {
    songSelection.shift()
  }  
  
  playSongs(false, songSelection)
}

async function playSongs(Id, externalData) {
  // Playlists will have sufficient data
  // Albums wont
  if (externalData) {
    // Allow for passing in external data
    musicDataPlay = externalData
  }
  else {
    // Use data from ID
    musicDataPlay = musicData[Id]
  }

  for (let n = 0; n < musicDataPlay.length; n++) {
    const playSongsSong = musicDataPlay[n];
    if (playSongsSong.url) {
      if (n == 0) {
        // Play it. (Clear queue and play first song)
        await playSong(playSongsSong)
      }
      else {
        // Queue it
        await queueSong(playSongsSong, true)
      }
    }
    else {
      if (n == 0) {
        // Play it. (Clear queue and play first song)
        await playSongWithoutData(playSongsSong.id)
      }
      else {
        // Queue it
        await queueSongWithoutData(playSongsSong.id, true)
      }
    }
  }

  if (musicQueue.length > 0) {
    $('#showQueue').removeClass('hidden')
  }
  
  visualQ_build()

}

function shuffleSongs(Id) {
  shuffleSongsData = shuffled(musicData[Id])
  playSongs(Id, shuffleSongsData)
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
    data = await goFetch(`tracks/${id}`)
  
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

async function playSongWithoutData(id) {
  return new Promise(async (resolve, reject) => {
    // Gather data, then queue

    data = await goFetch(`tracks/${id}`)
    
    savedData = {
      art: data.album.images[0].url,
      artists: artistToString(data.artists),
      id: data.id,
      name: data.name,
      url: undefined,
      spotifyURL: data.external_urls.spotify,
    }

    await playSong(savedData)
    resolve('Skiddopot')
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

async function playSong(data) {
  return new Promise(async (resolve, reject) => {
    if (musicActive.none !== 'none') {
      // Song is playing while loading new song so move it to history
      // Move active song to history
      musicHistory.push(musicActive);
    }
  
    // Empty queue and play
    window.musicQueue = [];
    window.musicActive = {none: 'none'};
    await loadSong(data)
    resolve('Skiddyo')
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
    visualQ_build()
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

  for (let i = 0; i < musicQueue.length; i++) {
    const data = musicQueue[i]
    p = document.createElement('div')
    p.setAttribute('class', 'userSong animated flipInX song')
    p.setAttribute('track_details', data.id)
    p.onclick = () => {
      playSongsAtQueueIndex(i)
    }
  
    p.innerHTML = `
      <img src="${data.art}"></img>
      <b>${data.name}</b>
      <p>${data.artists}</p>
    `
    
    document.getElementById('queueItems').appendChild(p)
  }

}

async function playSongsAtQueueIndex(index) {
  musicQueue.splice('0', index)
  skipForward() 
}