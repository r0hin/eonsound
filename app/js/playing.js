function expand_music(el) {
    $(el).attr('onclick', 'collapse_music(this)')
    $(el).addClass('expand_expanded')
    $('#now_playing').removeClass('playing_collapsed')
    $(el).html('<i class="material-icons">chevron_right</i>')

    $('#content').addClass('content_collapsed')
}

function collapse_music(el) {
    $(el).attr('onclick', 'expand_music(this)')
    $(el).removeClass('expand_expanded')
    $('#now_playing').addClass('playing_collapsed')
    $(el).html('<i class="material-icons">chevron_left</i>')

    $('#content').removeClass('content_collapsed')
}