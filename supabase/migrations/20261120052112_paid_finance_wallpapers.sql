-- Extend the paid catalog without changing existing horse products or purchase receipts.
ALTER TABLE public.wallpaper_products DROP CONSTRAINT wallpaper_products_id_check;
ALTER TABLE public.wallpaper_products ADD CONSTRAINT wallpaper_products_id_check
    CHECK (id ~ '^(eight-horses|finance)-[a-z-]+$');

-- Originals are verified and uploaded before these products are activated.
INSERT INTO public.wallpaper_products(id, cost, original_path, sha256, bytes, active) VALUES
('finance-golden-tree', 15, 'finance/finance-golden-tree-d0c7342c1aa1a13fe8152d1c7a3c303d1ceb56fe51ba3586d6f074b25b87d25f.png', 'd0c7342c1aa1a13fe8152d1c7a3c303d1ceb56fe51ba3586d6f074b25b87d25f', 2659152, false),
('finance-koi', 15, 'finance/finance-koi-3e4063af6b2c88cf0bd47f90a0d55b53da32caca0628548a44d342c833062277.png', '3e4063af6b2c88cf0bd47f90a0d55b53da32caca0628548a44d342c833062277', 2976024, false),
('finance-emerald-horses', 15, 'finance/finance-emerald-horses-ea982ce9ac874622657c39063910a653bfd57bc02a2b5b9ca83441a560499adc.png', 'ea982ce9ac874622657c39063910a653bfd57bc02a2b5b9ca83441a560499adc', 3137100, false),
('finance-golden-junk', 15, 'finance/finance-golden-junk-eeeccc6023745fbb6d80562cd25ce3fac35853626fffdd9711db489746b54fdb.png', 'eeeccc6023745fbb6d80562cd25ce3fac35853626fffdd9711db489746b54fdb', 3040430, false)
ON CONFLICT (id) DO NOTHING;
