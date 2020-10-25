sessionStorage.setItem("menuOpen", "false");
contextMenuListener();

function getPosition(e) {
  var posx = 0; var posy = 0;

  if (!e) var e = window.event;
  if (e.pageX || e.pageY) {
    posx = e.pageX; posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  return { x: posx, y: posy };
}

function clickInsideElement(e, className) {
  var el = e.srcElement || e.target;

  if (el.classList.contains(className)) {
    return el;
  } else {
    while ((el = el.parentNode)) {
      if (el.classList && el.classList.contains(className)) {
        return el;
      }
    }
  }

  return false;
}

async function contextMenuListener() {
  document.addEventListener("contextmenu", (e) => {
    checkElements(e)
  });
}

function checkElements(e) {
  el = clickInsideElement(e, "song");
    if (el) {
      trackContext(e, el)
      toggleMenuOff('track');
    } else {
      el = clickInsideElement(e, "album");
      if (el) {
        albumContext(e, el)
        toggleMenuOff('album');
      } else {
        el = clickInsideElement(e, "artist")
        if (el) {
          artistContext(e, el)
          toggleMenuOff('artist');
        }
      }
    }
}

function toggleMenuOff(ignore) {
  sessionStorage.setItem("menuOpen", "false");
  document.getElementById("track_context").classList.remove("context_active");
  document.getElementById("album_context").classList.remove("context_active");
  document.getElementById("artist_context").classList.remove("context_active");

  if (ignore) {
    // Toggle off everything except for ignore
    sessionStorage.setItem("menuOpen", "true");
    document.getElementById(ignore + "_context").classList.add("context_active");
  }
}

document.addEventListener("click", function (e) {
  if (sessionStorage.getItem("menuOpen") == "true") {
    toggleMenuOff();
  }
});

function positionMenu(e, menu) {
  clickCoords = getPosition(e);
  clickCoordsX = clickCoords.x;
  clickCoordsY = clickCoords.y;

  menuWidth = menu.offsetWidth + 4;
  menuHeight = menu.offsetHeight + 4;

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  if ( (windowWidth - clickCoordsX) < menuWidth ) {
    menu.style.left = windowWidth - menuWidth + "px";
  } else {
    menu.style.left = clickCoordsX + "px";
  }

  if ( (windowHeight - clickCoordsY) < menuHeight ) {
    menu.style.top = windowHeight - menuHeight + "px";
  } else {
    menu.style.top = clickCoordsY + "px";
  }
}

async function trackContext(e, el) {
  e.preventDefault();
  sessionStorage.setItem("menuOpen", "true");
  
  menu = document.getElementById("track_context");
  menu.classList.add("context_active");
  positionMenu(e, menu)

  id = el.getAttribute("track_details")

  // PLAY BUTTON
  document.getElementById("playbtn").onclick = () => {
    window.musicQueue = [];
    window.musicHistory = [];
    window.musicActive = { none: "none" };
    playSongWithoutData(id);
  };
  
  // QUEUE BUTTON
  document.getElementById("queuebtn").onclick = () => {
    queueSongWithoutData(id);
  };

  // ADD PLAYLIST  
  document.getElementById("0addbtn").onclick = async () => {
    // Get track details
    const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyCode}`,
      },
    });

    const data = await result.json();

    if (data.error) {
      if (sessionStorage.getItem("errorAvoid") == "true") {
        Snackbar.show({ text: "An error occured while loading library options."});
        return;
      }
      console.log("Error occured. Likely invalid code - request and do it again.");
      sessionStorage.setItem("errorAvoid", "true");
      refreshCode();
      document.getElementById("0addbtn").click();
      return;
    }

    refreshCode();
    sessionStorage.setItem("errorAvoid", "false");

    artists = artistToString(data.artists)

    url = await downloadSong(id, data.external_urls.spotify, data.name)

    window.prepare_library_changes = {
      id: id,
      url: url.data,
      art: data.album.images[0].url,
      artists: artists,
      name: data.name,
      length: data.duration_ms,
      type: 'track',
    };

    $('#playlistSelect').modal('toggle')
  };

  // ADD LIBRARY
  document.getElementById('1addbtn').onclick = async () => {
    // Call directly
    addTrackToLibrary(id)
  }

  // ADD LIKED
  if (cacheLikedTracks.includes(id)) {
    // Already liked
    document.getElementById('2addbtn').onclick = async () => {
      unfavTrack(id)
    }
    document.getElementById('2addbtn').innerHTML = "Remove from Favorites"
  }
  else {
    document.getElementById('2addbtn').onclick = async () => {
      favTrack(id)
    }
    document.getElementById('2addbtn').innerHTML = "Add to Favorites"
  }

  // SONG INFO
  document.getElementById('infobtn').onclick = async () => {
    console.log(' Song info');
  }

  // Copy link
  document.getElementById('copybtn').onclick = async () => {
    console.log(' Song link');
  }

}

async function albumContext(e, el) {
  e.preventDefault();
  sessionStorage.setItem("menuOpen", "true");
  
  menu = document.getElementById("album_context");
  menu.classList.add("context_active");
  positionMenu(e, menu)

  id = el.getAttribute("album_details");

  // OPEN BUTTON
  document.getElementById("openbtn").onclick = () => {
    showAlbum(id);
  };

  // ADD LIBRARY
  document.getElementById("0addbtn2").onclick = async () => {
    // Call function directly
    await addAlbumToLibrary(id)
  };

  // ADD LIKED
  if (cacheLikedAlbums.includes(id)) {
    // Already liked
    document.getElementById('1addbtn2').onclick = async () => {
      unfavAlbum(id)
    }
    document.getElementById('1addbtn2').innerHTML = "Remove from Favorites"
  }
  else {
    document.getElementById('1addbtn2').onclick = async () => {
      favAlbum(id)
    }
    document.getElementById('1addbtn2').innerHTML = "Add to Favorites"
  }


  // SONG INFO
  document.getElementById('infobtn2').onclick = async () => {
    console.log(' Album info');
  }

  // Copy link
  document.getElementById('copybtn2').onclick = async () => {
    console.log(' Album info');
  }
}

async function artistContext(e, el) {
  e.preventDefault();
  sessionStorage.setItem("menuOpen", "true");
  
  menu = document.getElementById("artist_context");
  menu.classList.add("context_active");
  positionMenu(e, menu)

  id = el.getAttribute("artist_details");

  // OPEN BUTTON
  document.getElementById("openbtnartist").onclick = () => {
    showArtist(id);
  };

  // ADD LIBRARY
  document.getElementById("0addbtnartist").onclick = async () => {
    // CAll function directly
    addArtistToLibrary(id)
  };

  // ADD LIKED
  if (cacheLikedArtists.includes(id)) {
    // Already liked
    document.getElementById('1addbtnartist').onclick = async () => {
      unfavArtist(id)
    }
    document.getElementById('1addbtnartist').innerHTML = "Remove from Favorites"
  }
  else {
    document.getElementById('1addbtnartist').onclick = async () => {
      favArtist(id)
    }
    document.getElementById('1addbtnartist').innerHTML = "Add to Favorites"
  }


  // SONG INFO
  document.getElementById('infobtnartist').onclick = async () => {
    console.log(' Artist info');
  }

  // Copy link
  document.getElementById('copybtnartist').onclick = async () => {
    console.log(' Artist Link');
  }
}