alter table public.content_industries
add column if not exists show_on_brands boolean not null default true,
add column if not exists sort_order integer not null default 0,
add column if not exists card_tag_th text,
add column if not exists card_tag_en text,
add column if not exists metric_value text,
add column if not exists metric_label_th text,
add column if not exists metric_label_en text,
add column if not exists link_url text;

update public.content_industries
set
  sort_order = case
    when sort_order is distinct from 0 then sort_order
    when card_tag_th is not null
      or card_tag_en is not null
      or metric_value is not null
      or metric_label_th is not null
      or metric_label_en is not null
      or link_url is not null then sort_order
    else case slug
      when 'education' then 10
      when 'hotel' then 20
      when 'corporate' then 30
      when 'government' then 40
      when 'hospital' then 50
      when 'video-conference' then 60
      else sort_order
    end
  end,
  card_tag_th = coalesce(card_tag_th, case slug
    when 'education' then 'Smart Classroom'
    when 'hotel' then 'Ballroom & MICE'
    when 'corporate' then 'Hybrid Meeting'
    when 'government' then 'Public Sector'
    when 'hospital' then 'Healthcare'
    when 'video-conference' then 'Video Conference'
    else card_tag_th
  end),
  card_tag_en = coalesce(card_tag_en, case slug
    when 'education' then 'Smart Classroom'
    when 'hotel' then 'Ballroom & MICE'
    when 'corporate' then 'Hybrid Meeting'
    when 'government' then 'Public Sector'
    when 'hospital' then 'Healthcare'
    when 'video-conference' then 'Video Conference'
    else card_tag_en
  end),
  metric_value = coalesce(metric_value, case slug
    when 'education' then '120+'
    when 'hotel' then '60+'
    when 'corporate' then '200+'
    when 'government' then '40+'
    when 'hospital' then '25+'
    when 'video-conference' then '300+'
    else metric_value
  end),
  metric_label_th = coalesce(metric_label_th, case slug
    when 'education' then 'ห้องเรียน'
    when 'hotel' then 'โรงแรม'
    when 'corporate' then 'องค์กร'
    when 'government' then 'หน่วยงาน'
    when 'hospital' then 'โรงพยาบาล'
    when 'video-conference' then 'ห้องประชุม'
    else metric_label_th
  end),
  metric_label_en = coalesce(metric_label_en, case slug
    when 'education' then 'Classrooms'
    when 'hotel' then 'Hotels'
    when 'corporate' then 'Enterprises'
    when 'government' then 'Agencies'
    when 'hospital' then 'Hospitals'
    when 'video-conference' then 'Meeting Rooms'
    else metric_label_en
  end)
where slug in ('education', 'hotel', 'corporate', 'government', 'hospital', 'video-conference');
