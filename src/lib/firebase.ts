// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 👉 ここを自分の firebaseConfig で置き換え
const firebaseConfig = {
  apiKey: "AIzaSyCJPTe1Ar3ud9hU8Gt0We1dlWHxbVm0TKw",
  authDomain: "todo-next-app-6d248.firebaseapp.com",
  projectId: "todo-next-app-6d248",
  storageBucket: "todo-next-app-6d248.firebasestorage.app",
  messagingSenderId: "1095842698614",
  appId: "1:1095842698614:web:f71d09af3c1542090b1657",
  measurementId: "G-667K63G72K"
};

// Next.js の開発モードで二重初期化を防ぐおまじない
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore インスタンスを export
export const db = getFirestore(app);
