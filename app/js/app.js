var firebaseConfig = {
  apiKey: "AIzaSyBNf1JpByuDebVLq_lns8fYv4Pyo3kzvoM",
  authDomain: "eonsound.firebaseapp.com",
  databaseURL: "https://eonsound.firebaseio.com",
  projectId: "eonsound",
  storageBucket: "eonsound.appspot.com",
  messagingSenderId: "824179683788",
  appId: "1:824179683788:web:81830e10e40b4b887ded69",
};
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.

		window.user = user;

    if (!user.emailVerified) {
      $("#unverified").removeClass("hidden");
      return;
    }

    appContent();
  } else {
    window.location.replace("welcome.html");
  }
});


function sendVerification(el) {
  user
    .sendEmailVerification()
    .then(function () {
      $(el).addClass("hidden");
      $("#sentEmail").removeClass("hidden");

      // Email sent.
    })
    .catch(function (error) {
      alert(error);
    });
}

async function appContent() {
  initSpotifyCode();

  doc = await db.collection("app").doc("details").get();
  window.cachedetails = doc.data();

  doc = await db.collection("users").doc(user.uid).get();
  if (!doc.exists) {
    $("#finish_profile").removeClass("hidden");
    return;
  }

  window.cacheuser = doc.data();
  loadUserPlaylists(cacheuser.playlistsPreview);

  $("#userpfp1").get(0).src = cacheuser.url;
  $("#usercard").imagesLoaded(function () {
    $("#usercard").removeClass("hidden");
  })
  $("#username1").html(`<b>${cacheuser.name}</b>${cacheuser.username}`);
}

async function createUser() {
  // Much to dangerous processes to create user locally. Refer to cloud function.

  // Duplicate formatting as to not take long for returning errors.

  if (/\s/g.test($("#usernamebox").val().toLowerCase())) {
    $("#createAccFeedback").removeClass("hidden");
    $("#createAccFeedback").html("Your username contains whitespace.");
    return;
  }

  if (cachedetails.usernames.includes($("#usernamebox").val())) {
    $("#createAccFeedback").removeClass("hidden");
    $("#createAccFeedback").html("That username is taken!");
    return;
  }

  toggleloader();

  name = $("#namebox").val();
  username = $("#usernamebox").val().toLowerCase();

  await user.updateProfile({
    displayName: name,
  });

  var createAccount = firebase.functions().httpsCallable("createAccount");
  createAccount({ username: username, displayname: name }).then((result) => {
    if (result.data) {
      toggleloader();
      showcomplete();
      window.setTimeout(() => {
        appContent();

        $("#finish_profile").removeClass("fadeIn");
        $("#finish_profile").addClass("fadeOut");
        window.setTimeout(() => {
          $("#finish_profile").addClass("hidden");
        }, 800);
      }, 1200);
    } else {
      alert("Error occured.");
      window.location.replace("404.html");
    }
  });
}

async function initSpotifyCode() {
  // Check if access token stored in database is valid

  doc = await db
    .collection("users")
    .doc(user.uid)
    .collection("access")
    .doc("spotify")
    .get();

  if (!doc.exists) {
    window.location.replace("auth.html");
  }

  // data.access is the refresh token, so exchange it for an actual token
  token = doc.data().access;
  window.spotifyToken = token;

  // Exchange refresh token for a new token
  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=",
    },
    body: `grant_type=refresh_token&refresh_token=${token}`,
  });
  if (result.status >= 400 && result.status < 600) {
    throw new Error("Bad response from server");
  }
  const data = await result.json();
  window.spotifyCode = data.access_token;
  } catch (error) {
    Snackbar.show({text: "If your password was changed, please reauthenticate <a href='auth.html'>here</a>."})
  }
}

async function refreshCode() {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic YjJiMGU0MWQwYTNlNDQ2NGIxMmViYTY2NmExZGUzNmQ6Y2MwMWM3OTExYjRjNDE2ODliOTcxMDM0ZmY5NzM1ODc=",
    },
    body: `grant_type=refresh_token&refresh_token=${spotifyToken}`,
  });

  const data = await result.json();
  window.spotifyCode = data.access_token;
}

function logout() {
  Snackbar.show({ text: "Logging out..." });
  window.setTimeout(() => {
    firebase
      .auth()
      .signOut()
      .then(function () {
        // Sign-out successful.
      });
  }, 1500);
}

function preparenpicchange() {
  $("#pfpghost").empty();
  h = document.createElement("input");
  h.id = "newpicel";
  h.style.display = "none";
  h.setAttribute("type", "file");
  h.setAttribute("accept", "image/*");
  document.getElementById("pfpghost").appendChild(h);
  $("#newpicel").change(function () {
    changepfp();
  });
  $("#newpicel").click();
}

async function changepfp() {
  toggleloader();
  file = document.getElementById("newpicel").files[0];
  ext = file.name.split(".").pop();

  var storageRef = firebase.storage().ref();
  var fileRef = storageRef.child(`logos/${user.uid}.${ext}`);

  await fileRef.put(file);

  window.setTimeout(() => {
    toggleloader();
    showcomplete();

    // Change existing records
    document.getElementById("pfpimg1").src =
      "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/logos%2F" +
      user.uid +
      "." +
      ext +
      "?alt=media&" +
      new Date().getTime();
    document.getElementById("pfpimg2").src =
      "https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/logos%2F" +
      user.uid +
      "." +
      ext +
      "?alt=media&" +
      new Date().getTime();
  }, 800);

  $("#newpicel").remove();
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
  
    default:
      break;
  }

}