function hideCurrentView() {
  id = sessionStorage.getItem('activeView')
  $(`#${id}`).removeClass('fadeIn')
  $(`#${id}`).addClass('fadeOut')
  window.setTimeout(() => {
    $(`#${sessionStorage.getItem('activeView')}`).addClass('hidden')
  }, 800)
}

async function openUserPlaylist(id) {
  if (sessionStorage.getItem('opening') == id) {
    return;
  }
  sessionStorage.setItem('opening', id)
  console.log('Opening playlist of ' + id);
  playlistId = id
  sessionStorage.setItem('activeView', playlistId + 'userPlaylistView')

  if ($(`#${id}UserPlaylistView`).length) {
    $(`#${id}UserPlaylistView`).removeClass('hidden')
    $(`#${id}UserPlaylistView`).removeClass('fadeOut')
    $(`#${id}UserPlaylistView`).addClass('fadeIn')
    return;
  }

  doc = await db.collection('users').doc(user.uid).collection('library').doc(playlistId).get()
  openPlaylist = doc.data()

  // Build the playlist
  f = document.createElement('div')
  f.setAttribute('class', 'animated fadeIn media_view faster ' + id + 'userPlaylistView')
  f.setAttribute('id', playlistId + 'userPlaylistView')

  description = openPlaylist.description
  if (openPlaylist.description == '') {
    description = 'No description set. Click to change.'
  }

  f.innerHTML = `
    <div class="playlistHeader row">
      <div class="col-sm">
        <center>
          <img class="myPlaylistImg" src="${openPlaylist.cover}"></img>
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
          <p oninput="try {window.clearTimeout(descTimer)} catch(error) {}; descTimer = window.setTimeout(async () => {await db.collection('users').doc(user.uid).collection('library').doc('${playlistId}').update({description: this.innerHTML}); Snackbar.show({text: 'Description updated.', pos: 'top-right'})}, 3000)" contentEditable='true'>${description}</p>
        </center>
      </div>
    </div>
  `

  document.getElementById('userplaylist_view').appendChild(f)
  initButtonsContained()
  sessionStorage.setItem('opening', 'false')
}