// library.js
// Scripts relating to the user library and managing it.
// Called from various elements to interact with the library.
// Some stuff here is sensitive as it directly influences the database.

async function loadLibrary() {
  window.cacheUserArtists = []
  window.cacheUserAlbums = []
  window.cacheUserTracks = []
  window.cacheLikedAlbums = []
  window.cacheLikedArtists = []
  window.cacheLikedTracks = []

  doc = await db.collection('users').doc(user.uid).collection('spotify').doc('artists').get()
  if (doc.exists) {
    window.cacheUserArtists = doc.data().map
    window.cacheUserArtistsData = doc.data().artists
    window.cacheLikedArtists = doc.data().liked
    if (!doc.data().liked) {
      window.cacheLikedArtists = []
    }
  }
  else {
    window.cacheUserArtists = []
  }

  doc = await db.collection('users').doc(user.uid).collection('spotify').doc('albums').get()
  if (doc.exists) {
    window.cacheUserAlbums = doc.data().map
    window.cacheLikedAlbums = doc.data().liked
    if (!doc.data().liked) {
      window.cacheLikedAlbums = []
    }
    window.cacheUserAlbumsData = doc.data().albums
  }
  else {
    window.cacheUserAlbums = []
  }

  doc = await db.collection('users').doc(user.uid).collection('spotify').doc('tracks').get()
  if (doc.exists) {
    window.cacheUserTracks = doc.data().map
    window.cacheUserTracksData = doc.data().tracks
    window.cacheLikedTracks = doc.data().liked
    if (!doc.data().liked) {
      window.cacheLikedTracks = []
    }
  }
  else {
    window.cacheUserTracks = []
  }
}

async function loadLibraryTracks() {
  // data is cacheUserTracksData
  if (typeof(cacheUserTracksData) == "undefined") {
    // User not definted yet, library not defined yet...
    interval = window.setInterval(() => {
      if (typeof(cacheUserTracksData) !== "undefined") {
        window.clearInterval(interval)
        loadLibraryTracks()
      }
    }, 200)
    return;
  }

  if (cacheLikedTracks.length) {
    $('#favtext3').removeClass('hidden')
  }

  for (let i = 0; i < cacheUserTracksData.length; i++) {
    const temporaryTrackItem = cacheUserTracksData[i];
    if (cacheLikedTracks.includes(temporaryTrackItem.id)) {
      destinationID = 'favTracks'
    }
    else {
      destinationID = 'collectionTracks'
    }
    await track(temporaryTrackItem.id, temporaryTrackItem, 'libraryItem' + temporaryTrackItem.id, destinationID, i, 'tracks')

    musicData['tracks'] = cacheUserTracksData

    $('#songs').imagesLoaded(() => {
      $('#libraryItem' + temporaryTrackItem.id).removeClass("hidden");
    })   
  }

  updateTrackViews()
}

async function loadLibraryArtists() {
  // data is cacheUserAlbumsData
  if (typeof(cacheUserArtistsData) == "undefined") {
    // User not definted yet, library not defined yet...
    interval = window.setInterval(() => {
      if (typeof(cacheUserArtistsData) !== "undefined") {
        window.clearInterval(interval)
        loadLibraryArtists()
      }
    }, 200)
    return;
  }

  if (cacheLikedArtists.length) {
    $('#favtext2').removeClass('hidden')
  }

  for (let i = 0; i < cacheUserArtistsData.length; i++) {
    const temporaryArtistItem = cacheUserArtistsData[i];
    if (cacheLikedArtists.includes(temporaryArtistItem.id)) {
      destinationID = 'favArtists'
    }
    else {
      destinationID = 'collectionArtists'
    }
    await artist(temporaryArtistItem.id, {
      images: [{url: temporaryArtistItem.pfp}],
      name: temporaryArtistItem.name,
      id: temporaryArtistItem.id,
    }, 'libraryItem' + temporaryArtistItem.id, destinationID)

    $('#artists').imagesLoaded(() => {
      $('#libraryItem' + temporaryArtistItem.id).removeClass("hidden");
    })   
  }

  updateArtistViews()
  
  $('#collectionArtists').imagesLoaded(() => {
    masonryArtists()  
  })
}

async function loadLibraryAlbums() {
  // data is cacheUserAlbumsData
  if (typeof(cacheUserAlbumsData) == "undefined") {
    // User not definted yet, library not defined yet...
    interval = window.setInterval(() => {
      if (typeof(cacheUserAlbumsData) !== "undefined") {
        window.clearInterval(interval)
        loadLibraryAlbums()
      }
    }, 200)
    return;
  }

  if (cacheLikedAlbums.length) {
    $('#favtext').removeClass('hidden')
  }

  for (let i = 0; i < cacheUserAlbumsData.length; i++) {
    const temporaryAlbumItem = cacheUserAlbumsData[i];
    if (cacheLikedAlbums.includes(temporaryAlbumItem.id)) {
      destinationID = 'favAlbums'
    }
    else {
      destinationID = 'collectionAlbums'
    }
    await album(temporaryAlbumItem.id, {
      images: [{url: temporaryAlbumItem.art}],
      // Only do first artist for now
      artists_formatted:temporaryAlbumItem.artists_display.split(';')[0],
      name: temporaryAlbumItem.name,
      id: temporaryAlbumItem.id,
    }, 'libraryItem' + temporaryAlbumItem.id, destinationID)

    $('#albums').imagesLoaded(() => {
      $('#libraryItem' + temporaryAlbumItem.id).removeClass("hidden");
    })   
  }

  updateAlbumViews()
  
  $('#collectionAlbums').imagesLoaded(() => {
    masonryAlbums()  
  })
}

async function addTrackToPlaylist(playlistID) {
  // GET TRACK INFO
  const prepareTrackPlaylistTrack = prepare_library_changes

  // GET TRACK DOWNLOAD URL
  if (!prepareTrackPlaylistTrack.url) {
    prepareTrackPlaylistTrack.url = await downloadSong(prepareTrackPlaylistTrack.id, prepareTrackPlaylistTrack.spotifyURL, prepareTrackPlaylistTrack.name)
  }
  
  // ADD TRACK TO PLAYLIST
  await db.collection('users').doc(user.uid).collection('library').doc(playlistID).update({
    songs: firebase.firestore.FieldValue.arrayUnion(prepareTrackPlaylistTrack)
  })

  // ADD TRACK TO LIBRARY

  // ADD TRACK TO ARTISTS

  // ADD TRACK TO SONGS
  Snackbar.show({text: "Song added."})
}

async function addArtistToLibrary(id) {
  return new Promise(async (resolve, reject) => {
    if (cacheUserArtists.includes(id)) {
      resolve('Exists')
      return;
    }

    // Gather data
    const result = await fetch(
      `https://api.spotify.com/v1/artists/${id}`,
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
      addArtistToLibrary(id);
      return;
    }
  
    // Has results in data
    refreshCode();
    sessionStorage.setItem("errorAvoid", "false");

    await db.collection('users').doc(user.uid).collection('spotify').doc('artists').set({
      artists: firebase.firestore.FieldValue.arrayUnion({
        id: id,
        pfp: data.images[0].url,
        name: data.name
      }),
      map: firebase.firestore.FieldValue.arrayUnion(id)
    }, {merge: true})

    resolve('successo expresso')
    return;
  })
}

async function addAlbumToLibrary(id, skipUI) {
  return new Promise(async (resolve, reject) => {
    if (cacheUserArtists.includes(id)) {
      // Already contains
      resolve('gottempopot')
      return;
    }

    if (!skipUI) {
      Snackbar.show({text: "Adding"})
    }
    // Gather album details
    // Album info
    const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
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
        resolve('Ayo error skiddybobob')
        return;
      }
      console.log( "Error occured. Likely invalid code - request and do it again." );
      sessionStorage.setItem("errorAvoid", "true");
      refreshCode();
      await addAlbumToLibrary(id);
      resolve('ptpot')
      return;
    }
  
    // Has results in data
    refreshCode();
    sessionStorage.setItem("errorAvoid", "false");
  
    // Add it to all the artists
    for (let i = 0; i < data.artists.length; i++) {
      await addArtistToLibrary(data.artists[i].id)
    }  

    // For each song, add record in firebase
    for (let i = 0; i < data.tracks.items.length; i++) {
      const trackoskidy = data.tracks.items[i];
      thisArtistSnippet = ''; thisArtistSnippet2 = ''; for (let i = 0; i < trackoskidy.artists.length; i++) {
        thisArtistSnippet = thisArtistSnippet + trackoskidy.artists[i].id + ';'
        thisArtistSnippet2 = thisArtistSnippet2 + trackoskidy.artists[i].name + ';'
      }

      await db.collection("users").doc(user.uid).collection('spotify').doc('tracks').set({
        tracks: firebase.firestore.FieldValue.arrayUnion({
          art: data.images[0].url,
          artists: thisArtistSnippet,
          artists_display: thisArtistSnippet2,
          name: trackoskidy.name,
          id: trackoskidy.id,
        }),
        map: firebase.firestore.FieldValue.arrayUnion(trackoskidy.id)
      }, {merge: true})
    }

    // Add actual album now
    thisAlbumArtistSnippet = '';thisAlbumArtistSnippet2 = '';for (let i = 0; i < data.artists.length; i++) {
      thisAlbumArtistSnippet = thisAlbumArtistSnippet + data.artists[i].id + ';'
      thisAlbumArtistSnippet2 = thisAlbumArtistSnippet2 + data.artists[i].name + ';'
    }

    thisAlbumDataSnippet = {
      art: data.images[0].url,
      artists: thisAlbumArtistSnippet,
      artists_display: thisAlbumArtistSnippet2,
      name: data.name,
      id: data.id,
    }

    await db.collection('users').doc(user.uid).collection('spotify').doc('albums').set({
      albums: firebase.firestore.FieldValue.arrayUnion(thisAlbumDataSnippet),
      map: firebase.firestore.FieldValue.arrayUnion(data.id)
    }, {merge: true})
  
    // Added, now build

    await album(data.id, data, 'libraryItem' + data.id, 'collectionAlbums')
    cacheUserAlbumsData.push(thisAlbumDataSnippet)
    cacheUserAlbums.push(data.id)
 
    updateAlbumViews()
    masonryAlbums()

    if (!skipUI) {
      showcomplete()
    }

    // Remove button
    $(`#addLibraryCol${id}`).addClass('hidden')

    if (!skipUI) {
      Snackbar.show({text: "Added to library"})
    }
    resolve('skiddooo')
  })
}

async function addTrackToLibrary(id) {
  console.log('Add track to library');
}

async function addSpotifyPlaylistToLibrary(id) {
  // Spotify playlists to library:
  // Get playlist data, convert it, add the playlist. For each song, add the song, artist and album.
  return new Promise(async (resolve, reject) => {
    toggleloader(); Snackbar.show({text: "Converting..."})

    // Grab playlist data
    const result = await fetch( `https://api.spotify.com/v1/playlists/${id}`, { method: "GET", headers: { Authorization: `Bearer ${spotifyCode}`, }, } );
    const data = await result.json();
    if (data.error) { if (sessionStorage.getItem("errorAvoid") == "true") { Snackbar.show({ text: "An error occured while searching" }); return; } sessionStorage.setItem("errorAvoid", "true"); refreshCode(); addSpotifyPlaylistToLibrary(id);return; }
    refreshCode(); sessionStorage.setItem("errorAvoid", "false");

    await db.collection('users').doc(user.uid).collection('library').doc(id).set({
      name: data.name,
      publicity: "public",
      description: data.description,
      status: true,
      owner: {
        name: cacheuser.name,
        username: cacheuser.username,
        photo: cacheuser.url,
      },
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      last_updated:firebase.firestore.FieldValue.serverTimestamp(),
      songs: [],
      cover: "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/app%2Fempty_album.png?alt=media",
    })

    await db.collection('users').doc(user.uid).set({
      playlistsPreview: firebase.firestore.FieldValue.arrayUnion({
        cover: "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/covers%2F" + id + ".png?alt=media",
        name: data.name,
        status: true,
        id: id
      })
    }, {merge: true})

    var albumPhoto = firebase.functions().httpsCallable("albumPhoto");
    await albumPhoto({ id: id })
    
    // For each track
    formattedTracks = []
    for (let i = 0; i < data.tracks.items.length; i++) {
      const temporaryTrackItem = data.tracks.items[i].track;

      // Add to playlist...

      url = await downloadSong(temporaryTrackItem.id, temporaryTrackItem.external_urls.spotify, temporaryTrackItem.name)

      if (url === 'no') {
        continue;
      }

      await db.collection('users').doc(user.uid).collection('library').doc(id).set({
        songs: firebase.firestore.FieldValue.arrayUnion({
          art: temporaryTrackItem.album.images[0].url,
          artists: artistToString(temporaryTrackItem.artists),
          id: temporaryTrackItem.id,
          name: temporaryTrackItem.name,
          url: url,
        })
      }, {merge: true})

      // Add each album and that should be it. Adding album adds artist as well

      await addAlbumToLibrary(temporaryTrackItem.album.id, true)

      Snackbar.show({text: `Added ${i}/${data.tracks.items.length}`})

    }

    window.setTimeout(() => {
      toggleloader()
      showcomplete()
      Snackbar.show({text: "Saved to library."})
    }, 500)
    resolve('ayo')
  }) 
}

async function favAlbum(id) {
  $(`#libraryItem${id}`).removeClass('fadeIn')
  $(`#libraryItem${id}`).addClass('fadeOutUp')

  window.setTimeout(async () => {

    if (!cacheUserAlbums.includes(id)) {
      await addAlbumToLibrary(id)
    }

    await db.collection('users').doc(user.uid).collection('spotify').doc('albums').set({
      liked: firebase.firestore.FieldValue.arrayUnion(id)
    }, {merge: true})
    
    $(`#libraryItem${id}`).addClass('fadeIn')
    $(`#libraryItem${id}`).removeClass('fadeOutUp')

    $(`#favAlbums`).append($(`#libraryItem${id}`))
    cacheLikedAlbums.push(id)

    masonryAlbums() 
    updateAlbumViews()
  }, 650)

}

async function unfavAlbum(id) {
  $(`#libraryItem${id}`).removeClass('fadeIn')
  $(`#libraryItem${id}`).addClass('fadeOutDown')

  window.setTimeout(async () => {    
    await db.collection('users').doc(user.uid).collection('spotify').doc('albums').set({
      liked: firebase.firestore.FieldValue.arrayRemove(id)
    }, {merge: true})

    $(`#libraryItem${id}`).addClass('fadeIn')
    $(`#libraryItem${id}`).removeClass('fadeOutDown')

    $(`#collectionAlbums`).append($(`#libraryItem${id}`))
    cacheLikedAlbums.splice(cacheLikedAlbums.indexOf(id), 1);

    masonryAlbums() 
    updateAlbumViews()
  }, 650)
}

async function favTrack(id) {
  $(`#libraryItem${id}`).removeClass('fadeIn')
  $(`#libraryItem${id}`).addClass('fadeOutUp')

  window.setTimeout(async () => {

    if (!cacheUserTracks.includes(id)) {
      await addTrackToLibrary(id)
    }

    await db.collection('users').doc(user.uid).collection('spotify').doc('tracks').set({
      liked: firebase.firestore.FieldValue.arrayUnion(id)
    }, {merge: true})
    
    $(`#libraryItem${id}`).addClass('fadeIn')
    $(`#libraryItem${id}`).removeClass('fadeOutUp')

    $(`#favTracks`).append($(`#libraryItem${id}`))
    cacheLikedTracks.push(id)

     
    updateTrackViews()
  }, 650)

}

async function unfavTrack(id) {
  $(`#libraryItem${id}`).removeClass('fadeIn')
  $(`#libraryItem${id}`).addClass('fadeOutDown')

  window.setTimeout(async () => {    
    await db.collection('users').doc(user.uid).collection('spotify').doc('tracks').set({
      liked: firebase.firestore.FieldValue.arrayRemove(id)
    }, {merge: true})

    $(`#libraryItem${id}`).addClass('fadeIn')
    $(`#libraryItem${id}`).removeClass('fadeOutDown')

    $(`#collectionTracks`).append($(`#libraryItem${id}`))
    cacheLikedTracks.splice(cacheLikedTracks.indexOf(id), 1);

     
    updateTrackViews()
  }, 650)
}

async function favArtist(id) {
  $(`#libraryItem${id}`).removeClass('fadeIn')
  $(`#libraryItem${id}`).addClass('fadeOutUp')

  window.setTimeout(async () => {

    if (!cacheUserArtists.includes(id)) {
      await addArtistToLibrary(id)
    }

    await db.collection('users').doc(user.uid).collection('spotify').doc('artists').set({
      liked: firebase.firestore.FieldValue.arrayUnion(id)
    }, {merge: true})
    
    $(`#libraryItem${id}`).addClass('fadeIn')
    $(`#libraryItem${id}`).removeClass('fadeOutUp')

    $(`#favArtists`).append($(`#libraryItem${id}`))
    cacheLikedArtists.push(id)

    masonryArtists() 
    updateArtistViews()
  }, 650)

}

async function unfavArtist(id) {
  $(`#libraryItem${id}`).removeClass('fadeIn')
  $(`#libraryItem${id}`).addClass('fadeOutDown')

  window.setTimeout(async () => {    
    await db.collection('users').doc(user.uid).collection('spotify').doc('artists').set({
      liked: firebase.firestore.FieldValue.arrayRemove(id)
    }, {merge: true})

    $(`#libraryItem${id}`).addClass('fadeIn')
    $(`#libraryItem${id}`).removeClass('fadeOutDown')

    $(`#collectionArtists`).append($(`#libraryItem${id}`))
    cacheLikedArtists.splice(cacheLikedArtists.indexOf(id), 1);

    masonryArtists() 
    updateArtistViews()
  }, 650)
}

function updateAlbumViews() {
  if (cacheLikedAlbums.length) {
    // Favourites exist
    $('#favtext').removeClass('hidden')
  }
  else {
    // Favourites don't exist
    $('#favtext').addClass('hidden')
  }

  if ($('#collectionAlbums').children().length) {
    // Collection items exist
    $('#coltext').removeClass('hidden')
  }
  else {
    // Collection items dont exist
    $('#coltext').addClass('hidden')
  }
}

function updateArtistViews() {
  if (cacheLikedArtists.length) {
    // Favourites exist
    $('#favtext2').removeClass('hidden')
  }
  else {
    // Favourites don't exist
    $('#favtext2').addClass('hidden')
  }

  if ($('#collectionArtists').children().length) {
    // Collection items exist
    $('#coltext2').removeClass('hidden')
  }
  else {
    // Collection items dont exist
    $('#coltext2').addClass('hidden')
  }
}

function updateTrackViews() {
  if (cacheLikedTracks.length) {
    // Favourites exist
    $('#favtext3').removeClass('hidden')
  }
  else {
    // Favourites don't exist
    $('#favtext3').addClass('hidden')
  }

  if ($('#collectionTracks').children().length) {
    // Collection items exist
    $('#coltext3').removeClass('hidden')
  }
  else {
    // Collection items dont exist
    $('#coltext3').addClass('hidden')
  }
}

