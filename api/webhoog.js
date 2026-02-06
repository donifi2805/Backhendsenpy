// api/webhook.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Konfigurasi Firebase (Saya ambil dari file index.html Anda)
const firebaseConfig = {
  apiKey: "AIzaSyC9-fXqAQKkcbrCppYiQXz8dkjdeO_cM-Q",
  authDomain: "senpayment-218ab.firebaseapp.com",
  projectId: "senpayment-218ab",
  storageBucket: "senpayment-218ab.firebasestorage.app",
  messagingSenderId: "296453762898",
  appId: "1:296453762898:web:2b37150f5ed7fbf24c948b"
};

// Inisialisasi Firebase (Backend Mode)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Hanya terima metode POST (Dari Telegram)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body;

  try {
    // Cek apakah ini pesan balasan (Reply) di Telegram
    if (body.message && body.message.reply_to_message) {
      
      const adminName = body.message.from.first_name || "Admin";
      const replyText = body.message.text; // Pesan balasan Admin
      
      // Opsional: Jika ingin mengambil RefID dari pesan asli yang di-reply
      // const originalText = body.message.reply_to_message.text; 
      
      // Simpan Balasan ke Firestore (chat_public)
      await addDoc(collection(db, "chat_public"), {
        nama: "Admin " + adminName, // Nama pengirim di web jadi "Admin Doni" misalnya
        pesan: replyText,
        role: "admin", // PENTING: Agar bubble berwarna kuning/beda
        uid: "ADMIN_TELEGRAM",
        timestamp: serverTimestamp()
      });

      return res.status(200).send('Berhasil: Balasan disimpan ke Database');
    }

    // Jika bukan reply (misal chat biasa di grup), abaikan saja agar tidak spam database
    return res.status(200).send('Diabaikan: Bukan pesan balasan');

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send('Error Server: ' + error.message);
  }
}