sessionStorage.setItem("first-time-hot", "true");
sessionStorage.setItem("first-time-library", "true");
sessionStorage.setItem("first-time-account", "true");

function tabe(tab, el) {
  // Switch to the tab

  hideAlbum();
  hideArtist();
  hidePlaylist();

  $(`.tab`).addClass("hidden");
  $(`#${tab}-tab`).removeClass("hidden");

  $(".tabgradicon").removeClass("tabgradicon");
  $(el).children().first().addClass("tabgradicon");

  // Check first time

  if (sessionStorage.getItem(`first-time-${tab}`) == "true") {
    sessionStorage.setItem(`first-time-${tab}`, "false");
    switch (tab) {
      case "hot":
        // Hot stuff
        break;
      case "library":
        // Library stuff
        break;
      case "account":
        // Account stuff
        break;

      default:
        break;
    }
  }
}

tabe("hot");
