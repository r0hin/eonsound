// display.js
// Display optimization scripts.

function masonryAlbums() {
  allItems = $('#collectionAlbums').get(0).getElementsByClassName('album')
  for (x = 0; x < allItems.length; x++) {
    masonryAlbum(allItems[x]);
  }
}

function masonryAlbum(item) {
  grid = document.getElementById("collectionAlbums");
  rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
  item.style.gridRowEnd = "span " + rowSpan;  
  item.style.transition = "all 0.5s";   
}

function masonryArtists() {
  allItems = $('#collectionArtists').get(0).getElementsByClassName('artist')
  for (x = 0; x < allItems.length; x++) {
    masonryArtist(allItems[x]);
  }
}

function masonryArtist(item) {
  grid = document.getElementById("collectionArtists");
  rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
  item.style.gridRowEnd = "span " + rowSpan;  
  item.style.transition = "all 0.5s";   
}

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
      document.getElementById(containerID).setAttribute('style', 'background-image: linear-gradient(180deg, rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ', 1) -30%, var(--bg-secondary) 100%)')  
      break;
    case 'albumPreview':
      document.getElementById(containerID).setAttribute('style', 'background-color: rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ', 0.9)')
    default:
      break;
  }

}

$('[data-toggle="tooltip"]').tooltip();

