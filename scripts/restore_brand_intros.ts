import { createClient } from "@supabase/supabase-js";
import { brandIntrosByCategoryId } from "../src/data/brand-intros";

const supabaseUrl = "https://sefxaafqvjpmjmewsfuw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZnhhYWZxdmpwbWptZXdzZnV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDI2NTkwNiwiZXhwIjoyMDk1ODQxOTA2fQ.UVRMeatqaYoRXpHtliitwi_QMlahhe46gYNLc6IlyfE";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Restoring full Brand Intros to Supabase...");
  const rows = [];
  for (const [categoryId, intro] of Object.entries(brandIntrosByCategoryId)) {
    const payload = {
      tagline: intro.tagline,
      description: intro.description,
      highlights: intro.highlights,
      bestFor: intro.bestFor,
      origin: intro.origin,
      productCategories: intro.productCategories,
      brandSlug: intro.brandSlug,
    };

    rows.push({
      category_id: categoryId,
      brand_slug: intro.brandSlug,
      tagline: intro.tagline,
      description: intro.description,
      highlights: intro.highlights || [],
      best_for: intro.bestFor || [],
      origin: intro.origin || null,
      payload: payload,
    });
  }

  const { data, error } = await supabase
    .from("content_brand_category_intros")
    .upsert(rows, { onConflict: "category_id" });

  if (error) {
    console.error("Error upserting:", error);
  } else {
    console.log("Success! Restored", rows.length, "brand intros.");
  }
}

run();
