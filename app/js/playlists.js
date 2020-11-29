// playlists.js
// Manages user playlists - adding things, modifying it, displaying it, etc.
// Will include code for managing other users' playlists.

const colorThief = new ColorThief();
window.colorThief = new ColorThief();
window.cacheUserPlaylists = {}

async function createPlaylist() {
  toggleloader();
  name = $("#playlistnamebox").val();
  if (name == '' || name == " ") {
    Snackbar.show({text: "Please enter a valid name.", pos: 'top-center'})
    return;
  }
  $("#playlistnamebox").get(0).value = "";

  $('#nothingInPlaylists').addClass('hidden')
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
    Snackbar.show({pos: 'top-center', text: `${name} created.` });
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
    if (!playlists) {
      playlists = []
    }
  }

  // Add all playlists to the item
  for (let i = 0; i < playlists.length; i++) {
    cacheUserPlaylists[playlists[i].id] = playlists[i]
  }


  if (!playlists.length) {
    $('#nothingInPlaylists').removeClass('hidden')
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


async function deleteUserPlaylist(id) {
  yc = confirm('Are you sure you want to delete this playlist? \n\nThis action is irreversible')
  if (!yc) {
    return;
  }
  await db.collection('users').doc(user.uid).update({
    playlistsPreview: firebase.firestore.FieldValue.arrayRemove(cacheUserPlaylists[id])
  })
  
  $(`#${id}userlibraryplaylistelement`).remove()
  $(`#playlistSelectItem${id}`).remove()
  $(`#${id}UserPlaylistView`).remove()

  Snackbar.show({pos: 'top-center',text: "Playlist successfully deleted."})
}

async function userPlaylistInfo(id) {

  if (!cacheUserPlaylistData[id]) {
    doc = await db.collection('users').doc(user.uid).collection('library').doc(id).get()
    cacheUserPlaylistData[id] = doc.data()
  }

  $('#mediaInfo').modal('toggle')
  $('#mediainfolist').empty()
  newMediaInfo('Name', cacheUserPlaylistData[id].name)
  newMediaInfo('Type', 'User Playlist')
  newMediaInfo('Songs', cacheUserPlaylistData[id].songs.length)
  try {
    newMediaInfo('Last Updated',cacheUserPlaylistData[id].last_updated.toDate().toString().split('GM').shift())
  } catch (error) {
    newMediaInfo('Last Updated',cacheUserPlaylistData[id].last_updated)
  }
  newMediaInfo('Date Created', cacheUserPlaylistData[id].created_at.toDate().toString().split('GM').shift())
  newMediaInfo('Publicity', cacheUserPlaylistData[id].publicity)
  newMediaInfo('ID', id)
}

async function renameUserPlaylist(id) {
  $('#playlistRename').modal('toggle')
  $('#renameplaylistbutton').get(0).onclick = async () => {

    // Actual rename code

    newName = $('#playlistrenamebox').val()
    $('#playlistrenamebox').val('')

    if (!newName) {
      return;
    }
    if (newName == '' || newName == " ") {
      Snackbar.show({text: "Please enter a valid name.", pos: 'top-center'})
      return;
    }

    await db.collection("users").doc(user.uid).collection('library').doc(id).update({
      name: newName,
      last_updated: firebase.firestore.FieldValue.serverTimestamp(),
    })
    cacheUserPlaylistData[id].last_updated = new Date().toDateString();
  
  
    doc = await db.collection('users').doc(user.uid).get()
    renameMatch = undefined;
    // Get index of item with id id
    for (let i = 0; i < doc.data().playlistsPreview.length; i++) {
      if (doc.data().playlistsPreview[i].id == id) {
        renameMatch = i
        break;
      }    
    }
  
    if (renameMatch == undefined) {
      alert('Internal Error')
      return;
    }
  
    newData = doc.data().playlistsPreview
    newData[renameMatch].name = newName
  
    await db.collection('users').doc(user.uid).update({
      playlistsPreview: newData
    })
  
    // Change the UI
    $(`#${id}name0`).html(newName)
    $(`#${id}name1`).html(newName)
    $(`#playlistSelectItem${id}`).html(newName)
  
    Snackbar.show({text: "Playlist successfully renamed.", pos: 'top-center'}) 

  }
}

async function removeTrackFromPlaylist(songID, playlistID) {
  // Search for data where songID matches song id

  match = undefined
  for (let i = 0; i < cacheUserPlaylistData[playlistID].songs.length; i++) {
    const element = cacheUserPlaylistData[playlistID].songs[i];
    if (element.id == songID) {
      match = i
    }
  }

  if (match == undefined) {
    alert('Internal Error.')
    return;
  }
  
  var removeSongData = cacheUserPlaylistData[playlistID].songs[match]

  // Update the database
  await db.collection('users').doc(user.uid).collection('library').doc(playlistID).update({
    songs: firebase.firestore.FieldValue.arrayRemove(removeSongData),
    last_updated: firebase.firestore.FieldValue.serverTimestamp()
  })
  
  if (cacheUserPlaylistData[playlistID]) {
    cacheUserPlaylistData[playlistID].last_updated = new Date().toDateString();
  }

  // Update the UI
  $(`#${playlistID}${songID}`).remove()

  // Update the cache
  cacheUserPlaylistData[playlistID].songs.splice(match, 1)

  if (queueData[playlistID]) {
    queueData[playlistID].splice(match, 1)
  }

  Snackbar.show({text: "Song removed from playlist.", pos: 'top-center'})

}