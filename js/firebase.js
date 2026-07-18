import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCT8czwIdv9CCEcPwAw5FEiH6gO96agnIs",
    authDomain: "el-baul-de-la-moda.firebaseapp.com",
    projectId: "el-baul-de-la-moda",
    storageBucket: "el-baul-de-la-moda.firebasestorage.app",
    messagingSenderId: "530711505847",
    appId: "1:530711505847:web:891fa83b37e1af182e9632"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };