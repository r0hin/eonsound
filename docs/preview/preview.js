injectDark()
loadPreview()

function endRun() {
  $('.page').addClass('hidden')
  $('#done').removeClass('hidden')
}

async function obtainAuth() {
  return new Promise(async (resolve, reject) => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=",
      },
      body: `grant_type=client_credentials`,
    });
    
    const data = await result.json();

    window.spotifyCode = data.access_token
    resolve(true)
  })
}

async function loadPreview() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id')

  switch (type) {
    case 'album':
      await obtainAuth()
      loadAlbum(id)
      break;
    case 'track':
      await obtainAuth()
      loadTrack(id)
      break;
    case 'artist':
      await obtainAuth()
      loadArtist(id)
      break;
    case 'playlist':
      await obtainAuth()
      loadPlaylist(id)
      break;
    default:
      endRun()
      break;
  }

  $('.page').addClass('hidden')
  $('#contentView').removeClass('hidden')
}

async function loadAlbum(id) {
  data = await goFetch('albums/' + id)

  a = document.createElement('div')
  a.setAttribute('class', 'album')
  a.innerHTML = `
  <center>
    <img src="${data.images[0].url}"></img>
    <h2>${data.name}</h2>
    <h4>${artistToString(data.artists)}</h4>
    <p>${data.release_date}, ${data.total_tracks} tracks.</p>
    <br><br>
    <a href="https://r0hin.github.io/eonsound/" target="_blank" class="btn-contained-primary">Download EonSound</a>
  </center>
  `

  $('#contentView').get(0).appendChild(a)
  window.setTimeout(() => {
    initButtonsContained()
  }, 200)
}

async function loadTrack(id) {
  data = await goFetch('tracks/' + id)

  a = document.createElement('div')
  a.setAttribute('class', 'track')
  a.innerHTML = `
  <center>
    <img src="${data.album.images[0].url}"></img>
    <h2>${data.name}</h2>
    <h4>${artistToString(data.artists)}</h4>
    <br><br>
    <a href="https://r0hin.github.io/eonsound/" target="_blank" class="btn-contained-primary">Download EonSound</a>
  </center>
  `

  $('#contentView').get(0).appendChild(a)
  window.setTimeout(() => {
    initButtonsContained()
  }, 200)
}

async function loadArtist(id) {
  data = await goFetch('artists/' + id)

  a = document.createElement('div')
  a.setAttribute('class', 'artist')
  a.innerHTML = `
  <center>
    <img src="${data.images[0].url}"></img>
    <h2>${data.name}</h2>
    <br><br>
    <a href="https://r0hin.github.io/eonsound/" target="_blank" class="btn-contained-primary">Download EonSound</a>
  </center>
  `

  $('#contentView').get(0).appendChild(a)
  window.setTimeout(() => {
    initButtonsContained()
  }, 200)
}

async function loadPlaylist(id) {
  data = await goFetch('playlists/' + id)

  a = document.createElement('div')
  a.setAttribute('class', 'playlist')
  a.innerHTML = `
  <center>
    <img src="${data.images[0].url}"></img>
    <h2>${data.name}</h2>
    <br><br>
    <a href="https://r0hin.github.io/eonsound/" target="_blank" class="btn-contained-primary">Download EonSound</a>
  </center>
  `

  $('#contentView').get(0).appendChild(a)
  window.setTimeout(() => {
    initButtonsContained()
  }, 200)
}

async function loadUserPlaylist(id) {

}