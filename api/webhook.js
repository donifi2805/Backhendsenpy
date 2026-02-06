import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- KONFIGURASI TELEGRAM BOT ---
// Token Bot Anda (Sesuai riwayat chat sebelumnya)
const BOT_TOKEN = "8490021696:AAGv-lgFCmKCg5x0Tr6xnqS3pQEEENAEZNA";

// --- KONFIGURASI FIREBASE ---
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
      
      const adminName = "ADMIN BT"; 
      const replyText = body.message.text;
      const originalText = body.message.reply_to_message.text || "";
      const chatId = body.message.chat.id; // ID Chat Admin untuk kirim konfirmasi

      // LOGIKA PARSING REPLY (SAMA SEPERTI SEBELUMNYA)
      let replyContext = null;
      const matchNama = originalText.match(/Nama:\s*(.*)/);
      const splitMsg = originalText.split("💬 Pesan:");
      
      if (matchNama && splitMsg.length > 1) {
        replyContext = {
            name: matchNama[1].trim(),
            text: splitMsg[1].trim()
        };
      } else {
        replyContext = { name: "User", text: "Pesan Pengguna" };
      }

      // 1. SIMPAN KE FIRESTORE
      await addDoc(collection(db, "chat_public"), {
        nama: adminName,
        pesan: replyText,
        role: "admin",
        uid: "ADMIN_TELEGRAM",
        timestamp: serverTimestamp(),
        reply_to: replyContext
      });

      // 2. KIRIM KONFIRMASI BALIK KE TELEGRAM (FITUR BARU)
      try {
          const telegramMsg = "▶️Pesan Terkirim◀️";
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  chat_id: chatId,
                  text: telegramMsg,
                  reply_to_message_id: body.message.message_id // Mereply pesan "Oke siap" dari admin
              })
          });
      } catch (tgError) {
          console.error("Gagal kirim notif balik ke Telegram:", tgError);
          // Kita tidak throw error disini agar status tetap 200 (karena save database sukses)
      }

      return res.status(200).send('OK: Terkirim');
    }

    return res.status(200).send('OK: Diabaikan');

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send('Error: ' + error.message);
  }
}