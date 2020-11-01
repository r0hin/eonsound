// views.js
// Important scripts relating to displaying artists, albums, tracks, playlists and more.
// Usually, these create a fullscreen element which is overlayed on top of the previous items.

window.musicData = {}
sessionStorage.removeItem('activeView')

function hideCurrentView(id) {
  if (id) {
    // Was manually pressed:
    sessionStorage.setItem('activeView', id)
    $(`#${id}`).removeClass('fadeIn')
    $(`#${id}`).addClass('fadeOut')
    window.setTimeout(() => {
      $(`#${sessionStorage.getItem('activeView')}`).addClass('hidden')
    }, 400)
    return;
  }
  // Do it for all:
  $('.media_view').removeClass('fadeIn')
  $('.media_view').addClass('fadeOut')
  window.setTimeout(() => {
    $('.media_view').addClass('hidden')
  }, 400)
}

async function openAlbum(id) {
  // Open spotify album of id
  sessionStorage.setItem('activeView', id + 'AlbumView')
  console.log('Opening album of ' + id);

  if ($(`#${id}AlbumView`).length) {
    $(`#${id}AlbumView`).removeClass('hidden')
    $(`#${id}AlbumView`).removeClass('fadeOut')
    $(`#${id}AlbumView`).addClass('fadeIn')
    return;
  }

  window.aeo = id
  window.apo = cacheUserAlbums

  toggleloader();

  // Album info
  const result = await fetch(
    `https://api.spotify.com/v1/albums/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyCode}`,
      },
    }
  );

  const data = await result.json();

  if (data.error) {
    if (sessionStorage.getItem("errorAvoid") == "true") {
      Snackbar.show({ text: "An error occured while searching" });
      return;
    }
    console.log( "Error occured. Likely invalid code - request and do it again." );
    sessionStorage.setItem("errorAvoid", "true");
    refreshCode();
    openAlbum(id);
    return;
  }

  // Has results in data
  refreshCode();
  sessionStorage.setItem("errorAvoid", "false");

  // Build the album
  g = document.createElement('div')
  g.setAttribute('class', 'animated hidden fadeIn media_view faster ' + id + 'AlbumView')
  g.setAttribute('id', id + 'AlbumView')
  g.innerHTML = `
    <button class="closePlaylistButton btn-contained-primary" onclick="hideCurrentView('${id}AlbumView')"><i class='bx bx-x'></i></button>

    <div class="playlistHeader row">
      <div class="col-sm">
        <center>
          <img crossOrigin="Anonymous" id="${id}cover" class="albumImg ${id}cover" src="${data.images[0].url}"></img>
        </center>
      </div>
      <div class="col-sm">
        <center>
          <h1>${data.name}</h1>
          <p>${artistToString(data.artists)}</p>
        </center>
      </div>
    </div>
    <br><br>
    <div class="row">
      <div class="col-sm"><center><button onclick="playSongs('${id}')" class="btn-contained-primary playPlaylistBtn">Play</button></center></div>
      <div class="col-sm"><center><button onclick="shuffleSongs('${id}')" class="btn-text-primary shufflePlaylistBtn">Shuffle</button></center></div>
      <div class="col-sm hidden animated fadeIn" id="addLibraryCol${id}"><center><button onclick="addAlbumToLibrary('${id}')" class="btn-contained-primary albumLibraryBtn">Add to Library</button></center></div>
    </div>
    <br><br>
    <div class="songList ${id}AlbumSongs" id="${id}AlbumSongs"></div>
    <br><br>
  `
  document.getElementById('album_view').appendChild(g)

  for (let j = 0; j < data.tracks.items.length; j++) {
    const openAlbumSong = data.tracks.items[j];
    await albumSong(openAlbumSong.id, openAlbumSong, id + openAlbumSong.id, id + 'AlbumSongs', j, id, data.images[0].url)
  }
  musicData[id] = data.tracks.items

  $(`#${id}AlbumView`).imagesLoaded(() => {
    // colorThiefify('userPlaylistView', playlistId + 'cover', playlistId + 'userplaylistgradientelement')
    $(`#${id}AlbumView`).removeClass('hidden')
    window.setTimeout(() => {toggleloader()}, 500)

    if (cacheUserAlbums.includes(id)) {
      // Added, don't show add button
      $(`#addLibraryCol${id}`).addClass('hidden')
    }
    else {
      // Not added, show add button
      $(`#addLibraryCol${id}`).removeClass('hidden')
    }
  })
  initButtonsContained()
  initButtonsText()

  console.log(data);

}

async function openUserPlaylist(id) {
  console.log('Opening playlist of ' + id);
  playlistId = id
  sessionStorage.setItem('activeView', playlistId + 'UserPlaylistView')

  if ($(`#${id}UserPlaylistView`).length) {
    $(`#${id}UserPlaylistView`).removeClass('hidden')
    $(`#${id}UserPlaylistView`).removeClass('fadeOut')
    $(`#${id}UserPlaylistView`).addClass('fadeIn')
    return;
  }

  toggleloader();

  doc = await db.collection('users').doc(user.uid).collection('library').doc(playlistId).get()
  openPlaylist = doc.data()

  // Build the playlist
  f = document.createElement('div')
  f.setAttribute('class', 'animated hidden fadeIn media_view faster ' + id + 'UserPlaylistView')
  f.setAttribute('id', playlistId + 'UserPlaylistView')

  description = openPlaylist.description
  if (openPlaylist.description == '') {
    description = 'No description set. Click to change.'
  }

  f.innerHTML = `
    <div class="playViewGradient" id="${playlistId}userplaylistgradientelement"></div>
    <button class="closePlaylistButton btn-contained-primary" onclick="hideCurrentView('${playlistId}UserPlaylistView')"><i class='bx bx-x'></i></button>
    <div class="playlistHeader row">
      <div class="col-sm">
        <center>
          <img crossOrigin="Anonymous" id="${playlistId}cover" class="myPlaylistImg ${playlistId}cover" src="${openPlaylist.cover}"></img>
          <div class="myPlaylistOverlay">
            <a onclick="changePlayCover('${playlistId}')" class="btn-contained-primary animated fadeInUp">Change Cover</a>
          </div>
        </center>
      </div>
      <div class="col-sm">
        <center>
          <h1>${openPlaylist.name}</h1>
          <span class="chip">${openPlaylist.publicity}</span> <span class="chip">${openPlaylist.last_updated.toDate().toString().split('GMT').shift()}</span>
          <br><br>
          <p class="playlistDescription" oninput="try {window.clearTimeout(descTimer)} catch(error) {}; descTimer = window.setTimeout(async () => {await db.collection('users').doc(user.uid).collection('library').doc('${playlistId}').update({description: this.innerHTML}); Snackbar.show({text: 'Description updated.', pos: 'top-right'})}, 3000)" contentEditable='true'>${description}</p>
        </center>
      </div>
    </div>
    <br><br>
    <div class="row">
      <div class="col-sm"><center><button onclick="playSongs('${playlistId}')" class="btn-contained-primary playPlaylistBtn">Play</button></center></div>
      <div class="col-sm"><center><button onclick="shuffleSongs('${playlistId}')" class="btn-text-primary shufflePlaylistBtn">Shuffle</button></center></div>
    </div>
    <br><br>
    <div class="songList ${playlistId}playlistSongs" id="${playlistId}playlistSongs"></div>
    <br><br>
  `
  document.getElementById('userplaylist_view').appendChild(f)
  for (let j = 0; j < openPlaylist.songs.length; j++) {
    const openPlaylistSong = openPlaylist.songs[j];
    await userPlaylistSong(openPlaylistSong.id, openPlaylistSong, playlistId + openPlaylistSong.id, playlistId + 'playlistSongs', j, playlistId)
  }
  musicData[playlistId] = openPlaylist.songs
  $(`#${playlistId}UserPlaylistView`).imagesLoaded(() => {
    colorThiefify('userPlaylistView', playlistId + 'cover', playlistId + 'userplaylistgradientelement')
    $(`#${id}UserPlaylistView`).removeClass('hidden')
    window.setTimeout(() => {toggleloader()}, 500)
  })
  initButtonsContained()
  initButtonsText()
}

async function openArtist(id) {
  // Open spotify album of id
  sessionStorage.setItem('activeView', id + 'ArtistView')
  console.log('Opening artist of ' + id);

  if ($(`#${id}ArtistView`).length) {
    $(`#${id}ArtistView`).removeClass('hidden')
    $(`#${id}ArtistView`).removeClass('fadeOut')
    $(`#${id}ArtistView`).addClass('fadeIn')
    return;
  }

  toggleloader();

  // Artist info
  const result = await fetch( `https://api.spotify.com/v1/artists/${id}`, { method: "GET", headers: { Authorization: `Bearer ${spotifyCode}`, }, } );
  const data = await result.json();
  if (data.error) { if (sessionStorage.getItem("errorAvoid") == "true") { Snackbar.show({ text: "An error occured while searching" }); return; } sessionStorage.setItem("errorAvoid", "true"); refreshCode(); openArtist(id);return; }
  refreshCode(); sessionStorage.setItem("errorAvoid", "false");

  // Artist Albums
  const resultS = await fetch( `https://api.spotify.com/v1/artists/${id}/albums`, { method: "GET", headers: { Authorization: `Bearer ${spotifyCode}`, }, } );
  const dataAlbums = await resultS.json();
  if (dataAlbums.error) { if (sessionStorage.getItem("errorAvoid") == "true") { Snackbar.show({ text: "An error occured while searching" }); return; } sessionStorage.setItem("errorAvoid", "true"); refreshCode(); openArtist(id);return; }
  refreshCode(); sessionStorage.setItem("errorAvoid", "false");

  console.log(dataAlbums);

  // Build the album
  g = document.createElement('div')
  g.setAttribute('class', 'animated hidden fadeIn media_view faster ' + id + 'ArtistView')
  g.setAttribute('id', id + 'ArtistView')
  popularity = data.followers.total / 2000000
  if (popularity >= 1)  {
    popularity = 100
  }
  else {
    popularity = popularity.toString().split('0.').pop()
    popularity = popularity.substring(0, 2)
    if (popularity[0] == '0') {
      popularity = popularity[1]
    }
  }
  g.innerHTML = `
    <button class="closePlaylistButton btn-contained-primary" onclick="hideCurrentView('${id}ArtistView')"><i class='bx bx-x'></i></button>

    <img class="artistHero" src="${data.images[0].url}"></img>
    <br><br><br><br>
    <center>
      <h1>${data.name}</h1>
      <p>${popularity}% Popularity</p>
    </center>
    <br><br><br><br><br>
    <div class="artist_albums" id="artist_albums_${data.id}"></div>

  `
  document.getElementById('artist_view').appendChild(g)
  
  // Fill up artist albums
  for (let i = 0; i < dataAlbums.items.length; i++) {
    await album(dataAlbums.items[i].id, dataAlbums.items[i], dataAlbums.items[i].id + 'albumItem', `artist_albums_${data.id}`)
    $('#' + dataAlbums.items[i].id + 'albumItem').imagesLoaded(() => {
      // colorThiefify('userPlaylistView', playlistId + 'cover', playlistId + 'userplaylistgradientelement')
      $('#' + dataAlbums.items[i].id + 'albumItem').removeClass('hidden')
    })
  }

  $(`#${id}ArtistView`).imagesLoaded(() => {
    // colorThiefify('userPlaylistView', playlistId + 'cover', playlistId + 'userplaylistgradientelement')
    $(`#${id}ArtistView`).removeClass('hidden')
    window.setTimeout(() => {toggleloader()}, 500)
  })

  initButtonsContained()

  console.log(data);
}

async function openPlaylist(id) {
  // Open Spotify Playlist of ID
  sessionStorage.setItem('activeView', id + 'PlaylistView')
  console.log('Opening playlist of ' + id);

  if ($(`#${id}PlaylistView`).length) {
    $(`#${id}PlaylistView`).removeClass('hidden')
    $(`#${id}PlaylistView`).removeClass('fadeOut')
    $(`#${id}PlaylistView`).addClass('fadeIn')
    return;
  }

  toggleloader();

  // Playlist info
  const result = await fetch( `https://api.spotify.com/v1/playlists/${id}`, { method: "GET", headers: { Authorization: `Bearer ${spotifyCode}`, }, } );
  const data = await result.json();
  if (data.error) { if (sessionStorage.getItem("errorAvoid") == "true") { Snackbar.show({ text: "An error occured while searching" }); return; } sessionStorage.setItem("errorAvoid", "true"); refreshCode(); openPlaylist(id);return; }
  refreshCode(); sessionStorage.setItem("errorAvoid", "false");

  // Build the album
  p = document.createElement('div')
  p.setAttribute('id', id + 'PlaylistView')
  p.setAttribute('class', 'animated hidden fadeIn media_view faster ' + id + 'PlaylistView')

  p.innerHTML = `
    <div class="playViewGradient" id="${id}playlistgradientelement"></div>
    <button class="closePlaylistButton btn-contained-primary" onclick="hideCurrentView('${id}PlaylistView')"><i class='bx bx-x'></i></button>
    <div class="playlistHeader row">
      <div class="col-sm">
        <center>
          <img crossOrigin="Anonymous" id="${id}cover" class="myPlaylistImg ${id}cover" src="${data.images[0].url}"></img>
        </center>
      </div>
      <div class="col-sm">
        <center>
          <h1>${data.name}</h1>
          <br>
          <p class="playlistDescription">${data.description}</p>
        </center>
      </div>
    </div>
    <br><br>
    <div class="row">
      <div class="col-sm"><center><button onclick="playSongs('${id}')" class="btn-contained-primary playPlaylistBtn">Play</button></center></div>
      <div class="col-sm"><center><button onclick="shuffleSongs('${id}')" class="btn-text-primary shufflePlaylistBtn">Shuffle</button></center></div>
    </div>
    <br><br>
    <div class="songList ${id}playlistSongs" id="${id}songList"></div>
    <br><br>
  `
  document.getElementById('playlist_view').appendChild(p)
  for (let j = 0; j < data.tracks.items.length; j++) {
    const openNonUserPlaylistSong = data.tracks.items[j];
    await albumSong(openNonUserPlaylistSong.track.id, openNonUserPlaylistSong.track, openNonUserPlaylistSong.track.id + 'playlistItem', id + 'songList', j, id, openNonUserPlaylistSong.track.album.images[0].url)
  }
  
  compressedTrackList = []
  for (let y = 0; y < data.tracks.items.length; y++) {
    compressedTrackList.push(data.tracks.items[y].track)
  }
  musicData[id] = compressedTrackList

  $(`#${id}PlaylistView`).imagesLoaded(() => {
    colorThiefify('userPlaylistView', id + 'cover', id + 'playlistgradientelement')
    $(`#${id}PlaylistView`).removeClass('hidden')
    window.setTimeout(() => {toggleloader()}, 500)
  })
  initButtonsContained()
  initButtonsText()
}