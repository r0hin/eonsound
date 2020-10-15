async function addTrackToPlaylist(playlistID) {
  // GET TRACK INFO
  track = prepare_library_changes

  // GET TRACK DOWNLOAD URL
  url = await downloadSong(track.id, data.external_urls.spotify, data.name)

  // ADD TRACK TO PLAYLIST
  await db.collection('users').doc(user.uid).collection('library').doc(playlistID).update({
    songs: firebase.firstore.FieldValue.arrayUnion(track)
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
