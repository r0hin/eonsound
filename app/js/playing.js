window.musicQueue = []

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

function play(id) {
    $('#play_status').removeClass('hidden')
    $('#play_status').removeClass('fadeOutRight')
    $('#play_status').addClass('fadeInRight')

    // Contact server to request song URL.

    






    // When done
    window.setTimeout(() => {
        $('#play_status').addClass('fadeOutRight')
        $('#play_status').removeClass('fadeInRight')
    }, 5000)

}