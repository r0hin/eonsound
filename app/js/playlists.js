const colorThief = new ColorThief();
window.colorThief = new ColorThief();

async function createPlaylist() {
  toggleloader();
  name = $("#playlistnamebox").val();
  $("#playlistnamebox").get(0).value = "";

  docRef = await db.collection("users").doc(user.uid).collection("library").add({
    name: name,
    publicity: "public",
    description: "",
    status: true,
    owner: {
      name: cacheuser.name,
      username: cacheuser.username,
      photo: cacheuser.url,
    },
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    songs: [],
    cover: "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/app%2Fempty_album.png?alt=media",
  });

  await db.collection('users').doc(user.uid).set({
    playlistsPreview: firebase.firestore.FieldValue.arrayUnion({
      cover: "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/covers%2F" + docRef.id + ".png?alt=media",
      name: name,
      status: true,
      id: docRef.id
    })
  }, {merge: true})

  var albumPhoto = firebase.functions().httpsCallable("albumPhoto");
  albumPhoto({ id: docRef.id }).then((result) => {
    Snackbar.show({ text: `${name} created.` });
    window.setTimeout(() => {
      toggleloader();
      showcomplete();
      loadUserPlaylists([{
        cover: "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/app%2Fempty_album.png?alt=media",
        name: name,
        status: true,
        id: docRef.id
      }]);
    }, 1200);
  });
}

async function loadUserPlaylists(playlists) {

  if (!playlists) {
    userDoc2 = await db.collection("users").doc(user.uid).get()
    window.cacheuser = userDoc2.data();
    playlists = userDoc2.data().playlistsPreview
  }
  
  for (let i = 0; i < playlists.length; i++) {
    await userPlaylist(playlists[i].id, playlists[i], playlists[i].id + 'userlibraryplaylistelement', 'user_library_playlists')
    $(`#${playlists[i].id}userlibraryplaylistelement`).imagesLoaded(() => {
      $(`#${playlists[i].id}userlibraryplaylistelement`).removeClass('hidden')
      colors = colorThief.getColor(document.getElementById( playlists[i].id + 'userlibraryplaylistelementimage'))
      document.getElementById(playlists[i].id + 'userlibraryplaylistelement').setAttribute('style', 'background-color: rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ', 0.6)')
    })
  }

}