sessionStorage.setItem('errorAvoid', 'false')
sessionStorage.setItem('expanded', 'false')
window.musicQueue = []
window.musicHistory = []
window.musicActive = {'none': 'none'}

$("#player").bind("ended", function() {
    endedSong()
});

const player = new Plyr('audio', {});
window.player = player;

function expand_music(el) {

    sessionStorage.setItem('expanded', 'true')

    $(el).attr('onclick', 'collapse_music(this)')
    $(el).addClass('expand_expanded')

    $('.content_expanded').addClass('content_collapsed')

    $('#now_playing').removeClass('playing_collapsed')
    $(el).html('<i class="material-icons">chevron_right</i>')

    $('#content').addClass('content_collapsed')
    $('#play_status').addClass('play_collapsed')
}

function collapse_music(el) {

    sessionStorage.setItem('expanded', 'false')

    $(el).attr('onclick', 'expand_music(this)')
    $(el).removeClass('expand_expanded')
    $('#now_playing').addClass('playing_collapsed')
    $(el).html('<i class="material-icons">chevron_left</i>')

    $('.content_expanded').removeClass('content_collapsed')
    $('#play_status').removeClass('play_collapsed')
}

async function play(trackURL, trackID, QUEUE) {
    return new Promise(async (resolve,reject) => {
        console.log('Requesting song.');
        $('#play_status').removeClass('hidden')
        $('#play_status').removeClass('fadeOutRight')
        $('#play_status').addClass('fadeInRight')
    
        firstTime = setTimeout(() => {
            Snackbar.show({text: "Downloading song. This may take a few moments."})
        }, 3000);
    
        // Contact server to request song URL.
        try {
            var requestSong = await firebase.functions().httpsCallable('requestSong');
            track = await requestSong({trackID: trackID, trackURL: trackURL})   
        } catch (error) {
            console.log('Error downloading video. 99% geo restricted.');
            $('#erorrModalMsg').html('There was an error requesting the song. It is likely geo-restricted.')
            $('#errorModal').modal('toggle')
            window.setTimeout(() => {
                $('#play_status').addClass('fadeOutRight')
                $('#play_status').removeClass('fadeInRight')
            }, 1)
        }
    
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
    
        if (musicActive.none !== 'none') {
            Snackbar.show({text: "Added to queue"})
            buildQueue()
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
            resolve();
        }, 1)  

    });
}

function playSong(song, backwards) {
    // Song contains .id, .url, and .meta

    if (backwards) {
        // Playing it directly from the input
        musicActive = song
        pendingSong = song
    }
    else {
        // Playing it from beggining of queue
        musicActive = musicQueue[0]
        pendingSong = musicQueue[0]
        musicQueue.splice(0, 1);
    }

    snippet_track_artists = ''
    for (let i = 0; i < pendingSong.meta.artists.length; i++) {
        snippet_track_artists += `${pendingSong.meta.artists[i].name}, `   
    }
    $('#playing_song_artist').html(snippet_track_artists)

    // Set song details
    $('#libraryaddbtn').get(0).onclick = function() {
        prepare_library_changes({
            id: pendingSong.meta.id,
            url: pendingSong.url,
            art: pendingSong.meta.album.images[0].url,
            artists: snippet_track_artists,
            name: pendingSong.meta.name,
            length: pendingSong.meta.duration_ms,
        })
    }

    $('#queueButtons').removeClass('zoomOeut')
    $('#queueButtons').addClass('zoomIn')
    $('#queueButtons').removeClass('invisible')
    $('#playing_album_art').attr('src', pendingSong.meta.album.images[0].url)
    $('#playing_album_art').removeClass('invisible'); $('#playing_album_art').removeClass('zoomOut');
    $('#playing_album_art').addClass('zoomIn')
    $('#queueText').html('Queue')
    $('#playing_song_name').html(pendingSong.meta.name)

    $('#player').attr('src', `${pendingSong.url}`)
    $('#audio_container').removeClass('invisible'); $('#audio_container').removeClass('zoomOut')
    $('#audio_container').addClass('zoomIn')

    // Ensure music sidebar is expanded.
    expand_music(document.getElementById('expand_btn'))
    buildQueue()

}

function endedSong() {

    // Move active song to history
    musicHistory.push(musicActive)
    musicActive = {'none': 'none'}

    if (musicQueue.length == 0) {
        queueOver()
        return;
    }

    playSong({
        id: musicQueue[0].id,
        url: musicQueue[0].url,
        meta: musicQueue[0].meta,
    })

    console.log('Song ended. Moving to next in queue.');
}

function queueOver() {
    $('#audio_container').removeClass('zoomIn')
    $('#audio_container').addClass('zoomOut')
    $('#playing_album_art').removeClass('zoomIn')
    $('#playing_album_art').addClass('zoomOut')

    $('#playing_song_artist').html('')
    $('#playing_song_name').html('Not Playing')

    $('#queueButtons').addClass('zoomOut')
    $('#queueButtons').removeClass('zoomIn')

    $('#player').attr('src', ``)
    $('#queueText').html('')
}

function skipNext() {
    endedSong()
}

function skipPrevious() {

    // Delete last element of history, to move it to first of queue
    // Twice as a dummy element to keep active song in front of next song.

    if (musicActive.none !== 'none') {
        // Song is playing, move it to first of queue
        musicQueue.unshift(musicActive)
    }

    // Play last element of history
    playSong(musicHistory[musicHistory.length - 1], true)

    // Delete last element of history
    musicHistory.splice(musicHistory.length - 1, 1);

}

function buildQueue() {
    $('#queue').empty()

    j = document.createElement('div')
    songSnippet = ''

    for (let i = 0; i < musicQueue.length; i++) {
        const song = musicQueue[i];
        iplusone = i + 1

        trackArtistSnippet = ''
        for (let k = 0; k < song.meta.artists.length; k++) {
            trackArtistSnippet = trackArtistSnippet + ' ' + song.meta.artists[k].name   
        }

        songSnippet = songSnippet + `
            <li class="list-group-item waves-effect">
                <div class="musicItem">
                    <img src="${song.meta.album.images[0].url}" class="musicItemCover" alt="">
                    <div class="musicItemContent">
                        <p>${song.meta.name}</p>
                        <br>
                        <small>${trackArtistSnippet}</small>
                    </div>
                </div>
            </li>
        `
    }

    j.innerHTML = `<ul class="list-group musicList"> ${songSnippet} </ul><br><br><br>`

    if (musicQueue.length == 0) {
        j.innerHTML = `<center><p>Empty Queue</p></center>`
    }

    document.getElementById('queue').appendChild(j)
}

async function playAlbum(data) {

    Snackbar.show({text: "Attemping to queue album."})

    for (let i = 0; i < data.length; i++) {
        await play(data[i].external_urls.spotify, data[i].id)
        console.log('Song downloaded');
    }

    Snackbar.show({text: "All songs queued."})
    showcomplete()

}