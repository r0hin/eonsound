// DMs.js
// Direct messaging section of the social platform.
sessionStorage.setItem('itsMyMsg', 'false')
window.prevuid = ""

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

async function ADD_MESSAGE(uid, msg) {
  console.log(uid);
  $(`#newdmmsg${uid}`).val('')
  
  string = dmstringify(user.uid, uid)
  
  await db.collection('direct').doc(string).set({
    messages: firebase.firestore.FieldValue.arrayUnion({
      user: user.uid,
      msg: msg,
      unique: Math.random(0, 100000000000),
    }),
    [`unr_${user.uid}`]: false,
    [`unr_${uid}`]: true,
  })

  await db.collection('directlisteners').doc(uid).set({
    most_recent_sender: user.uid,
    photo_url: cacheuser.url,
    name: cacheuser.username
  })
  
  console.log(uid,msg);
}

function BUILD_MESSAGE(name, msg, string, anim, reverse) {
  if (typeof prevuid == "undefined") { prevuid = ""; }

  p = document.createElement("div");
  p.classList.add("messagecontainer");
  p.classList.add("clearfix");

  if (msg.sender == user.uid) {
    // Client sent it
    textContainer = "msgcontainerclient shadow-sm";
  } else {
    // Not client
    textContainer = "msgcontainerother shadow-sm";
  }

  // TIMESTAMP IS msg.timestamp.toDate().toLocaleTimeString().slice(0, msg.timestamp.toDate().toLocaleTimeString().lastIndexOf(":")) + ' ' + msg.timestamp.toDate().toLocaleTimeString().slice(-2)
  
  if (msg.app_preset.startsWith("esadmin-direct")) {
    p.classList.remove("messagecontainer");
    p.classList.add("systemmessagecontainer");
    textContainer = "msgcontainerapp shadow-lg";
    prevuid = "disabled";
  }

  p.innerHTML = '<div class="' + textContainer + '">' + msg.content + "</div>";

  if (prevuid === msg.sender && anim) {
    // Check if bottommost msg is a system msg
    el = $("#" + string + "chatcontainer").find(".clearfix:first");
    if (el.hasClass("systemmessagecontainer")) {
      // Make sure dont add msg to previous sent msg
      prevuid = "NANNANANANOOOOPE TRASH LOSER L";
    }
  }
  if (prevuid === msg.sender) {
    if (msg.sender == user.uid) {
      clientorme = "client";
    } else {
      clientorme = "other";
    }
    if (reverse) {
      if (
        $("#" + string + "chatcontainer").children(".messagecontainer")
          .length == 0
      ) {
        // error, element doesnt exist so create a container for this at the bottom (prepend cause reversed), then  continue with tryna find messagecontainers and add it to the bottom. or top.
        $("#" + string + "chatcontainer").prepend(p);
      }
      $("#" + string + "chatcontainer")
        .children(".messagecontainer")
        .last()
        .children(".msgcontainer" + clientorme)
        .first()
        .get(0).innerHTML =
        msg.content +
        "<br>" +
        $("#" + string + "chatcontainer")
          .children(".messagecontainer")
          .last()
          .children(".msgcontainer" + clientorme)
          .first()
          .get(0).innerHTML;
    } else {
      if (
        $("#" + string + "chatcontainer").children(".messagecontainer")
          .length == 0
      ) {
        // error, element doesnt exist so create a container for this at the bottom (prepend cause reversed), then  continue with tryna find messagecontainers and add it to the bottom. or top.
        $("#" + string + "chatcontainer").prepend(p);
      }
      $("#" + string + "chatcontainer")
        .children(".messagecontainer")
        .first()
        .children(".msgcontainer" + clientorme)
        .last()
        .get(0).innerHTML += "<br>" + msg.content;
    }
  } else {
    if (reverse == undefined) {
      reverse = false;
    }
    if (reverse) {
      $("#" + string + "chatcontainer").append(p);
    } else {
      $("#" + string + "chatcontainer").prepend(p);
    }
    addWaves();
  }

  // Something definitely appended, so invoke the animations now:
  // Latest Message: $('#' + string + 'chatcontainer').children()[1]
  // Only run if you're explicitly sending the message in this session
  if (anim && prevuid !== msg.sender) {
    // Display message rise animation:

    // Clone element and copy text from there.
    $($("#" + string + "chatcontainer").children()[0]).appendTo(
      "#dimensions_calculations_box"
    );
    $("#dimensions_calculations_box").imagesLoaded(() => {
      default_height = $(
        $("#dimensions_calculations_box").children()[0]
      ).height();
      $($("#dimensions_calculations_box").children()[0]).prependTo(
        "#" + string + "chatcontainer"
      );
      $($("#" + string + "chatcontainer").children()[0]).addClass(
        "unanimated_msg"
      );

      console.log("Message preview is loaded. Display animation");

      window.setTimeout(() => {
        $("#" + string + "chatcontainer").children()[0].style.height =
          default_height + "px";
        $("#" + string + "chatcontainer").children()[0].style.marginTop =
          "16px";
        window.setTimeout(() => {
          $("#" + string + "chatcontainer")
            .children()[0]
            .removeAttribute("style");
          $("#" + string + "chatcontainer")
            .children()[0]
            .classList.remove("unanimated_msg");
        }, 1200);
      }, 50);
    });
  }

  if (prevuid == msg.sender) {
    $("#" + string + "chatcontainer")
      .children()[0]
      .removeAttribute("style");
    $($("#" + string + "chatcontainer").children()[0]).removeClass(
      "unanimated_msg"
    );
  }

  prevuid = msg.sender;
  if (msg.app_preset.startsWith("esadmin-")) {
    prevuid = "disabled";
  }
}