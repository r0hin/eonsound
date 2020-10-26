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