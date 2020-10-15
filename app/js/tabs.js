sessionStorage.setItem('first-time-playlists', 'true')
sessionStorage.setItem('first-time-artists', 'true')
sessionStorage.setItem('first-time-albums', 'true')
sessionStorage.setItem('first-time-songs', 'true')
sessionStorage.setItem('first-time-browse', 'true')
sessionStorage.setItem('first-time-search', 'true')

// interval = window.setInterval(() => {
//   if (typeof(user) !== "undefined") {
//     // Do something once user is loaded
//     window.clearInterval(interval)
//   }
// }, 200)

function tabe(tab) {
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
      default:
        break;
    }
  }
}