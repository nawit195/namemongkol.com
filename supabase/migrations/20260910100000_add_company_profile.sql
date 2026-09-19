insert into public.content_site_sections (section_key, payload)
values (
  'company_profile',
  jsonb_build_object(
    'shortName', 'Matrix Intertrade',
    'legalNameTh', 'บริษัท แมทริกซ์ อินเตอร์เทรด จำกัด',
    'legalNameEn', 'Matrix Intertrade Co., Ltd.',
    'descriptionTh', 'ผู้เชี่ยวชาญด้านระบบภาพและเสียงสำหรับองค์กร ให้บริการออกแบบ ติดตั้ง และดูแลระบบทั่วประเทศไทย',
    'descriptionEn', 'AV solutions specialist providing system design, installation, and support for organizations across Thailand.',
    'streetAddressTh', '111/51 หมู่ที่ 8',
    'streetAddressEn', '111/51 Moo 8',
    'subdistrictTh', 'ตำบลบางกร่าง',
    'subdistrictEn', 'Bang Krang',
    'districtTh', 'อำเภอเมืองนนทบุรี',
    'districtEn', 'Mueang Nonthaburi',
    'provinceTh', 'จังหวัดนนทบุรี',
    'provinceEn', 'Nonthaburi',
    'postalCode', '11000',
    'countryCode', 'TH',
    'countryTh', 'ประเทศไทย',
    'countryEn', 'Thailand',
    'officePhone', '021296193',
    'mobilePhone', '0948887041',
    'publicEmail', 'info@matrixintertrade.co.th',
    'websiteUrl', 'https://www.matrixintertrade.com/',
    'lineId', '@MatrixIntertrade',
    'facebookUrl', 'https://www.facebook.com/MatrixIntertrade',
    'youtubeUrl', 'https://www.youtube.com/@matrixintertrade',
    'tiktokUrl', 'https://www.tiktok.com/@matrixintertrade',
    'linkedinUrl', '',
    'latitude', '13.843674',
    'longitude', '100.4537487',
    'directionsUrl', 'https://www.google.com/maps/dir/?api=1&destination=13.843674,100.4537487',
    'businessHoursTh', 'เวลาทำการ จันทร์-ศุกร์ 08:30-17:30 น.',
    'businessHoursEn', 'Business hours Monday-Friday 08:30-17:30',
    'businessHoursOpens', '08:30',
    'businessHoursCloses', '17:30',
    'logoUrl', 'https://www.matrixintertrade.com/web-app-manifest-512x512.png'
  )
)
on conflict (section_key) do nothing;

-- Keep legacy payloads correct for rollback compatibility. Public rendering now reads
-- company_profile instead of these duplicated values.
update public.content_site_sections
set
  payload = payload || jsonb_build_object(
    'addressTh', 'บริษัท แมทริกซ์ อินเตอร์เทรด จำกัด 111/51 หมู่ที่ 8 ตำบลบางกร่าง อำเภอเมืองนนทบุรี จังหวัดนนทบุรี 11000 ประเทศไทย',
    'addressEn', 'Matrix Intertrade Co., Ltd., 111/51 Moo 8, Bang Krang, Mueang Nonthaburi, Nonthaburi 11000, Thailand',
    'phone', '02-129-6193 / 094-888-7041',
    'email', 'info@matrixintertrade.co.th',
    'line', '@MatrixIntertrade',
    'mapEmbedUrl', 'https://www.google.com/maps?q=13.843674%2C100.4537487&z=17&output=embed',
    'directionsUrl', 'https://www.google.com/maps/dir/?api=1&destination=13.843674,100.4537487',
    'phoneHref', 'tel:+6621296193',
    'businessHoursTh', 'เวลาทำการ จันทร์-ศุกร์ 08:30-17:30 น.',
    'businessHoursEn', 'Business hours Monday-Friday 08:30-17:30'
  ),
  updated_at = now()
where section_key = 'contact_page';

update public.content_site_sections
set
  payload = payload || jsonb_build_object(
    'addressTh', '111/51 หมู่ที่ 8 ตำบลบางกร่าง อำเภอเมืองนนทบุรี จังหวัดนนทบุรี 11000 ประเทศไทย',
    'addressEn', '111/51 Moo 8, Bang Krang, Mueang Nonthaburi, Nonthaburi 11000, Thailand',
    'phone', '02-129-6193 / 094-888-7041',
    'email', 'info@matrixintertrade.co.th',
    'line', '@MatrixIntertrade',
    'facebookUrl', 'https://www.facebook.com/MatrixIntertrade',
    'youtubeUrl', 'https://www.youtube.com/@matrixintertrade',
    'tiktokUrl', 'https://www.tiktok.com/@matrixintertrade'
  ),
  updated_at = now()
where section_key = 'footer_settings';

update public.content_about_us
set
  address_th = '111/51 หมู่ที่ 8 ตำบลบางกร่าง อำเภอเมืองนนทบุรี จังหวัดนนทบุรี 11000 ประเทศไทย',
  address_en = '111/51 Moo 8, Bang Krang, Mueang Nonthaburi, Nonthaburi 11000, Thailand',
  phone = '02-129-6193 / 094-888-7041',
  email = 'info@matrixintertrade.co.th',
  updated_at = now()
where id = 'about_us';
