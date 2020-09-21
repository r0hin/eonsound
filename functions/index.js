const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const request = require('request');
const fs = require('fs')
const path = require('path');
const os = require('os');
const tmpdir = os.tmpdir();
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const util = require('util');
const exec = util.promisify(require('child_process').exec);


exports.createAccount = functions.https.onCall(async (data, context) => {
    
    const uid = context.auth.uid;
    const name = data.displayname;
    const username = data.username
    const db = admin.firestore()

    function hasWhiteSpace(s) {
        return /\s/g.test(s);
    }

    // Username verification
    if (hasWhiteSpace(username) || username == "") {
        return {data: false};
    }

    doc = await db.collection('app').doc('details').get()
    
    if (doc.data().usernames.includes(username)) {
        return {data: false};
    }

    // Approved, create account.

    await db.collection('app').doc('details').update({
        usernames: admin.firestore.FieldValue.arrayUnion(data.username),
        map: admin.firestore.FieldValue.arrayUnion(uid)
    })

    await db.collection('follow').doc(uid).collection('followers').doc('a').set({
        status: false,
    })

    await db.collection('follow').doc(uid).collection('following').doc('a').set({
        status: false,
    })

    await db.collection('follow').doc(uid).collection('requested').doc('a').set({
        status: false,
    })

    await db.collection('follow').doc(uid).collection('requesting').doc('a').set({
        status: false,
    })

    await db.collection('follow').doc(uid).set({
        following: 0,
        followers: 0,
        requested: 0,
        requesting: 0,
    })
    
    await db.collection('users').doc(uid).set({
        username: username,
        name: name,
        enabled: true,
        type: 'public',
        emailchange: admin.firestore.FieldValue.serverTimestamp(),
        passchange: admin.firestore.FieldValue.serverTimestamp(),
        created: admin.firestore.FieldValue.serverTimestamp(),
        url: 'https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/logos%2F' + uid + '.png?alt=media',
    }, {merge: true})
    
    // Upload Profile Photo

    return request("https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/app%2Fdefault.png?alt=media").pipe(fs.createWriteStream(path.join(tmpdir,'default.png'))).on('close', async () => {
        const bucket = admin.storage().bucket();
        
        await bucket.upload(path.join(tmpdir,'default.png'), {
            destination: `logos/${uid}.png`,
        });

        fs.unlink(path.join(tmpdir,'default.png'), () => {
            return {data: true};
        })
    });
        
});

exports.requestSong = functions.https.onCall(async (data, context) => {

    // Check the storage for the song

    var db = admin.firestore()
    doc = await db.collection('music').doc(data.trackID).get()

    if (doc.exists && doc.data().downloaded) {
        return `https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/music%2F${data.trackID}.mp3?alt=media`
    }

    // console.log(tmpdir + '/');
    
    const { stdout, stderr } = await exec('npm run dl ' + data.trackURL);
    localPath = stderr.split('Saving Song to: ').pop().split('\n✔ Song:').shift()

    var bucket = admin.storage().bucket();
    await bucket.upload(localPath, { destination: `music/${data.trackID}.mp3` })

    await unlinkAsync(localPath) 
    
    var db = admin.firestore()
    await db.collection('music').doc(data.trackID).set({
        downloaded: true
    })

    return `https://firebasestorage.googleapis.com/v0/b/eonsound.appspot.com/o/music%2F${data.trackID}.mp3?alt=media`

})