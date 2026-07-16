export default async function handler(req, res) {
  // تفعيل هيدرات حماية CORS لجميع الأجهزة والطلبات
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // استخراج المسار من معلمات الاستعلام
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  // إعادة بناء معلمات الاستعلام الأخرى مع استبعاد معلمة 'path'
  const urlObj = new URL(req.url, 'https://localhost');
  urlObj.searchParams.delete('path');
  const queryString = urlObj.search;

  // توجيه الطلب إلى خوادم جوجل بالمسار الصحيح
  const targetUrl = `https://generativelanguage.googleapis.com/${path}${queryString}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : null
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
