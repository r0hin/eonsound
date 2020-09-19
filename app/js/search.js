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
    console.log('object');
    tabe('search')
    $('#queryStr').html(`Search results for: ${val}`)

    const result = await fetch(`https://api.spotify.com/v1/search?q=${val}&type=album,artist,playlist,track`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${spotifyCode}`
        },
    })

    const data = await result.json()

    refreshCode()

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

        a = document.createElement('div')
        a.classList.add('album')

        if (data.albums.items[i].images.length == 0) {
            continue;
        }

        snippet_album_artists = ''
        for (let i = 0; i < data.albums.items[i].artists.length; i++) {
            snippet_album_artists += `${data.albums.items[i].artists[i].name} `   
        }

        a.innerHTML = `
            <img src="${data.albums.items[i].images[0].url}">
            <h4>${data.albums.items[i].name}</h4>
            <p>${snippet_album_artists}</p>
        `

        document.getElementById('search_albums').appendChild(a)

    }

    for (let i = 0; i < data.artists.items.length; i++) {
        // For each artist

        b = document.createElement('div')
        b.classList.add('artist')

        if (data.artists.items[i].images.length == 0) {
            continue;
        }

        b.innerHTML = `
            <img src="${data.artists.items[i].images[0].url}">
            <h4>${data.artists.items[i].name}</h4>
        `

        document.getElementById('search_artists').appendChild(b)
    }

    for (let i = 0; i < data.playlists.items.length; i++) {
        // For each album

        c = document.createElement('div')
        c.classList.add('playlist')

        if (data.playlists.items[i].images.length == 0) {
            continue;
        }

        c.innerHTML = `
            <img src="${data.playlists.items[i].images[0].url}">
            <h4>${data.playlists.items[i].name}</h4>
            <p>${data.playlists.items[i].owner.display_name}</p>
        `

        document.getElementById('search_playlists').appendChild(c)
    }
    
    for (let i = 0; i < data.tracks.items.length; i++) {
        // For each episode
        d = document.createElement('div')
        d.classList.add('track')

        if (data.tracks.items[i].album.images.length == 0) {
            continue;
        }

        snippet_track_artists = ''
        for (let i = 0; i < data.tracks.items[i].artists.length; i++) {
            snippet_track_artists += `${data.tracks.items[i].artists[i].name} `   
        }

        d.innerHTML = `
            <img src="${data.tracks.items[i].album.images[0].url}">
            <h4>${data.tracks.items[i].name}</h4>
            <p>${snippet_track_artists}</p>
        `

        document.getElementById('search_tracks').appendChild(d)
    }

}