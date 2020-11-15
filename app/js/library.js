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

    await track(temporaryTrackItem.id, temporaryTrackItem, 'libraryItem' + temporaryTrackItem.id, destinationID, 'tracks')

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
  addTrackToLibrary(prepareTrackPlaylistTrack.id)

  Snackbar.show({pos: 'top-center',text: "Added '" + prepareTrackPlaylistTrack.name + "' to a playlist."})
}

async function addArtistToLibrary(id) {
  return new Promise(async (resolve, reject) => {
    if (cacheUserArtists.includes(id)) {
      resolve('Exists')
      return;
    }

    // Gather data
    data = await goFetch(`artists/${id}`)
    
    await db.collection('users').doc(user.uid).collection('spotify').doc('artists').set({
      artists: firebase.firestore.FieldValue.arrayUnion({
        id: id,
        pfp: data.images[0].url,
        name: data.name
      }),
      map: firebase.firestore.FieldValue.arrayUnion(id)
    }, {merge: true})

    await artist(id, {
      images: [{url: data.images[0].url}],
      name: data.name,
      id: id,
    }, 'libraryItem' + id, 'collectionArtists')

    $('#artists').imagesLoaded(() => {
      $('#libraryItem' + id).removeClass("hidden");
    }) 

    resolve('successo expresso')
    return;
  })
}

async function addAlbumToLibrary(id, skipUI, SKIPTRACKSFORINFINITELOOP) {
  return new Promise(async (resolve, reject) => {
    if (cacheUserArtists.includes(id)) {
      // Already contains
      resolve('gottempopot')
      return;
    }

    if (!skipUI) {
      Snackbar.show({pos: 'top-center',text: "Adding album to library..."})
    }
    // Gather album details
    // Album info


    atoldata = await goFetch(`albums/${id}`)
    console.log(atoldata);

    // Add it to all the artists
    for (let i = 0; i < atoldata.artists.length; i++) {
      await addArtistToLibrary(atoldata.artists[i].id)
    }  

    // For each song, add record in firebase
    if (!SKIPTRACKSFORINFINITELOOP) {
      // If its coming from track to library, do not add tracks in library omg.
      for (let i = 0; i < atoldata.tracks.items.length; i++) {
        await addTrackToLibrary(atoldata.tracks.items[i], atoldata, false, false)
      }
    }

    // Add actual album now
    thisAlbumArtistSnippet = '';thisAlbumArtistSnippet2 = '';for (let i = 0; i < atoldata.artists.length; i++) {
      thisAlbumArtistSnippet = thisAlbumArtistSnippet + atoldata.artists[i].id + ';'
      thisAlbumArtistSnippet2 = thisAlbumArtistSnippet2 + atoldata.artists[i].name + ';'
    }

    thisAlbumDataSnippet = {
      art: atoldata.images[0].url,
      artists: thisAlbumArtistSnippet,
      artists_display: thisAlbumArtistSnippet2,
      name: atoldata.name,
      id: atoldata.id,
    }

    await db.collection('users').doc(user.uid).collection('spotify').doc('albums').set({
      albums: firebase.firestore.FieldValue.arrayUnion(thisAlbumDataSnippet),
      map: firebase.firestore.FieldValue.arrayUnion(atoldata.id)
    }, {merge: true})
  
    // Added, now build

    cacheUserAlbumsData.push(thisAlbumDataSnippet)
    cacheUserAlbums.push(atoldata.id)

    await album(atoldata.id, atoldata, 'libraryItem' + atoldata.id, 'collectionAlbums')
    $('#albums').imagesLoaded(() => {
      $('#libraryItem' + atoldata.id).removeClass("hidden");
    })   
    updateAlbumViews()

    if (!skipUI) {
      showcomplete()
    }

    // Remove button
    $(`#addLibraryCol${id}`).addClass('hidden')

    if (!skipUI) {
      Snackbar.show({pos: 'top-center',text: "Added " + atoldata.name + " to library"})
    }
    resolve('skiddooo')
  })
}

async function addTrackToLibrary(data, atoldata, showFeedback, addAlbumToo) {
  return new Promise(async (resolve, reject) => {
    trackoskidy = data // compatibility

    thisArtistSnippet = ''; thisArtistSnippet2 = ''; for (let i = 0; i < data.artists.length; i++) {
      thisArtistSnippet = thisArtistSnippet + data.artists[i].id + ';'
      thisArtistSnippet2 = thisArtistSnippet2 + data.artists[i].name + ';'
    }
  
    await db.collection("users").doc(user.uid).collection('spotify').doc('tracks').set({
      tracks: firebase.firestore.FieldValue.arrayUnion({
        art: atoldata.images[0].url,
        artists: thisArtistSnippet,
        artists_display: thisArtistSnippet2,
        name: trackoskidy.name,
        id: trackoskidy.id,
      }),
      map: firebase.firestore.FieldValue.arrayUnion(trackoskidy.id)
    }, {merge: true})
  
    cacheUserTracks.push(trackoskidy.id)
    cacheUserTracksData.push({
      art: atoldata.images[0].url,
      artists: thisArtistSnippet,
      artists_display: thisArtistSnippet2,
      name: trackoskidy.name,
      id: trackoskidy.id,
    })

    if (addAlbumToo) {
      // Try add album:
      console.log('Adding albu mfrom track');
      await addAlbumToLibrary(atoldata.id, true, true)
    }

    trackoskidy.art = atoldata.images[0].url
    window.setTimeout(async () => {
      await track(trackoskidy.id, trackoskidy, 'libraryItem' + trackoskidy.id, 'collectionTracks', 'tracks')
    }, 250);
  
    if (showFeedback) {
      Snackbar.show({text: data.name + ' added to your library.', pos: 'top-center'})
    }

    resolve('potpot')
    return;
  })
}

async function addSpotifyPlaylistToLibrary(id) {
  yc = confirm(`-= Convert Spotify Playlist of ID ${id} to EonSound Playlist =-\n\nThis will create an EonSound playlist and sequentially add each song to the playlist. It may take a while so you can click behind the loading icon to have it run in the background. \n\nClick to confirm:`)
  if (!yc) {
    return;
  }
  // Spotify playlists to library:
  // Get playlist data, convert it, add the playlist. For each song, add the song, artist and album.
  return new Promise(async (resolve, reject) => {
    toggleloader(); Snackbar.show({pos: 'top-center',text: "Converting Spotify playlist to EonSound..."})

    // Grab playlist data
    sptoldata = await goFetch(`playlists/${id}`)
    
    await db.collection('users').doc(user.uid).collection('library').doc(id).set({
      name: sptoldata.name,
      publicity: "public",
      description: sptoldata.description,
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
        name: sptoldata.name,
        status: true,
        id: id
      })
    }, {merge: true})

    var albumPhoto = firebase.functions().httpsCallable("albumPhoto");
    await albumPhoto({ id: id })
    
    // For each track
    console.log(sptoldata);

    for (let i = 0; i < sptoldata.tracks.items.length; i++) {
      const temporaryTrackItem = sptoldata.tracks.items[i].track;

      // Add to playlist...
      console.log(temporaryTrackItem);

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

      Snackbar.show({pos: 'top-center',text: `Added ${i}/${sptoldata.tracks.items.length} tracks.`})

    }

    window.setTimeout(() => {
      toggleloader()
      showcomplete()
      Snackbar.show({pos: 'top-center',text: "Saved playlist to library."})
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
