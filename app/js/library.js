async function loadLibrary() {
  window.cacheUserArtists = []
  window.cacheUserAlbums = []
  window.cacheUserTracks = []

  doc = await db.collection('users').doc(user.uid).collection('spotify').doc('artists').get()
  if (doc.exists) {
    window.cacheUserArtists = doc.data().map
    window.cacheUserArtistsData = doc.data().artists
  }

  doc = await db.collection('users').doc(user.uid).collection('spotify').doc('albums').get()
  if (doc.exists) {
    window.cacheUserAlbums = doc.data().map
    window.cacheUserAlbumsData = doc.data().albums
  }

  doc = await db.collection('users').doc(user.uid).collection('spotify').doc('tracks').get()
  if (doc.exists) {
    window.cacheUserTracks = doc.data().map
    window.cacheUserTracksData = doc.data().tracks
  }
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

  for (let i = 0; i < cacheUserAlbumsData.length; i++) {
    const temporaryAlbumItem = cacheUserAlbumsData[i];
    await album(temporaryAlbumItem.id, {
      images: [{url: temporaryAlbumItem.art}],
      // Only do first artist for now
      artists_formatted:temporaryAlbumItem.artists_display.split(';')[0],
      name: temporaryAlbumItem.name,
      id: temporaryAlbumItem.id,
    }, 'libraryItem' + temporaryAlbumItem.id, 'collectionAlbums')

    $('#libraryItem' + temporaryAlbumItem.id).imagesLoaded(() => {
      $('#libraryItem' + temporaryAlbumItem.id).removeClass("hidden");
    })
    
  }
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

async function addAlbumToLibrary(id) {
  return new Promise(async (resolve, reject) => {
    if (cacheUserArtists.includes(id)) {
      // Already contains
      resolve('gottempopot')
      return;
    }
    Snackbar.show({text: "Adding"})
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

    await db.collection('users').doc(user.uid).collection('spotify').doc('albums').set({
      albums: firebase.firestore.FieldValue.arrayUnion({
        art: data.images[0].url,
        artists: thisAlbumArtistSnippet,
        artists_display: thisAlbumArtistSnippet2,
        name: data.name,
        id: data.id,
      }),
      map: firebase.firestore.FieldValue.arrayUnion(data.id)
    }, {merge: true})
  
    showcomplete()
    Snackbar.show({text: "Added to library"})
    resolve('skiddooo')
  })
}

async function addTrackToLibrary() {
  console.log('Add track to library');
}
