import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCbsqI7AkZi-4ubocIdnqev_1Yrk6-xW0E',
  authDomain: 'scorekeeping-app-e84cd.firebaseapp.com',
  projectId: 'scorekeeping-app-e84cd',
  storageBucket: 'scorekeeping-app-e84cd.firebasestorage.app',
  messagingSenderId: '758726613522',
  appId: '1:758726613522:web:5aaf19adaaed613f6196cb'
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app, 'https://scorekeeping-app-e84cd-default-rtdb.europe-west1.firebasedatabase.app')
