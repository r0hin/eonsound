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
    loadLibraryPlaylists()
}

async function loadLibraryPlaylists() {
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


        songSnippet = ''

        for (let k = 0; k < playlist.songs.length; k++) {
            const track = playlist.songs[k];
            
            trackArtistSnippet = track.artists
            trackLengthSnippet = `~${Number.parseFloat(track.length / 60000).toPrecision(2)}s`
    
            songSnippet = songSnippet + `
            <li class="list-group-item waves-effect">
                <div class="musicItem">
                    <img src="${track.art}" class="musicItemCover" alt="">
                    <div class="musicItemContent">
                        <h3>${track.name}</h3>
                        <br>
                        <p>${trackArtistSnippet}</p>
                    </div>
                </div>
    
                <div class="musicItemRight">
                    <div class="musicRightContent">
                        <p>${trackLengthSnippet}</p>
                    </div>
                </div>
            </li>
        `    
        }

        if (playlist.songs.length == 0 ) {
            songSnippet = '<p>No songs added yet.</p>'
        }

        if (sessionStorage.getItem('expanded') == 'true') {
            classes = 'content_media content_expanded content_collapsed'
        }
        else {
            classes = 'content_media content_expanded'
        }

        f.innerHTML = `
        <div class="${classes}">
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
                <br><br>
                <ul id="${query.docs[i].id}playlistView" class="list-group musicList">
                    ${songSnippet}
                </ul>

                </div>
            </div>
        </div>
        `

        l = document.createElement('div')
        l.innerHTML = `
        <button class="btn-outlined-primary block" data-dismiss="modal" onclick="add_to_playlist('${query.docs[i].id}')">${playlist.name}</button>
        <br>
        `
        
        document.getElementById('playlistSelectList').appendChild(l)
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

function prepare_library_changes(song) {
    // Song is object containing .id, .url, .artists, and .art
    window.prepare_library_changes = song
    addWaves()
}

function add_to_library() {
    song = prepare_library_changes;
    toggleBottomSheet('librarySheet')

}

async function add_to_playlist(playlist) {
    song = prepare_library_changes; playlist = playlist;
    toggleBottomSheet('librarySheet')


    await db.collection('users').doc(user.uid).collection('library').doc(playlist).update({
        songs: firebase.firestore.FieldValue.arrayUnion(song)
    })

    m = document.createElement('li')
    m.classList.add('list-group-item')
    m.classList.add('waves-effect')

    trackLengthSnippet = `~${Number.parseFloat(song.length / 60000).toPrecision(2)}s`

    m.innerHTML = `
        <div class="musicItem">
            <img src="${song.art}" class="musicItemCover" alt="">
            <div class="musicItemContent">
                <h3>${song.name}</h3>
                <br>
                <p>${song.artists}</p>
            </div>
        </div>

        <div class="musicItemRight">
            <div class="musicRightContent">
                <p>${trackLengthSnippet}</p>
            </div>
        </div>
    `

    document.getElementById(playlist + 'playlistView').appendChild(m)
    Snackbar.show({text: "Song added to playlist."})

    console.log(song, playlist);
}