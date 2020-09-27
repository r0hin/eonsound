function showSearch(el) {
    $(`.searchboxfield`).addClass('fadeInUp')
    $(`.searchboxfield`).removeClass('fadeOutDown')
    $(`.searchboxfield`).removeClass('hidden')
    $('#toolbar').addClass('toolbar-search')
    $(el).attr('onclick', 'hideSearch(this)')
}

function hideSearch(el) {
    $(`.searchboxfield`).addClass('fadeOutDown')
    $(`.searchboxfield`).removeClass('fadeInUp')
    window.setTimeout(() => {
        $(`.searchboxfield`).addClass('hidden')
    }, 800)
    $('#toolbar').removeClass('toolbar-search')
    $(el).attr('onclick', 'showSearch(this)')
}

document.getElementById('searchbox').addEventListener("keyup", function(event) { 
    if (event.keyCode === 13) {
        event.preventDefault();
        performSearch(document.getElementById('searchbox').value)
    }
});

async function performSearch(val) {
    hideAlbum()
    hideSearch(document.getElementById('searchBtn'))
    tabe('search')
    $('#queryStr').html(`Search results for: ${val}`)

    const result = await fetch(`https://api.spotify.com/v1/search?q=${val}&type=album,artist,playlist,track`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${spotifyCode}`
        },
    })

    const data = await result.json()

    if (data.error) {
        if (sessionStorage.getItem('errorAvoid') == 'true') {
            // Don't start a loop of errors wasting code use.
            Snackbar.show({text: "An error occured while searching"})
            return
        }

        console.log('Error occured. Likely invalid code - request and do it again.');
        sessionStorage.setItem('errorAvoid', 'true')
        refreshCode()
        performSearch(val)
        return;
    }

    refreshCode()
    sessionStorage.setItem('errorAvoid', 'false')

    buildSearch(data)

}

async function buildSearch(data) {

    console.log(data);

    // Data is an object containing fields: albums, artists, playlists, tracks
    $('#search_albums').empty()
    $('#search_artists').empty()
    $('#search_playlists').empty()
    $('#search_tracks').empty()

    for (let i = 0; i < data.albums.items.length; i++) {
        // For each album

        try {
            a = document.createElement('div')
            a.classList.add('album')
            a.classList.add('hidden'); a.classList.add('animated'); a.classList.add('fadeIn')

            a.onclick = () => {
                loadAlbum(data.albums.items[i].id)
            }

            if (data.albums.items[i].images.length == 0) {
                continue;
            }

            snippet_album_artists = ''
            for (let k = 0; k < data.albums.items[i].artists.length; k++) {
                snippet_album_artists += `${data.albums.items[i].artists[k].name} `   
            }

            a.innerHTML = `
                <img src="${data.albums.items[i].images[0].url}">
                <h4>${data.albums.items[i].name}</h4>
                <p>${snippet_album_artists}</p>
            `
            a.id = 'album_search_index_' + i
            document.getElementById('search_albums').appendChild(a)
            $('#album_search_index_' + i).imagesLoaded( function() {
                $('#album_search_index_' + i).removeClass("hidden")
            });
        } catch (error) {
            console.log('Minor search error: ' + error)
        }

    }


    for (let i = 0; i < data.artists.items.length; i++) {
        // For each artist

        try {
            b = document.createElement('div')
            b.classList.add('artist')
            b.classList.add('hidden'); b.classList.add('animated'); b.classList.add('fadeIn')
    
            if (data.artists.items[i].images.length == 0) {
                continue;
            }
    
            b.innerHTML = `
                <img src="${data.artists.items[i].images[0].url}">
                <h4>${data.artists.items[i].name}</h4>
            `
            b.id = 'artist_search_index_' + i
            document.getElementById('search_artists').appendChild(b)
            $('#artist_search_index_' + i).imagesLoaded( function() {
                $('#artist_search_index_' + i).removeClass("hidden")
            });   
        } catch (error) {
            console.log('Minor search error: ' + error)
        }
    }

    for (let i = 0; i < data.playlists.items.length; i++) {
        // For each album
        
        try {
            c = document.createElement('div')
            c.classList.add('playlist')
            c.classList.add('hidden'); c.classList.add('animated'); c.classList.add('fadeIn')
    
            if (data.playlists.items[i].images.length == 0) {
                continue;
            }
    
            c.innerHTML = `
                <img src="${data.playlists.items[i].images[0].url}">
                <h4>${data.playlists.items[i].name}</h4>
                <p>${data.playlists.items[i].owner.display_name}</p>
            `
            c.id = 'playlist_search_index_' + i
            document.getElementById('search_playlists').appendChild(c)
            $('#playlist_search_index_' + i).imagesLoaded( function() {
                $('#playlist_search_index_' + i).removeClass("hidden")
            });   
        } catch (error) {
            console.log('Minor search error: ' + error)
        }
    }
    
    for (let i = 0; i < data.tracks.items.length; i++) {
        try {
         // For each episode
        d = document.createElement('div')
        d.classList.add('track')
        d.classList.add('hidden'); d.classList.add('animated'); d.classList.add('fadeIn')

        d.onclick = () => {
            play(`${data.tracks.items[i].external_urls.spotify}`, `${data.tracks.items[i].id}`)
        }

        if (data.tracks.items[i].album.images.length == 0) {
            continue;
        }

        snippet_track_artists = ''

        for (let k = 0; k < data.tracks.items[i].artists.length; k++) {
            snippet_track_artists += `${data.tracks.items[i].artists[k].name} `   
        }

        d.innerHTML = `
            <img src="${data.tracks.items[i].album.images[0].url}">
            <h4>${data.tracks.items[i].name}</h4>
            <p>${snippet_track_artists}</p>
        `

        d.id = 'track_search_index_' + i
        document.getElementById('search_tracks').appendChild(d)
        $('#track_search_index_' + i).imagesLoaded( function() {
            $('#track_search_index_' + i).removeClass("hidden")
        });   
        } catch (error) {
            console.log('Minor search error: ' + error)
        }
    }

}

async function loadAlbum(id) {
    if ($('#media_' + id).length) {
        // Exists so just show it

        $('#media_' + id).addClass('fadeIn')
        $('#media_' + id).removeClass('fadeOut')
        $('#media_' + id).removeClass('hidden')
        return;
    }

    // Doesn't exist. Build it then show

    g = document.createElement('div')
    g.id = "media_" + id
    g.classList.add('album_view'); g.classList.add('hidden'); g.classList.add('animated'); g.classList.add('faster')

    // Get album data
    const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${spotifyCode}`
        },
    })

    const data = await result.json()
    console.log(data);
    refreshCode()

    snippet_album_artists = ''
    for (let i = 0; i < data.artists.length; i++) {
        snippet_album_artists += `${data.artists[i].name} `   
    }

    songSnippet = ''

    for (let i = 0; i < data.tracks.items.length; i++) {
        const track = data.tracks.items[i];
        
        trackArtistSnippet = ''
        for (let k = 0; k < track.artists.length; k++) {
            trackArtistSnippet = trackArtistSnippet + ' ' + track.artists[k].name
            
        }

        songSnippet = songSnippet + `
        <li style="animation-delay: ${i}00ms" onclick="play('${track.external_urls.spotify}', '${track.id}')" class="list-group-item waves-effect animated flipInX">
            <div class="musicItem">
                <img src="${data.images[0].url}" class="musicItemCover" alt="">
                <div class="musicItemContent">
                    <h3>${track.name}</h3>
                    <br>
                    <p>${trackArtistSnippet}</p>
                </div>
            </div>

            <div class="musicItemRight">
                <div class="musicRightContent">
                    <p>${track.track_number}</p>
                </div>
            </div>
        </li>
    `
    }

    if (sessionStorage.getItem('expanded') == 'true') {
        classes = 'content_media content_expanded content_collapsed'
    }
    else {
        classes = 'content_media content_expanded'
    }

    g.innerHTML = `
    <div class="${classes}">
        <button onclick="hideAlbum()" class="btn-text-primary iconbtn exitbtn">
            <i class="material-icons">chevron_left</i>
        </button>
        <br><br><br>
        <div class="row">
            <div class="col-4 playlist_full_bar1">
                <center>
                    <br><br>
                    <img class="animated fadeIn" src="${data.images[0].url}">
                    <br><br>
                    <h2 class="animated fadeInUp">${data.name}</h2>
                    <p class="animated fadeIn">${snippet_album_artists}</p>
                    <br><br>
                    <button onclick='playAlbum(${JSON.stringify(data.tracks.items)})' class="btn-contained-primary">play</button>
                </center>
            </div>
            <div class="col-8 playlist_full_bar1">
                <br><br>
                <ul class="list-group musicList">
                    ${songSnippet}
                </ul>
                <br><br> <br><br> <br><br>
            </div>
        </div>
    </div>
    `
    document.getElementById('media_view').appendChild(g)

    $('#media_' + id).imagesLoaded(() => {
        addWaves()
        $('#media_' + id).addClass('fadeIn')
        $('#media_' + id).removeClass('fadeOut')
        $('#media_' + id).removeClass('hidden')
    })

}

function hideAlbum() {
    $('.album_view').removeClass("fadeIn")
    $('.album_view').addClass("fadeOut")
    window.setTimeout(() => {
        $('.album_view').addClass("hidden")
    }, 500)
}

function hideArtist() {

}

function hidePlaylist() {

}