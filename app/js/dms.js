// DMs.js
// Direct messaging section of the social platform.
sessionStorage.setItem('itsMyMsg', 'false')

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
    if (doc.data().most_recent_sender !== "none") {
      if (sessionStorage.getItem('itsMyMsg') !== 'true') {
        sessionStorage.setItem('itsMyMsg', 'false')
        return;
      }
      // On listener change, enact recent changes if a DM was changed and it was not the client
      ENACT_CHANGES(doc.data().most_recent_sender);
    }
  });
}

async function ENACT_CHANGES(uid) {
  string = dmstringify(user.uid, uid)
  doc = await db.collection("direct").doc(string).get()
  
  if (doc.data() == undefined || doc.data().messages == undefined) {
    return;
  }

  // msg is the most recent message to push
  msg = doc.data().messages[doc.data().messages.length - 1];
  
  // If the chat window exists
  if ($(`#${messagecontent}uid`).length) {
    doc = await db.collection("users").doc(uid).get()
    BUILD_MESSAGE(doc.data().name, msg, string, true);
    // Scroll to bottom of chat
    
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

async function ADD_MESSAGE(user, msg) {
  $(`#newdmmsg${user}`).val('')

  string = dmstringify(user.uid, user)

  await db.collection('direct').doc(string).set({
    messages: firebase.firestore.FieldValue.arrayUnion({
      user: user.uid,
      msg: msg,
    }),
    [`unr_${user.uid}`]: false,
    [`unr_${user}`]: true,
  })

  console.log(user,msg);
}