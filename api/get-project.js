const { kv } = require('@vercel/kv');

export default async function handler(req, res) {
  const { subdomain } = req.query;
  
  if (!subdomain || subdomain === '') {
    return res.status(200).sendFile('index.html', { root: './' });
  }

  const parts = subdomain.split('.');
  const webName = parts[0];
  const projectName = parts[1] || 'default';
  const key = `project:${webName}:${projectName}`;

  try {
    const project = await kv.get(key);
    if (!project) {
      return res.status(404).send(`
        <html><body style="background:#000;color:#fff;font-family:system-ui;text-align:center;padding-top:100px">
          <h1 style="color:#39FF14">❌ Proyek Tidak Ditemukan</h1>
          <p>Alamat: ${subdomain}.arpihost.vercel.app</p>
          <a href="https://arpihost.vercel.app" style="color:#9D00FF">← Kembali ke Arpi Host</a>
        </body></html>
      `);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(project.html);
  } catch (err) {
    return res.status(500).send('<h1>Error</h1>');
  }
}
