window.musicQueue = [];
window.musicActive = {none: 'none'};
window.musicHistory = [];

function artistToString(artists) {
  if (artists.length == 1) { return artists[0].name }
  snippet = ''; for (let i = 0; i < artists.length; i++) { const artist = artists[i].name; if (i == artists.length - 1) { snippet = snippet + 'and ' + artist } else {snippet = snippet + artist + ', ' } }
  return snippet
}

function album(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {

    a = document.createElement('div')
    a.setAttribute('class', 'hidden animated fadeIn album')
    a.setAttribute('album_details', id)
    a.id = objectID

    artists = artistToString(data.artists)

    if (!data.images || !data.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    a.innerHTML = `
      <img src="${data.images[0].url}">
      <h4>${data.name}</h4>
      <p>${artists}</p>
    `;

    $(`#${destinationID}`).get(0).appendChild(a)
    
    resolve('Success')
  })
}

function artist(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    b = document.createElement('div')
    b.setAttribute('class', 'hidden animated fadeIn artist')
    b.setAttribute('artist_details', id)
    b.id = objectID

    if (!data.images || !data.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    b.innerHTML = `
      <img src="${data.images[0].url}">
      <h4>${data.name}</h4>
    `;

    $(`#${destinationID}`).get(0).appendChild(b)
    resolve('Success')
  })
}

function playlist(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    c = document.createElement('div')
    c.setAttribute('class', 'hidden animated fadeIn playlist')
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

function track(id, data, objectID, destinationID) {
  return new Promise((resolve, reject) => {
    d = document.createElement('div')
    d.setAttribute('class', 'hidden animated fadeIn track')
    d.setAttribute('track_details', id)
    d.id = objectID

    artists = artistToString(data.artists)

    if (!data.album.images || !data.album.images.length) {
      console.log('Minor issue. No image found. Skipping.');
      resolve('Nope');
    }

    d.innerHTML = `
      <img onclick="playSongWithoutData('${id}')" src="${data.album.images[0].url}">
      <h4>${data.name}</h4>
      <p>${artists}</p>
    `;

    $(`#${destinationID}`).get(0).appendChild(d)
    resolve('Success')
  })
}

async function downloadSong(trackID, spotifyURL, trackName) {
  return new Promise(async (resolve, reject) => {
    var requestSong = await firebase.functions().httpsCallable("requestSong");
    try {
      track = await requestSong({ trackID: trackID, trackURL: spotifyURL});
    } catch (error) {
      Snackbar.show({text: `${trackName} could not be downloaded.`})
      reject(error)
    }
    if(typeof(track.data) == 'string') {
      // default
      resolve(track.data)
    }
    else{
      resolve(track.data.song)
    }
    resolve(track)
  })
}

async function queueSongWithoutData(id) {
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
      Snackbar.show({ text: "An error occured while playing song" });
      return;
    }
    console.log("Error occured. Likely invalid code - request and do it again.");
    sessionStorage.setItem("errorAvoid", "true");
    refreshCode();
    queueSongWithoutData(id);
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

  queueSong(savedData)

}

async function playSongWithoutData(id) {
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
      Snackbar.show({ text: "An error occured while playing song" });
      return;
    }
    console.log("Error occured. Likely invalid code - request and do it again.");
    sessionStorage.setItem("errorAvoid", "true");
    refreshCode();
    queueSongWithoutData(id);
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

  playSong(savedData)
}

async function queueSong(data) {
  if (musicActive.none !== 'none') {
    // There's a song playing so add it to queue
    musicQueue.push(data)
  }
  else {
    // Just play it
    loadSong(data)
  }
}

async function playSong(data) {
  // Empty queue and play
  window.musicQueue = [];
  window.musicActive = {none: 'none'};
  loadSong(data)
}

async function loadSong(data) {
  url = data.url
  if (!data.url) {
    url = await downloadSong(data.id, data.spotifyURL, data.name)
  }

  console.log(url);

}

