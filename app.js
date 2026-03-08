import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Siap');
  const [nomorWA, setNomorWA] = useState('628123456789'); // Default nomor

  const prosesKirimPDF = async () => {
    setStatus('Sedang Memproses PDF...');
    
    // 1. Target elemen yang mau dijadikan PDF
    const element = document.getElementById('area-laporan');
    
    try {
      // 2. Ubah HTML ke Canvas
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      // 3. Susun PDF
      const pdf = new jsPDF();
      pdf.text("LAPORAN BELAJAR GENERATE PDF", 15, 15);
      pdf.addImage(imgData, 'PNG', 10, 25, 180, 100);
      
      // 4. Ubah ke Base64 (Hanya string kodenya)
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      setStatus('Mengirim ke n8n...');

      // 5. Kirim ke n8n (Ganti URL ini setelah buat Webhook di n8n)
      const response = await axios.post('URL_WEBHOOK_N8N_KAMU', {
        nama_file: `Laporan_${Date.now()}.pdf`,
        file_base64: pdfBase64,
        nomor_tujuan: nomorWA
      });

      if (response.status === 200) {
        setStatus('✅ Berhasil Terkirim ke WA!');
      }
    } catch (err) {
      setStatus('❌ Gagal! Pastikan n8n sudah aktif.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h2>🚀 Project Belajar Generate PDF</h2>
      <p>Status: <b>{status}</b></p>
      <hr />

      <div style={{ marginBottom: '20px' }}>
        <label>Nomor WhatsApp (Gunakan 62):</label><br />
        <input 
          type="text" 
          value={nomorWA} 
          onChange={(e) => setNomorWA(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      {/* Area yang akan dicapture jadi PDF */}
      <div id="area-laporan" style={{ padding: '20px', border: '2px solid #333', backgroundColor: '#fff' }}>
        <h3 style={{ color: '#007bff' }}>ISI LAPORAN TESTING</h3>
        <p>Project: <b>Belajar Generate PDF</b></p>
        <p>Tujuan: Kirim ke WAHA via n8n</p>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              <th>Langkah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Frontend React</td><td>Aktif</td></tr>
            <tr><td>Convert Base64</td><td>Ready</td></tr>
          </tbody>
        </table>
      </div>

      <button 
        onClick={prosesKirimPDF}
        style={{ 
          marginTop: '20px', padding: '12px 24px', 
          backgroundColor: '#28a745', color: '#fff', 
          border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' 
        }}
      >
        GENERATE & KIRIM KE WA
      </button>
    </div>
  );
}

export default App;
