// social.js
// The file includes all the details associated with the social section of EonSound.
// Things like accounts, following, timelines, etc will be managed here.

window.cacheUserFriends = []
window.db = firebase.firestore();
document.getElementById("addFriendBox").addEventListener("keyup", function (event) { if (event.keyCode === 13) { event.preventDefault(); addFriend($('#addFriendBox').val());$('#addFriendBox').val('') }});
async function loadFriends() {
  if (typeof(cacheuser) == 'undefined') {
    window.setTimeout(() => {
      loadFriends()
    }, 15000)
    return;
  }
  loadRequests()
}

async function loadRequests() {
  // Setup a listener and adjust elements accordingly

  db.collection('requests').doc(user.uid).onSnapshot(async (doc) => {
    if (!doc.exists) {
      await db.collection('requests').doc(user.uid).set({
        requests: []
      })
      return;
    }
    if (typeof(doc.data().requests) == 'undefined') {
      doc.data().requests = []
    }
    $('#requests').empty()
    $('#incNum').html(doc.data().requests.length)
    if (doc.data().requests.length === 0) {
      $('#incNum').html('')
      $('#requests').html('<center>You have no incoming friend requests 😭.</center>')
    }
    for (let i = 0; i < doc.data().requests.length; i++) {
      const activeRequest = doc.data().requests[i];
      k = document.createElement('div')
      k.setAttribute('class', 'card userRequestCard')
      k.setAttribute('id', activeRequest.id + 'rqcard')
      k.innerHTML = `
        <img src="${activeRequest.p}" />
        <h4>${activeRequest.u}</h4>
        <button onclick="denyRequest('${activeRequest.id}', '${activeRequest.p}', '${activeRequest.u}')" class="btn-text-danger"><i class='bx bx-message-square-x'></i></button>
        <button onclick="approveRequest('${activeRequest.id}', '${activeRequest.p}', '${activeRequest.u}')" class="btn-contained-success"><i class='bx bx-message-square-check'></i></button>
      `
      $('#requests').get(0).appendChild(k)
    }
    initButtonsText()
    initButtonsContained()
  });

  db.collection('users').doc(user.uid).onSnapshot(function(doc) {
    if (doc.data().friends && cacheUserFriends.length !== doc.data().friends.length) {
      cacheUserFriends = doc.data().friends
      buildFriends(doc.data().friends)
    }
    window.cacheuser = doc.data()
    $('#requested').empty()
    if (typeof(cacheuser.requested) == 'undefined') {
      cacheuser.requested = []
    }
    $('#outNum').html(cacheuser.requested.length)
    if (cacheuser.requested.length === 0) {
      $('#outNum').html('')
      $('#requested').html('<center>You have no outgoing friends requests 😪.</center>')
    }
    for (let i = 0; i < cacheuser.requested.length; i++) {
      const activeRequest = cacheuser.requested[i];
      k = document.createElement('div')
      k.setAttribute('class', 'card userRequestCard')
      k.setAttribute('id', activeRequest.id + 'rqcard')
      k.innerHTML = `
        <img src="${activeRequest.p}" />
        <h4>${activeRequest.u}</h4>
        <button onclick="cancelRequest('${activeRequest.id}', '${activeRequest.p}', '${activeRequest.u}')" class="btn-text-danger"><i class='bx bx-message-square-x'></i></button>
      `
      $('#requested').get(0).appendChild(k)
    }
    initButtonsText()
    initButtonsContained()
  });
}

async function loadActivity() {
}

async function addFriend(username) {
  // Gather info from username
  $('#friendPreview').empty()
  if (typeof(appDoc) == 'undefined') {
    window.appDoc = await db.collection('app').doc('details').get()
  }

  friendIndex = appDoc.data().usernames.indexOf(username)
  if (friendIndex == -1) {
    Snackbar.show({text: "No one exists with this username.", pos: 'top-center'})
    return;
  }

  var doc = await db.collection('users').doc(appDoc.data().map[friendIndex]).get()
  var data = doc.data()

  g = document.createElement('div')
  g.setAttribute('class', 'card previewLargeCard animated fadeIn')
  g.innerHTML = `
  <img src="${data.url}">
  <div class="content">
    <h3>${data.name}</h3> <span class="chip">${data.username}</span>
  </div>
  <div class="actions">
    <button onclick="confirmFriend('${data.uid}', '${data.username}', '${data.url}', '${data.name}')" class="btn-text-primary">Send Follow Request</button>
  </div>
  `
  $('#friendPreview').get(0).appendChild(g)
  initButtonsText()
}

async function confirmFriend(uid, username, url) {
  $('#friendPreview').empty()

  if (username == cacheuser.username) {
    Snackbar.show({text: "You cannot send a friend request to yourself!", pos: 'top-center'})
    return;
  }

  await db.collection('requests').doc(uid).set({
    requests: firebase.firestore.FieldValue.arrayUnion({
      u: cacheuser.username,
      p: cacheuser.url,
      id: user.uid,
    })
  }, {merge: true})

  await db.collection('users').doc(user.uid).set({
    requested: firebase.firestore.FieldValue.arrayUnion({
      u: username,
      p: url,
      id: uid,
    })
  }, {merge: true})

  Snackbar.show({text: `Friend request sent to ${username}.`, pos: 'top-center'})
}

async function cancelRequest(id, url, username) {
  await db.collection('users').doc(user.uid).update({
    requested: firebase.firestore.FieldValue.arrayRemove({
      id: id,
      p: url,
      u: username,
    })
  })
  await db.collection('requests').doc(id).update({
    requests: firebase.firestore.FieldValue.arrayRemove({
      id: user.uid,
      p: cacheuser.url,
      u: cacheuser.username,
    })
  })

  Snackbar.show({text: `Cancelled request to ${username}.`, pos: 'top-center'})
}

async function approveRequest(id, url, username) {
  var acceptFriend = firebase.functions().httpsCallable("acceptFriend");
  acceptFriend({ uid: id, myurl: cacheuser.url, myusername: cacheuser.username })

  await db.collection("users").doc(user.uid).update({
    requested: firebase.firestore.FieldValue.arrayRemove({
      id: id,
      p: url,
      u: username
    }),
    friends: firebase.firestore.FieldValue.arrayUnion({
      id: id,
      p: url,
      u: username
    })
  });

  await db.collection("requests").doc(user.uid).update({
    requests: firebase.firestore.FieldValue.arrayRemove({
      id: id,
      p: url,
      u: username
    }),
  });

  Snackbar.show({text: `Accepted friend request from ${username}.`})
}

async function denyRequest(id, url, username) {
  var denyFriend = firebase.functions().httpsCallable("denyFriend");
  denyFriend({ uid: id, url: cacheuser.url, username: cacheuser.username })

  await db.collection("users").doc(user.uid).update({
    requested: firebase.firestore.FieldValue.arrayRemove({
      id: id,
      p: url,
      u: username
    }),
  });

  await db.collection("requests").doc(user.uid).update({
    requests: firebase.firestore.FieldValue.arrayRemove({
      id: id,
      p: url,
      u: username
    }),
  });

  Snackbar.show({text: `Denied friend request from ${username}.`})
}

async function buildFriends(friends) {
  $('#horizontal_friends_list').empty()
  console.log(friends);
  for (let i = 0; i < friends.length; i++) {
    const friend = friends[i];
    o = document.createElement('div')
    o.setAttribute('class', 'hidden animated fadeIn friendItem')
    o.setAttribute('id', friend.id + 'iconElement')
    o.onclick = () => {
      openSocial(friend.id)
    }
    o.innerHTML = `
    <img src="${friend.p}" />
    <h4>${friend.u}</h4>
    `
    $('#horizontal_friends_list').get(0).appendChild(o)
    $(`#${friend.id}iconElement`).imagesLoaded(() => {
      $(`#${friend.id}iconElement`).removeClass('hidden');
    })
  }
}

async function openSocial(id) {
  // Remove all the others
  $('.friendView').removeClass('fadeIn')
  $('.friendView').addClass('fadeOut')

  // Check if view exists
  if ($(`#${id}UserView`).length) {
    // Show if it does
    $('.friendView').removeClass('fadeOut')
    $('.friendView').addClass('fadeIn')
    return;
  }

  // Build if it doesn't
  h = document.createElement('div')
  h.setAttribute('class', 'animated fadeIn fastest friendView')
  h.setAttribute('id', id + 'UserView')
  h.innerHTML = `
  <div class="row">
    <div class="col-sm">
      ${id}
    </div>
    <div class="col-sm">
      <div id="messagecontent${id}">  
      </div>
      <br>
      <div class="relative2">
        <div class="floating-label textfield-box newmsgbox">
          <label for="newdmmsg${id}">New Message</label>
          <input class="form-control" id="newdmmsg${id}" placeholder="" type="text">
        </div>
      </div>
      </div>
      <!-- Out of the viewport. User can scroll down whilst image loads.  -->
      <div id="dimensions_calculations_box"></div>
    </div>
  </div>
  `
  $('#user_content').get(0).appendChild(h)

  document.getElementById("newdmmsg" + id).addEventListener("keyup", function (event) { if (event.keyCode === 13) { event.preventDefault(); ADD_MESSAGE(id, event.target.value) }});
}