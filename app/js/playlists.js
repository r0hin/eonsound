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
    last_updated:firebase.firestore.FieldValue.serverTimestamp(),
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
      window.setTimeout(() => {
        // Some browsers will take a while to finish.
        colorThiefify('userPlaylistPreview', playlists[i].id + 'userlibraryplaylistelementimage', playlists[i].id + 'userlibraryplaylistelement')
      }, 500)
    })
  }

}

function changePlayCover(id) {
  $("#pfpplayhost").empty();
  h = document.createElement("input"); h.id = "newPlayEl";
  h.setAttribute('class', 'hidden'); h.setAttribute("type", "file"); h.setAttribute("accept", "image/*");
  document.getElementById("pfpplayhost").appendChild(h);
  $("#newPlayEl").change(async () => { 
    // Change logic
    toggleloader();
    file = $('#newPlayEl').get(0).files[0]
    ext = file.name.split(".").pop();


    await firebase.storage().ref().child(`covers/${id}.${ext}`).put(file)

    window.setTimeout(() => {
      toggleloader(); showcomplete();
      newImg = `https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/covers%2F${id}.${ext}?alt=media&${new Date().getTime()}`
      // Change existing records
      $(`.${id}cover`).attr('src', newImg)
      window.setTimeout(() => {

        $(`#${id}UserPlaylistView`).imagesLoaded(() => {
          colorThiefify('userPlaylistView', id + 'cover', id + 'userplaylistgradientelement')
        })
        $(`#${id}userlibraryplaylistelement`).imagesLoaded(() => {
          colorThiefify('userPlaylistPreview', id + 'userlibraryplaylistelementimage', id + 'userlibraryplaylistelement')
        })

      }, 1220)
    }, 800);
  
  });

  $("#newPlayEl").click();
}