window.db = firebase.firestore()

async function createPlaylist() {
    name = $('#playlistnamebox').val()
    $('#playlistnamebox').get(0).value = ''

    await db.collection('users').doc(user.uid).collection('library').add({
        name: name,
        publicity: 'public',
        description: '',
        owner: {
            name: cacheuser.name,
            username: cacheuser.username,
            photo: cacheuser.url
        },
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        songs: [],
        cover: 'https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/app%2Fempty_album.png?alt=media',
    })

    Snackbar.show({text: `Playlist, '${name}', created.`})
}

async function loadLibrary() {
    query = await db.collection('users').doc(user.uid).collection('library').get()
    for (let i = 0; i < query.docs.length; i++) {
        playlist = query.docs[i].data();

        e = document.createElement('div')
        e.classList.add('playlist'); e.classList.add('playlist_user'); e.classList.add('hidden')
        e.classList.add('animated'); e.classList.add('fadeIn');
        e.innerHTML = `
            <img src="${playlist.cover}">
            <h4>${playlist.name}</h4>
        `
        e.onclick = () => {
            showPlaylist(query.docs[i].id)
        }

        f = document.createElement('div')
        f.classList.add('playlist_view')
        f.classList.add('hidden'); f.classList.add('animated'); f.classList.add('faster')
        f.id = query.docs[i].id

        songsSnippet = ''

        f.innerHTML = `
        <div class="content_media content_expanded">
            <button onclick="hidePlaylist('${query.docs[i].id}')" class="btn-text-primary iconbtn exitbtn">
                <i class="material-icons">chevron_left</i>
            </button>
            <br><br><br>
            <div class="row">
                <div class="col-4 playlist_full_bar1">
                    <center>
                        <br><br>
                        <img class="animated fadeIn" src="${playlist.cover}">
                        <br><br>
                        <h2 class="animated fadeInUp">${playlist.name}</h2>
                        <p class="animated fadeIn">${playlist.owner.name}</p>
                        <br><br>
                        <hr>
                        <br>
                        <p>${playlist.description}</p>
                    </center>
                </div>
                <div class="col-8 playlist_full_bar1">
                    
                <ul class="list-group musicList">
                    ${songsSnippet}
                </ul>

                </div>
            </div>
        </div>
        `
        document.getElementById('user_playlist_view').appendChild(f)

        document.getElementById('user_playlists').appendChild(e)
    }

    $('#user_playlists').imagesLoaded( function() {
        $('.playlist_user').removeClass("hidden")
        addWaves()
    });
      
}

async function showPlaylist(id) {
    $(`#${id}`).removeClass('hidden')
    $(`#${id}`).removeClass('fadeOut')
    $(`#${id}`).addClass('fadeIn')
}

async function hidePlaylist(id) {
    $(`#${id}`).removeClass('fadeIn')
    $(`#${id}`).addClass('fadeOut')
    window.setTimeout(() => {
        $(`#${id}`).addClass('hidden')
    }, 500)
}

