// api/webhook.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- KONFIGURASI FIREBASE (SAMA PERSIS DENGAN INDEX.HTML) ---
const firebaseConfig = {
  apiKey: "AIzaSyC9-fXqAQKkcbrCppYiQXz8dkjdeO_cM-Q",
  authDomain: "senpayment-218ab.firebaseapp.com",
  projectId: "senpayment-218ab",
  storageBucket: "senpayment-218ab.firebasestorage.app",
  messagingSenderId: "296453762898",
  appId: "1:296453762898:web:2b37150f5ed7fbf24c948b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Hanya terima metode POST dari Telegram
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body;

  try {
    // Cek apakah ini pesan balasan (Reply) di Telegram
    if (body.message && body.message.reply_to_message) {
      
      const adminName = body.message.from.first_name || "Admin";
      const replyText = body.message.text; // Isi pesan balasan Anda
      
      // Simpan Balasan ke Firestore 'chat_public' agar muncul di Web
      await addDoc(collection(db, "chat_public"), {
        nama: "Admin " + adminName, 
        pesan: replyText,
        role: "admin", // Kunci agar bubble berwarna Admin (Kuning)
        uid: "ADMIN_TELEGRAM",
        timestamp: serverTimestamp()
      });

      return res.status(200).send('OK: Balasan disimpan');
    }

    return res.status(200).send('OK: Bukan balasan');

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send('Internal Server Error');
  }
}