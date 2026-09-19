import { z } from "zod";

const optionalUrl = z.union([z.string().url(), z.literal("")]);

export const CompanyProfilePayloadSchema = z.object({
  shortName: z.string().trim().min(1),
  legalNameTh: z.string().trim().min(1),
  legalNameEn: z.string().trim().min(1),
  descriptionTh: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  streetAddressTh: z.string().trim().min(1),
  streetAddressEn: z.string().trim().min(1),
  subdistrictTh: z.string().trim().min(1),
  subdistrictEn: z.string().trim().min(1),
  districtTh: z.string().trim().min(1),
  districtEn: z.string().trim().min(1),
  provinceTh: z.string().trim().min(1),
  provinceEn: z.string().trim().min(1),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must contain 5 digits."),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  countryTh: z.string().trim().min(1),
  countryEn: z.string().trim().min(1),
  officePhone: z.string().regex(/^\d{9,10}$/, "Office phone must contain 9-10 digits."),
  mobilePhone: z.string().regex(/^\d{9,10}$/, "Mobile phone must contain 9-10 digits."),
  publicEmail: z.string().trim().email(),
  websiteUrl: z.string().url(),
  lineId: z.string().trim().min(1),
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  latitude: z.string().refine(
    (value) => {
      const number = Number(value);
      return Number.isFinite(number) && number >= -90 && number <= 90;
    },
    "Latitude must be between -90 and 90.",
  ),
  longitude: z.string().refine(
    (value) => {
      const number = Number(value);
      return Number.isFinite(number) && number >= -180 && number <= 180;
    },
    "Longitude must be between -180 and 180.",
  ),
  directionsUrl: z.string().url(),
  businessHoursTh: z.string().trim().min(1),
  businessHoursEn: z.string().trim().min(1),
  businessHoursOpens: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Opening time must use HH:mm."),
  businessHoursCloses: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Closing time must use HH:mm."),
  logoUrl: z.string().url(),
});

export type SiteCompanyProfile = z.infer<typeof CompanyProfilePayloadSchema>;

export const fallbackCompanyProfile: SiteCompanyProfile = {
  shortName: "Matrix Intertrade",
  legalNameTh: "บริษัท แมทริกซ์ อินเตอร์เทรด จำกัด",
  legalNameEn: "Matrix Intertrade Co., Ltd.",
  descriptionTh:
    "ผู้เชี่ยวชาญด้านระบบภาพและเสียงสำหรับองค์กร ให้บริการออกแบบ ติดตั้ง และดูแลระบบทั่วประเทศไทย",
  descriptionEn:
    "AV solutions specialist providing system design, installation, and support for organizations across Thailand.",
  streetAddressTh: "111/51 หมู่ที่ 8",
  streetAddressEn: "111/51 Moo 8",
  subdistrictTh: "ตำบลบางกร่าง",
  subdistrictEn: "Bang Krang",
  districtTh: "อำเภอเมืองนนทบุรี",
  districtEn: "Mueang Nonthaburi",
  provinceTh: "จังหวัดนนทบุรี",
  provinceEn: "Nonthaburi",
  postalCode: "11000",
  countryCode: "TH",
  countryTh: "ประเทศไทย",
  countryEn: "Thailand",
  officePhone: "021296193",
  mobilePhone: "0948887041",
  publicEmail: "info@matrixintertrade.co.th",
  websiteUrl: "https://www.matrixintertrade.com/",
  lineId: "@MatrixIntertrade",
  facebookUrl: "https://www.facebook.com/MatrixIntertrade",
  youtubeUrl: "https://www.youtube.com/@matrixintertrade",
  tiktokUrl: "https://www.tiktok.com/@matrixintertrade",
  linkedinUrl: "",
  latitude: "13.843674",
  longitude: "100.4537487",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=13.843674,100.4537487",
  businessHoursTh: "เวลาทำการ จันทร์-ศุกร์ 08:30-17:30 น.",
  businessHoursEn: "Business hours Monday-Friday 08:30-17:30",
  businessHoursOpens: "08:30",
  businessHoursCloses: "17:30",
  logoUrl: "https://www.matrixintertrade.com/web-app-manifest-512x512.png",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseCompanyProfile(value: unknown): SiteCompanyProfile {
  const source = isRecord(value) ? value : {};
  const merged = Object.fromEntries(
    Object.entries(fallbackCompanyProfile).map(([key, fallback]) => {
      const candidate = source[key];
      return [key, typeof candidate === "string" ? candidate.trim() : fallback];
    }),
  );
  const parsed = CompanyProfilePayloadSchema.safeParse(merged);
  return parsed.success ? parsed.data : fallbackCompanyProfile;
}

export function formatThaiPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("02")) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function toE164Thai(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `+66-${formatThaiPhone(digits).slice(1)}`;
  }
  return `+${digits}`;
}

export function companyPhoneDisplay(profile: SiteCompanyProfile) {
  return [profile.officePhone, profile.mobilePhone].filter(Boolean).map(formatThaiPhone).join(" / ");
}

export function companyPhoneHref(phone: string) {
  return `tel:${toE164Thai(phone).replace(/-/g, "")}`;
}

export function companyAddress(profile: SiteCompanyProfile, language: "TH" | "EN" = "TH") {
  if (language === "EN") {
    return [
      profile.streetAddressEn,
      profile.subdistrictEn,
      profile.districtEn,
      profile.provinceEn,
      profile.postalCode,
      profile.countryEn,
    ]
      .filter(Boolean)
      .join(", ");
  }
  return [
    profile.streetAddressTh,
    profile.subdistrictTh,
    profile.districtTh,
    profile.provinceTh,
    profile.postalCode,
    profile.countryTh,
  ]
    .filter(Boolean)
    .join(" ");
}

export function companyMapEmbedUrl(profile: SiteCompanyProfile) {
  const params = new URLSearchParams({
    q: `${profile.latitude},${profile.longitude}`,
    z: "17",
    output: "embed",
  });
  return `https://www.google.com/maps?${params.toString()}`;
}

function postalAddress(profile: SiteCompanyProfile) {
  return {
    "@type": "PostalAddress",
    streetAddress: `${profile.streetAddressTh} ${profile.subdistrictTh}`,
    addressLocality: profile.districtTh,
    addressRegion: profile.provinceTh.replace(/^จังหวัด/, ""),
    postalCode: profile.postalCode,
    addressCountry: profile.countryCode,
  };
}

function contactPoints(profile: SiteCompanyProfile) {
  return [profile.officePhone, profile.mobilePhone].filter(Boolean).map((phone) => ({
    "@type": "ContactPoint",
    telephone: toE164Thai(phone),
    email: profile.publicEmail,
    contactType: "sales",
    areaServed: "TH",
    availableLanguage: ["Thai", "English"],
  }));
}

function sameAs(profile: SiteCompanyProfile) {
  return [profile.facebookUrl, profile.youtubeUrl, profile.tiktokUrl, profile.linkedinUrl].filter(
    Boolean,
  );
}

export const COMPANY_SCHEMA_ID = "https://www.matrixintertrade.com/#organization";

export function buildOrganizationJsonLd(profile: SiteCompanyProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": COMPANY_SCHEMA_ID,
    name: profile.shortName,
    legalName: profile.legalNameEn,
    description: profile.descriptionTh,
    url: profile.websiteUrl,
    logo: profile.logoUrl,
    telephone: toE164Thai(profile.officePhone),
    email: profile.publicEmail,
    address: postalAddress(profile),
    contactPoint: contactPoints(profile),
    sameAs: sameAs(profile),
  };
}

export function buildLocalBusinessJsonLd(profile: SiteCompanyProfile, image: string) {
  return {
    ...buildOrganizationJsonLd(profile),
    "@type": "LocalBusiness",
    image,
    url: `${profile.websiteUrl.replace(/\/$/, "")}/contactus`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(profile.latitude),
      longitude: Number(profile.longitude),
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: profile.businessHoursOpens,
        closes: profile.businessHoursCloses,
      },
    ],
  };
}
