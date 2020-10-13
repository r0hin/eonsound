document.getElementById("searchbox").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    performSearch(document.getElementById("searchbox").value);
  }
});

async function performSearch(q) {
  $('#searchbox').val('')

  const result = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=album,artist,playlist,track`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyCode}`,
      },
    }
  );

  const data = await result.json();

  if (data.error) {
    if (sessionStorage.getItem("errorAvoid") == "true") {
      // Don't start a loop of errors wasting code use.
      Snackbar.show({ text: "An error occured while searching" });
      return;
    }

    console.log(
      "Error occured. Likely invalid code - request and do it again."
    );

    sessionStorage.setItem("errorAvoid", "true");
    refreshCode();
    performSearch(q);
    return;
  }

  // Has results in data

  refreshCode();
  sessionStorage.setItem("errorAvoid", "false");

  buildSearch(data);
}

async function buildSearch(data) {
  console.log(data);

  // Data is an object containing fields: albums, artists, playlists, tracks
  $("#search_albums").empty();
  $("#search_artists").empty();
  $("#search_playlists").empty();
  $("#search_tracks").empty();

  for (let i = 0; i < data.albums.items.length; i++) {
    // For each album
    await album(data.albums.items[i].id, data.albums.items[i], 'album_search_index_' + i, 'search_albums')
    $("#album_search_index_" + i).imagesLoaded(() => {
      $("#album_search_index_" + i).removeClass("hidden");
    })
  }

  for (let i = 0; i < data.artists.items.length; i++) {
    // For each artist
    await artist(data.artists.items[i].id, data.artists.items[i], 'artist_search_index_' + i, 'search_artists')
    $("#artist_search_index_" + i).imagesLoaded(() => {
      $("#artist_search_index_" + i).removeClass("hidden");
    });
  }

  for (let i = 0; i < data.playlists.items.length; i++) {
    // For each album
    await playlist(data.playlists.items[i].id, data.playlists.items[i], 'playlist_search_index_' + i, 'search_playlists')
    $("#playlist_search_index_" + i).imagesLoaded(() => {
      $("#playlist_search_index_" + i).removeClass("hidden");
    });
  }

  for (let i = 0; i < data.tracks.items.length; i++) {
    // For each episode
    await track(data.tracks.items[i].id, data.tracks.items[i], 'track_search_index_' + i, 'search_tracks')
    $("#track_search_index_" + i).imagesLoaded(() => {
      $("#track_search_index_" + i).removeClass("hidden");
    });
  }

  addWaves();
}
