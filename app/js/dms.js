// DMs.js
// Direct messaging section of the social platform.
window.previousUID = 'ski'

// Activate listeners
async function msgListener() {
  doc = await db.collection("directlisteners").doc(user.uid).get()
  if (doc.exists) {
    msgListenerConfirm()
  } 
  else {
    await db.collection("directlisteners").doc(user.uid).set({
      most_recent_sender: "none",
    })
    msgListenerConfirm()
  }
}
function msgListenerConfirm() {
  db.collection("directlisteners").doc(user.uid).onSnapshot((doc) => {
    console.log('Something changed');
    if (doc.data().most_recent_sender !== "none") {
      // On listener change, enact recent changes if a DM was changed and it was not the client
      ENACT_CHANGES(doc.data());
    }
  });
}

async function ENACT_CHANGES(data) {
  string = dmstringify(user.uid, data.most_recent_sender)
  doc = await db.collection("direct").doc(string).get()
  
  if (doc.data() == undefined || doc.data().messages == undefined) {
    return;
  }
  
  // msg is the most recent message to push
  msg = doc.data().messages[doc.data().messages.length - 1];
  
  // If the chat window exists
  if ($(`#messagecontent${data.most_recent_sender}`).length) {
    BUILD_MESSAGE(data.name, msg, uid, uid, true);
    
    // If its not actively in view
    if ($(`#${uid}'UserView'`).hasClass('fadeOut') || sessionStorage.getItem('CURRENTAB') !== 'friends') {
      $('#friendsText').html('Friends (!)')
    }
    if (sessionStorage.getItem('CURRENTAB') !== 'friends') {
      Snackbar.show({text: "New DM!"})
    }
  }
  else {
    // Add a ping because it means you reciveved a message but it is not built
    $('#friendsText').html('Friends (!)')
  }
}

async function ADD_MESSAGE(uid, msg) {
  if (msg == ' ' || !msg) {
    return
  }

  BUILD_MESSAGE(cacheuser.username, msg, user.uid, uid, true)

  $(`#newdmmsg${uid}`).val('')
  
  string = dmstringify(user.uid, uid)
  
  await db.collection('direct').doc(string).set({
    messages: firebase.firestore.FieldValue.arrayUnion({
      user: user.uid,
      username: cacheuser.username,
      msg: msg,
      unique: Math.random(0, 100000000000),
    }),
    [`unr_${user.uid}`]: false,
    [`unr_${uid}`]: true,
  }, {merge: true})

  await db.collection('directlisteners').doc(uid).set({
    most_recent_sender: user.uid,
    photo_url: cacheuser.url,
    name: cacheuser.username,
    unique: Math.random(0, 100000000000),
  })
  
  console.log(uid,msg);
}

function BUILD_MESSAGE(name, msg, sender, uid, anim) {
  p = document.createElement("div");
  if (anim) {anim = ' animated fadeInUp '} else { anim = ''}
  p.setAttribute('class', 'messagecontainer clearfix' + anim)



  p.innerHTML = `
  ${name} of ${uid} says ${msg}
  `

  if (previousUID === sender) {
    // Attach it to bottommost element
    $(`#messagecontent${uid}`).children().last().get(0).innerHTML += `-> ${name} of ${uid} says ${msg}`
  }
  else {
    $(`#messagecontent${uid}`).get(0).appendChild(p)
  }

  previousUID = sender

}

async function loadMessages(id) {
  var doc = await db.collection('direct').doc(dmstringify(user.uid, id)).get()
  for (let i = 0; i < doc.data().messages.length; i++) {
    const element = doc.data().messages[i];
    BUILD_MESSAGE(element.username, element.msg, element.user, id, false)
  }
}