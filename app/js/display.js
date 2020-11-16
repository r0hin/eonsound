// display.js
// Display optimization scripts.

// Masonry will happen when different sizes exist

// function masonryAlbums() {
//   allItems = $('#collectionAlbums').get(0).getElementsByClassName('album')
//   for (x = 0; x < allItems.length; x++) {
//     masonryAlbum(allItems[x]);
//   }
// }

// function masonryAlbum(item) {
//   grid = document.getElementById("collectionAlbums");
//   rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
//   rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
//   rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
//   item.style.gridRowEnd = "span " + rowSpan;  
//   item.style.transition = "all 0.5s";   
// }

// function masonryArtists() {
//   allItems = $('#collectionArtists').get(0).getElementsByClassName('artist')
//   for (x = 0; x < allItems.length; x++) {
//     masonryArtist(allItems[x]);
//   }
// }

// function masonryArtist(item) {
//   grid = document.getElementById("collectionArtists");
//   rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
//   rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
//   rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
//   item.style.gridRowEnd = "span " + rowSpan;  
//   item.style.transition = "all 0.5s";   
// }

function calculatePlayerWidths() {
  textWidth = $('#playing_track_details').width()
  
  // + 32 - padding
  // + 50 - album image
  songActionWidth = textWidth + 32 + 50
  // + 185 - song action width
  // + 24 - padding
  contentWidth = songActionWidth + 185 + 24
  playerWidth = 'calc(100% - ' + contentWidth + 'px)'
  
  $('#InjectedWidth').get(0).innerHTML = `
  .songactions {
    left: ${songActionWidth}px !important;
    transition: all 1s !important;
  }
  
  #player .plyr {
    width: ${playerWidth} !important;
    transition: all 1s !important;
  }
  `
}

function showPlayer() {
  $('#InjectedPlayer').get(0).innerHTML = `
  #usercard {
    bottom: 86px !important;
    transition: all 0.5s !important;
  }
  #fakeusercard {
    bottom: 86px !important;
    transition: all 0.5s !important;
  }
  #loader {
    
  }
  `
  $('#player').removeClass('fadeOutDown')
  $('#player').addClass('fadeInUp')
  $('#player').removeClass('hidden')
}

function hidePlayer() {
  $('#InjectedPlayer').get(0).innerHTML = ``
  $('#player').addClass('fadeOutDown')
  $('#player').removeClass('fadeInUp')
}

function showLoader() {
  $('#loader').removeClass('fadeOutRight')
  $('#loader').addClass('fadeInRight')
  $('#loader').removeClass('hidden')
}

function hideLoader() {
  $('#loader').removeClass('fadeInRight')
  $('#loader').addClass('fadeOutRight')
}

function colorThiefify(TYPE, imageID, containerID) {
  
  colors = colorThief.getColor(document.getElementById(imageID))
  
  switch (TYPE) {
    case 'userPlaylistPreview':
    document.getElementById(containerID).setAttribute('style', 'background-color: rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ', 0.6)')
    break;
    case 'userPlaylistView':
    document.getElementById(containerID).setAttribute('style', 'background-image: linear-gradient(180deg, rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ', 1) -30%, var(--bg-primary) 100%)')  
    break;
    case 'albumPreview':
    document.getElementById(containerID).setAttribute('style', 'background-color: rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ', 0.9)')
    default:
    break;
  }
  
}

$('[data-toggle="tooltip"]').tooltip();

function refreshTheme() {
  color = localStorage.getItem('es_theme_color') // Blue, etc
  light = localStorage.getItem('es_theme_light') // Light, etc

  if (light == 'auto') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      light = 'dark'
    }
    else {
      light = 'light'
    }
  }

  // We've got color and light, now make changes:

  if (light == 'light') {
    injectLight()
    partone = '--bg-primary: #f9f9f9;  --bg-secondary: #fff; --bg-tertiary: #ededed; --bg-quaternary: #e7e7e7;'
    partthree = '--content-primary: black; --content-secondary: #0f0f0f; --content-tertiary: #3b3b3b; --contrast-primary: white; --glow: rgba(125, 125, 125, 0.2);'
  }
  else if (light == 'dark') {
    injectDark()
    partone = '--bg-primary: #181c3a; --bg-secondary: #090d28; --bg-tertiary: #1b263b; --bg-quaternary: #2F2E36;'
    partthree = '--content-primary: white; --content-secondary: #c8c8c8; --content-tertiary: #5c5c5c; --contrast-primary: black; --glow: rgba(125, 125, 125, 0.2);'
  }

  else {
    switchAuto(true)
    return;
  }

  switch (color) {
    case 'blue':
      parttwo = '--eon-primary: rgb(51, 147, 226); --eon-secondary: #4548fc; '
      partfour = '--ripple-primary: rgba(51, 147, 226, 0.3); --ripple-secondary: rgba(51, 147, 226, 0.1); --button-primary: rgb(76, 110, 204); '
      break;
    case 'red':
      parttwo = '--eon-primary: rgb(226, 51, 51); --eon-secondary: #fc7045; '
      partfour = '--ripple-primary: rgba(226, 51, 51, 0.3); --ripple-secondary: rgba(226, 51, 51, 0.1); --button-primary: rgb(212, 57, 57); '
      break;
    case 'orange':
      parttwo = '--eon-primary: rgb(226, 86, 51); --eon-secondary: #fcbc45; '
      partfour = '--ripple-primary: rgba(226, 86, 51, 0.3); --ripple-secondary: rgba(226, 86, 51, 0.1); --button-primary: rgb(212, 100, 35); '
      break;
    case 'lime':
      parttwo = '--eon-primary: rgb(185, 226, 51); --eon-secondary: #45fc91; '
      partfour = '--ripple-primary: rgba(185, 226, 51, 0.3); --ripple-secondary: rgba(185, 226, 51, 0.1); --button-primary: rgb(91, 212, 35);'
      break;
    case 'aqua':
      parttwo = '--eon-primary: rgb(51, 226, 211); --eon-secondary: #4557fc; '
      partfour = '--ripple-primary: rgba(51, 226, 211, 0.3); --ripple-secondary: rgba(51, 226, 211, 0.1); --button-primary: rgb(19, 124, 194); '
      break;
    case 'purple':
      parttwo = '--eon-primary: rgb(98, 51, 226); --eon-secondary: #d745fc; '
      partfour = '--ripple-primary: rgba(98, 51, 226, 0.3);  --ripple-secondary: rgba(98, 51, 226, 0.1); --button-primary: rgb(109, 19, 194); '
      break;
    case 'pink':
      parttwo = '--eon-primary: rgb(206, 51, 226); --eon-secondary: rgb(252, 69, 145); '
      partfour = '--ripple-primary: rgba(240, 108, 245, 0.3); --ripple-secondary: rgba(240, 108, 245, 0.1); --button-primary: rgb(206, 51, 226);'
      break;
    case 'hotpink':
      parttwo = '--eon-primary: rgb(226, 51, 124); --eon-secondary: #ff006a; '
      partfour = '--ripple-primary: rgba(226, 51, 159, 0.3); --ripple-secondary: rgba(226, 51, 159, 0.1); --button-primary: rgb(216, 48, 138); '
      break;
    default:
      parttwo = '--eon-primary: rgb(51, 147, 226); --eon-secondary: #4548fc; '
      partfour = '--ripple-primary: rgba(51, 147, 226, 0.3); --ripple-secondary: rgba(51, 147, 226, 0.1); --button-primary: rgb(76, 110, 204); '
      break;
  }
  
  $('#appTheme').html(':root {' + partone + parttwo + partthree + partfour + '}')
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  refreshTheme()
});

function switchDark() {
  localStorage.setItem('es_theme_light', 'dark')
  refreshTheme()
}

function switchLight() {
  localStorage.setItem('es_theme_light', 'light')
  refreshTheme()
}

async function switchAuto(skipMSG) {
  localStorage.setItem('es_theme_light', 'auto')
  refreshTheme()
}

function switchColor(color) {
  localStorage.setItem('es_theme_color', color)  
  refreshTheme()
}

function artistToString(artists) {
  if (artists.length == 1) {
    return artists[0].name
  }
  
  snippet = ''

  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i].name;
    if (i == artists.length - 1) {
      // Last item
      snippet = snippet + 'and ' + artist
    }
    else {
      // Regular item
      snippet = snippet + artist + ', '
    }
  }

  return snippet
}

function genresToString(genres) {
  if (genres.length == 1) {
    return artists[0]
  }
  
  snippet = ''

  for (let i = 0; i < genres.length; i++) {
    const genre = genres[i];
    if (i == genres.length - 1) {
      // Last item
      snippet = snippet + 'and ' + genre
    }
    else {
      // Regular item
      snippet = snippet + genre + ', '
    }
  }

  return snippet
}


function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "G" },
    { value: 1E12, symbol: "T" },
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function reOrderAlbumLibrary(id) {
  console.log('Sorting album based off track indexes.');

  var $wrapper = $(`#${id}AlbumSongslib`)
  $wrapper.find('.song').sort(function(a, b) {
    return +a.getAttribute('track_album_index') - +b.getAttribute('track_album_index')
  }).appendTo($wrapper);
}