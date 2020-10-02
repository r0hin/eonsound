window.db = firebase.firestore()

async function createPlaylist() {
    toggleloader()
    name = $('#playlistnamebox').val()
    $('#playlistnamebox').get(0).value = ''

    docRef = await db.collection('users').doc(user.uid).collection('library').add({
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

    var albumPhoto = firebase.functions().httpsCallable('albumPhoto');
    albumPhoto({id: docRef.id}).then((result) => {
        Snackbar.show({text: `Playlist, ${name}, created...`})
        window.setTimeout(() => {
            toggleloader()
            showcomplete()
            $('#user_playlists').empty()
            $('#playlistSelectList').empty()
            $('#user_playlist_view').empty()
            loadLibraryPlaylists()
        }, 1200)
    })

    //docRef.id    
}

async function loadLibrary() {
    loadLibraryPlaylists()
}

async function loadLibraryPlaylists() {

    query = await db.collection('users').doc(user.uid).collection('library').get()

    for (let i = 0; i < query.docs.length; i++) {
        playlist = query.docs[i].data();

        e = document.createElement('div')
        e.id = query.docs[i].id + 'snippet'
        e.classList.add('playlist'); e.classList.add('playlist_user'); e.classList.add('hidden')
        e.classList.add('animated'); e.classList.add('fadeIn');
        e.innerHTML = `
            <img id="${query.docs[i].id}cover2" src="${playlist.cover}">
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
                        <img id="${query.docs[i].id}cover" class="animated fadeIn" src="${playlist.cover}">
                        <br><br>
                        <h2 class="animated fadeInUp">${playlist.name}</h2>
                        <p class="animated fadeIn">${playlist.owner.name}</p>
                        <br><br>
                        <div class="playlistActions">
                            <button onclick='playPlaylist(${JSON.stringify(playlist.songs)})' class="btn-contained-primary">play</button>
                            <div class="dropdown">
                                <button aria-haspopup="true" class="btn-text-primary iconbtn" data-toggle="dropdown" aria-expanded="false">
                                    <i class="material-icons">more_horiz</i>
                                </button>
                                <div class="dropdown-menu menu">
                                    <a onclick="setDescription('${query.docs[i].id}', '${efilter(playlist.description)}', this)" class="dr-item">Set Description</a>
                                    <a onclick="setCover('${query.docs[i].id}')" class="dr-item">Set Playlist Cover</a>
                                    <div class="dropdown-divider"></div>
                                    <a onclick="deletePlaylist('${query.docs[i].id}')" class="dropdown-item waves-effect btn-danger">Delete Playlist</a>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <br>
                        <p id="${query.docs[i].id}desc">${playlist.description}</p>
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

function setDescription(id, text, element) {
    $('#descriptionPlaylist').modal('toggle')
    $('#descconfbtn').get(0).onclick = () => {
        confirmDescription(id, element)
    }

    if (typeof(text) !== 'undefined') {
        $('#fielddesc').addClass('has-value')
        $('#descriptionBox').val(text)
    }
    else {
        $('#fielddesc').removeClass('has-value')
        $('#descriptionBox').val('')
    }
}

async function confirmDescription(id, el) {
    text = efilter($('#descriptionBox').val())

    $(`#${id}`).get(0).onclick = () => {
        setDescription(id, text, el)
    }

    await db.collection('users').doc(user.uid).collection('library').doc(id).update({
        description: text,
    })

    Snackbar.show({text: "Description changed."})
    
    $(`#${id}desc`).text(text)
    $('#fielddesc').removeClass('has-value')
    $('#fielddesc').val('')
}

function setCover(id) {
    $('#pfpghost').empty()
    h = document.createElement("input")
    h.id = 'newpicel'
    h.style.display = 'none'
    h.setAttribute("type", "file");
    h.setAttribute("accept", "image/*");
    document.getElementById('pfpghost').appendChild(h)
    $("#newpicel").change(function(){
        confirmCover(id)
    });
    $('#newpicel').click()
}

async function confirmCover(id) {
    toggleloader()
    file = document.getElementById('newpicel').files[0]
    ext = file.name.split('.').pop()
    
    var storageRef = firebase.storage().ref();
    var fileRef = storageRef.child(`covers/${id}.${ext}`);
    
    await fileRef.put(file)
    
    window.setTimeout(() => {
        toggleloader()
        showcomplete()
    
        // Change existing records
        document.getElementById(id + 'cover').src = "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/covers%2F" + id + "." + ext + "?alt=media&" + new Date().getTime();
        document.getElementById(id + 'cover2').src = "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/covers%2F" + id + "." + ext + "?alt=media&" + new Date().getTime();
    
    }, 800)
    
    $('#newpicel').remove()
}

async function deletePlaylist(id) {
    x = confirm('Are you sure you want to delete this playlist? This action is irreversible.\n\n\n\n\n\n')
    if (!x) {
        Snackbar.show({text: "Nothing changed."})
        return;
    }

    await db.collection('users').doc(user.uid).collection('library').doc(id).delete()

    Snackbar.show({text: "Playlist deleted."})
    $(`#${id}`).remove()
    $(`#${id}snippet`).remove()
}