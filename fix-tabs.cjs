const fs = require('fs');
const file = 'src/routes/admin.index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize line endings to avoid matching issues
content = content.replace(/\r\n/g, '\n');

content = content.replace(
  '  products: {\n    label: "All Products",',
  '  products: {\n    label: "สินค้าทั้งหมด (All Products)",'
);
content = content.replace(
  '  articles: {\n    label: "Articles",',
  '  articles: {\n    label: "บทความ (Articles)",'
);
content = content.replace(
  '  articleCategories: {\n    label: "Article Categories",',
  '  articleCategories: {\n    label: "หมวดหมู่บทความ (Article Categories)",'
);
content = content.replace(
  '  brands: {\n    label: "Brands",',
  '  brands: {\n    label: "แบรนด์ (Brands)",'
);
content = content.replace(
  '  solutions: {\n    label: "Solutions",',
  '  solutions: {\n    label: "โซลูชัน (Solutions)",'
);
content = content.replace(
  '  industries: {\n    label: "Industries",',
  '  industries: {\n    label: "ผลงาน (Industries)",'
);
content = content.replace(
  '  contactSubmissions: {\n    label: "Contact Submissions",',
  '  contactSubmissions: {\n    label: "แบบฟอร์มติดต่อ (Contact Submissions)",'
);

content = content.replace(
  '<TabsTrigger value="contactPageSettings">\n              <Mail className="mr-2 h-4 w-4" />\n              Contact Us\n            </TabsTrigger>',
  '<TabsTrigger value="contactPageSettings">\n              <Mail className="mr-2 h-4 w-4" />\n              หน้าติดต่อ (Contact Us)\n            </TabsTrigger>'
);
content = content.replace(
  '<TabsTrigger value="footerSettings">\n              <Globe className="mr-2 h-4 w-4" />\n              Footer\n            </TabsTrigger>',
  '<TabsTrigger value="footerSettings">\n              <Globe className="mr-2 h-4 w-4" />\n              ฟุตเตอร์ (Footer)\n            </TabsTrigger>'
);
content = content.replace(
  '<TabsTrigger value="lineSettings">\n              <Settings className="mr-2 h-4 w-4" />\n              LINE Settings\n            </TabsTrigger>',
  '<TabsTrigger value="lineSettings">\n              <Settings className="mr-2 h-4 w-4" />\n              ตั้งค่า LINE (LINE Settings)\n            </TabsTrigger>'
);
content = content.replace(
  '<TabsTrigger value="trackingSettings">\n              <Code2 className="mr-2 h-4 w-4" />\n              Tracking Settings\n            </TabsTrigger>',
  '<TabsTrigger value="trackingSettings">\n              <Code2 className="mr-2 h-4 w-4" />\n              ตั้งค่า Tracking (Tracking Settings)\n            </TabsTrigger>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
