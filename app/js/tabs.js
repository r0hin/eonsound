// Tabs.js
// Manages the general layout of the app and properly loading sections as the user requires it.
sessionStorage.setItem('CURRENTAB', '')

sessionStorage.setItem('first-time-playlists', 'true')
sessionStorage.setItem('first-time-artists', 'true')
sessionStorage.setItem('first-time-albums', 'true')
sessionStorage.setItem('first-time-songs', 'true')
sessionStorage.setItem('first-time-browse', 'true')
sessionStorage.setItem('first-time-search', 'true')
sessionStorage.setItem('first-time-activity', 'true')
sessionStorage.setItem('first-time-friends', 'true')

// interval = window.setInterval(() => {
//   if (typeof(user) !== "undefined") {
//     // Do something once user is loaded
//     window.clearInterval(interval)
//   }
// }, 200)

function tabe(tab) {
  sessionStorage.setItem('CURRENTAB', tab)
  $('.tab-btn').removeClass('tab-btn-active')
  $(`#${tab}-tab`).addClass('tab-btn-active')

  $('.tab').addClass("hidden")
  $(`#${tab}`).removeClass("hidden")

  hideCurrentView()

  if (sessionStorage.getItem('first-time-' + tab) == 'true') {
    sessionStorage.setItem('first-time-' + tab, 'false')

    switch (tab) {
      case 'playlists':
        break;
      case 'albums':
        loadLibraryAlbums()
        break;
      case 'artists':
        loadLibraryArtists()
        break;
      case 'songs':
        loadLibraryTracks()
        break;
      case 'browse':
        interval = window.setInterval(() => { if (typeof(spotifyCode) !== "undefined") {
          loadBrowse()
          window.clearInterval(interval)
        }}, 200)
        break;
      case 'activity':
        loadActivity()
        break;
      case 'friends':
        loadFriends()
        break;
      default:
        break;
    }
  }
}