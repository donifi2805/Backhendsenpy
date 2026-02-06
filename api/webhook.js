import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- KONFIGURASI FIREBASE ---
// (Pastikan config ini SAMA PERSIS dengan yang ada di index.html Anda)
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
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body;

  try {
    // Cek apakah ini pesan balasan (Reply) di Telegram
    if (body.message && body.message.reply_to_message) {
      
      // 1. SET NAMA ADMIN SESUAI REQUEST ("ADMIN BT")
      const adminName = "ADMIN BT"; 
      
      const replyText = body.message.text; // Jawaban Admin
      const originalText = body.message.reply_to_message.text || ""; // Teks notifikasi yang dibalas

      // 2. LOGIKA EKSTRAKSI "REPLY TO"
      // Kita harus mengambil "Nama User" dan "Isi Pesan User" dari teks notifikasi bot.
      // Format Notifikasi Bot Anda: "👤 Nama: Agil\n... 💬 Pesan:\nHalo min..."
      
      let replyContext = null;

      // Cari Nama User (Regex mencari teks setelah "Nama: " sampai baris baru)
      const matchNama = originalText.match(/Nama:\s*(.*)/);
      
      // Cari Isi Pesan User (Mengambil semua teks setelah "💬 Pesan:")
      // Kita split karena pesan user ada di paling bawah
      const splitMsg = originalText.split("💬 Pesan:");
      
      if (matchNama && splitMsg.length > 1) {
        // Bersihkan teks dari sisa-sisa format
        const userMsg = splitMsg[1].trim(); 
        const userName = matchNama[1].trim();

        replyContext = {
            name: userName, // Nama User yang muncul di Quote
            text: userMsg   // Isi Pesan User yang muncul di Quote
        };
      } else {
        // Fallback jika Admin mereply pesan manual (bukan notifikasi bot)
        replyContext = {
            name: "User",
            text: "Pesan Pengguna"
        };
      }

      // 3. SIMPAN KE FIRESTORE DENGAN DATA REPLY
      await addDoc(collection(db, "chat_public"), {
        nama: adminName,
        pesan: replyText,
        role: "admin", // Agar bubble warna kuning
        uid: "ADMIN_TELEGRAM",
        timestamp: serverTimestamp(),
        reply_to: replyContext // <--- INI KUNCINYA AGAR MUNCUL KUTIPAN DI WEB
      });

      return res.status(200).send('OK: Balasan Admin BT Disimpan');
    }

    return res.status(200).send('OK: Diabaikan');

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send('Error: ' + error.message);
  }
}