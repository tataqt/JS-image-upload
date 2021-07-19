import {
    upload
} from "./upload.js"
import firebase from "firebase/app";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDXglHIXNdUQ8jVmCIwZwUwWb5-s_j8ciI",
    authDomain: "contetn-upload.firebaseapp.com",
    projectId: "contetn-upload",
    storageBucket: "contetn-upload.appspot.com",
    messagingSenderId: "337573686447",
    appId: "1:337573686447:web:42a1e55fc4c8830b96b85a"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

upload('#file', {
    multi: true,
    accept: ['.png', '.jpeg', '.jpg', '.gif'],
    onUpload(files, blocks) {
        files.forEach((file, index) => {
            const ref = storage.ref(`images/${file.name}`);
            const task = ref.put(file);

            task.on('state_changed', snapshot => {
                    const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed() + '%';
                    const block = blocks[index].querySelector('.preview-info-progress');

                    block.textContent = percentage;
                    block.style.width = `${percentage}`;
                },
                error => console.log(error),
                () => task.snapshot.ref.getDownloadURL()
                .then(url => console.log('Download URL', url))
            )
        })
    }
})