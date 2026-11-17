"""Read built HTML without executing client JavaScript. No network or writes."""
import json
from html.parser import HTMLParser
from pathlib import Path

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.h1 = 0
        self.title = ''
        self.in_title = False
        self.in_script = False
        self.json_script = False
        self.buffer = ''
        self.canonical = None
        self.schemas = []
        self.text = ''
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.in_title = True
        if tag == 'script':
            self.in_script = True
            self.json_script = attrs.get('type') == 'application/ld+json'
            self.buffer = ''
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical = attrs['href']
        if tag == 'meta' and attrs.get('name') == 'robots':
            assert 'noindex' not in attrs.get('content', ''), 'Public page is noindex'

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script':
            if self.json_script: self.schemas.append(json.loads(self.buffer))
            self.in_script = self.json_script = False

    def handle_data(self, data):
        if self.in_script:
            if self.json_script: self.buffer += data
        else:
            self.text += data
            if self.in_title: self.title += data

results = []
for route in ['', 'about', 'methodology', 'premium-search', 'premium-analysis']:
    page = Page((Path('.next/server/app') / f'{route or "index"}.html').read_text(encoding='utf-8'))
    assert page.h1 == 1, (route, 'H1', page.h1)
    assert page.title.count('NameMongkol') == 1, (route, 'Duplicate brand title')
    assert page.canonical == 'https://www.namemongkol.com' + (f'/{route}' if route else ''), (route, page.canonical)
    assert all(name in page.text for name in ['เลขศาสตร์', 'ทักษาปกรณ์', 'อายตนะ 6', 'นิรันดร์ศาสตร์']), route
    assert 'คัดกรองล่วงหน้าโดยทีมงาน' in page.text, route
    assert 'คัดกรอง 3 ชั้น' not in page.text, route
    faq_count = 0
    for schema in page.schemas:
        if schema.get('@type') == 'FAQPage':
            for question in schema['mainEntity']:
                assert question['name'] in page.text, (route, question['name'])
                assert question['acceptedAnswer']['text'] in page.text, (route, 'FAQ/schema mismatch')
                faq_count += 1
    if route in ['methodology', 'premium-search', 'premium-analysis']: assert faq_count == 5, (route, faq_count)
    results.append({'route': '/' + route, 'h1': page.h1, 'canonical': page.canonical, 'fourSciences': True, 'faqQuestions': faq_count})
print(json.dumps({'verified': True, 'pages': results}, ensure_ascii=False))
