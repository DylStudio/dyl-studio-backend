// api/discord-callback.js
// Endpoint ini dipanggil Discord setelah user klik "Authorize".
// Tugasnya: tukar "code" jadi access_token, ambil data user, lalu
// redirect balik ke frontend (GitHub Pages) sambil membawa data user.

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing "code" parameter dari Discord.');
  }

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI; // harus SAMA PERSIS dengan yang didaftarkan di Discord Developer Portal
  const FRONTEND_URL = process.env.FRONTEND_URL; // contoh: https://dylstudio.github.io/AudioConverterRoblox/

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !FRONTEND_URL) {
    return res.status(500).send('Server belum dikonfigurasi. Cek Environment Variables di Vercel.');
  }

  try {
    // 1. Tukar "code" menjadi access_token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Token exchange gagal:', errText);
      return res.status(500).send('Gagal menukar code menjadi token.');
    }

    const tokenData = await tokenRes.json();

    // 2. Ambil data profil user dari Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return res.status(500).send('Gagal mengambil data user dari Discord.');
    }

    const user = await userRes.json();

    // 3. Kirim data user penting saja balik ke frontend lewat URL parameter
    //    (username, id, avatar) - JANGAN pernah kirim access_token ke frontend.
    const payload = Buffer.from(
      JSON.stringify({
        id: user.id,
        username: user.username,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : null,
      })
    ).toString('base64');

    res.writeHead(302, {
      Location: `${FRONTEND_URL}?discord=${encodeURIComponent(payload)}`,
    });
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan di server.');
  }
}
