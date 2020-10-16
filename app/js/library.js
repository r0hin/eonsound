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

async function addAlbumToLibrary() {
  console.log(albumID);
}

async function addTrackToLibrary() {
  console.log(trackID);
}
