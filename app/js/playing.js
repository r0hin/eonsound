sessionStorage.setItem('errorAvoid', 'false')
window.musicQueue = []
window.musicHistory = []

$("#player").bind("ended", function() {
    endedSong()
});

function expand_music(el) {
    $(el).attr('onclick', 'collapse_music(this)')
    $(el).addClass('expand_expanded')

    $('.content_expanded').addClass('content_collapsed')

    $('#now_playing').removeClass('playing_collapsed')
    $(el).html('<i class="material-icons">chevron_right</i>')

    $('#content').addClass('content_collapsed')
    $('#play_status').addClass('play_collapsed')
}

function collapse_music(el) {
    $(el).attr('onclick', 'expand_music(this)')
    $(el).removeClass('expand_expanded')
    $('#now_playing').addClass('playing_collapsed')
    $(el).html('<i class="material-icons">chevron_left</i>')

    $('.content_expanded').removeClass('content_collapsed')
    $('#play_status').removeClass('play_collapsed')
}

async function play(trackURL, trackID) {
    console.log('Requesting song.');
    $('#play_status').removeClass('hidden')
    $('#play_status').removeClass('fadeOutRight')
    $('#play_status').addClass('fadeInRight')

    firstTime = setTimeout(() => {
        Snackbar.show({text: "Downloading song. This may take a few moments."})
    }, 3000);

    // Contact server to request song URL.
    var requestSong = await firebase.functions().httpsCallable('requestSong');
    track = await requestSong({trackID: trackID, trackURL: trackURL})

    // Only run if it request takes longer than 3 seconds. On 99.9999% of already downloaded songs, it will not take this long.
    clearTimeout(firstTime)

    // Get track details
    const result = await fetch(`https://api.spotify.com/v1/tracks/${trackID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${spotifyCode}`
        },
    })

    const data = await result.json()

    if (data.error) {
        if (sessionStorage.getItem('errorAvoid') == 'true') {
            // Don't start a loop of errors wasting code use.
            Snackbar.show({text: "An error occured while playing song"})
            return
        }

        console.log('Error occured. Likely invalid code - request and do it again.');
        sessionStorage.setItem('errorAvoid', 'true')
        refreshCode()
        play(trackURL, trackID)
        return;
    }

    refreshCode()
    sessionStorage.setItem('errorAvoid', 'false')

    // Put the result into the queue and updateselection
    musicQueue.push({id: trackID, url: track.data, meta: data})

    if (musicQueue.length > 1) {
        Snackbar.show({text: "Added to queue"})
    }
    else {
        playSong({
            id: trackID, 
            url: track.data, 
            meta: data
        })
    }

    // When done
    window.setTimeout(() => {
        $('#play_status').addClass('fadeOutRight')
        $('#play_status').removeClass('fadeInRight')
    }, 1000)

}

function playSong(song) {
    // Song contains .id, .url, and .meta

    // Move first value of queue to history
    musicHistory.push(musicQueue[0])

    pendingSong = musicQueue[0]

    // Delete first value
    musicQueue.splice(0, 1);

    // Set song details
    $('#playing_album_art').attr('src', pendingSong.meta.album.images[0].url)
    $('#playing_album_art').removeClass('invisible'); $('#playing_album_art').removeClass('zoomOut');
    $('#playing_album_art').addClass('zoomIn')
    $('#playing_song_name').html(pendingSong.meta.name)
    snippet_track_artists = ''
    for (let i = 0; i < pendingSong.meta.artists.length; i++) {
        snippet_track_artists += `${pendingSong.meta.artists[i].name} `   
    }
    $('#playing_song_artist').html(snippet_track_artists)

    $('#player').attr('src', `${song.url}`)
    $('#player').removeClass('invisible'); $('#player').removeClass('zoomOut')
    $('#player').addClass('zoomIn')

    // Ensure music sidebar is expanded.
    expand_music(document.getElementById('expand_btn'))

}

function endedSong() {
    console.log('Song ended. Moving to next in queue.');
}

function queueOver() {
    $('#player').removeClass('zoomIn')
    $('#player').addClass('zoomOut')
    $('#playing_album_art').removeClass('zoomIn')
    $('#playing_album_art').addClass('zoomOut')
}