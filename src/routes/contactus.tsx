import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactForm } from "@/components/site/ContactForm";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import heroContact from "@/assets/hero-contactus.jpg";
import headOfficeWarehouseCard from "@/assets/contact/head-office-warehouse-card.png";
import { Reveal, RevealStagger } from "@/components/site/Reveal";
import {
  fallbackContactPage,
  loadSiteContent,
  type SiteContactPage,
  type SiteCompanyProfile,
} from "@/lib/content/site";
import { absoluteUrl, buildSeoHead } from "@/lib/seo";
import {
  buildLocalBusinessJsonLd,
  companyAddress,
  companyMapEmbedUrl,
  companyPhoneDisplay,
  companyPhoneHref,
  fallbackCompanyProfile,
} from "@/lib/company-profile";

type ContactLoaderData = {
  contactPage: SiteContactPage;
  companyProfile: SiteCompanyProfile;
};

export const Route = createFileRoute("/contactus")({
  loader: async () => {
    const content = await loadSiteContent();
    return { contactPage: content.contactPage, companyProfile: content.companyProfile };
  },
  head: (ctx: { loaderData?: ContactLoaderData }) => {
    const contact = ctx.loaderData?.contactPage ?? fallbackContactPage;
    const company = ctx.loaderData?.companyProfile ?? fallbackCompanyProfile;
    const seo = buildSeoHead({
      title: contact.metaTitleTh,
      description: contact.metaDescriptionTh,
      path: "/contactus",
      image: heroContact,
    });
    return {
      ...seo,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(buildLocalBusinessJsonLd(company, absoluteUrl(heroContact))),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useLanguage();
  const { contactPage: initialContact, companyProfile: initialCompany } =
    Route.useLoaderData() as ContactLoaderData;
  const contact = initialContact ?? fallbackContactPage;
  const company = initialCompany ?? fallbackCompanyProfile;
  const local = (th: string, en: string) => t(lang, th, en);
  const address = companyAddress(company, lang);
  const phone = companyPhoneDisplay(company);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={local(contact.heroTitleTh, contact.heroTitleEn)}
        desc={local(contact.heroDescriptionTh, contact.heroDescriptionEn)}
        breadcrumbs={[{ label: t(lang, "ติดต่อเรา", "Contact Us") }]}
        bgImage={heroContact}
        variant="light"
      />
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16">
          <div className="space-y-8">
            <Reveal delay={100}>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                  {local(contact.sectionTitleTh, contact.sectionTitleEn)}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {local(contact.sectionDescriptionTh, contact.sectionDescriptionEn)}
                </p>
              </div>
            </Reveal>

            <RevealStagger step={100} className="space-y-4">
              {[
                {
                  Icon: MapPin,
                  label: t(lang, "ที่อยู่", "Address"),
                  d: address,
                },
                {
                  Icon: Phone,
                  label: t(lang, "โทรศัพท์", "Phone"),
                  d: phone,
                },
                {
                  Icon: Mail,
                  label: t(lang, "อีเมล", "Email"),
                  d: company.publicEmail,
                },
                { Icon: MessageCircle, label: "Line OA", d: company.lineId },
              ].map(({ Icon, label, d }) => (
                <div
                  key={label}
                  className="group flex items-center gap-5 rounded-[1.5rem] border border-border/60 bg-card p-5 shadow-sm hover:shadow-elev transition-all duration-300 hover:-translate-y-1 cursor-default"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-muted-foreground mb-1">{label}</div>
                    <div className="text-base font-semibold text-primary leading-snug">{d}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </RevealStagger>
          </div>
          <Reveal delay={300} variant="slide">
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Map / Find Us */}
      <section className="relative bg-gradient-subtle py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-10">
            <div className="inline-block rounded-full bg-accent/10 text-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-4">
              Find Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              {local(contact.mapTitleTh, contact.mapTitleEn)}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {local(contact.mapDescriptionTh, contact.mapDescriptionEn)}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 items-stretch">
            {/* Info panel */}
            <div className="relative overflow-hidden rounded-[28px] bg-black shadow-[0_28px_70px_-34px_rgba(0,0,0,0.75)] ring-1 ring-[#f5c542]/45">
              <img
                src={headOfficeWarehouseCard}
                alt={t(
                  lang,
                  "ข้อมูล Head Office & Warehouse ของ Matrix Intertrade Co., Ltd. พร้อมที่อยู่ เวลาทำการ เบอร์โทร และที่จอดรถ",
                  "Head Office and Warehouse information for Matrix Intertrade Co., Ltd. with address, business hours, phone, and parking details",
                )}
                loading="lazy"
                decoding="async"
                width={1122}
                height={1401}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="block h-auto w-full select-none object-contain"
              />
              <div className="sr-only">
                <h3>Matrix Intertrade Co., Ltd.</h3>
                <p>
                  {address}
                </p>
                <p>{local(company.businessHoursTh, company.businessHoursEn)}</p>
                <p>{phone}</p>
                <p>{local(contact.parkingTh, contact.parkingEn)}</p>
              </div>
              <a
                href={company.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(lang, "นำทาง Google Maps", "Google Maps Directions")}
                className="absolute bottom-[6.2%] left-[5.8%] h-[8.5%] w-[44.8%] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5c542]"
              />
              <a
                href={companyPhoneHref(company.officePhone)}
                aria-label={t(lang, "โทรสอบถาม 02-129-6193", "Call 02-129-6193")}
                className="absolute bottom-[6.2%] right-[5.8%] h-[8.5%] w-[40.5%] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff3333]"
              />
            </div>

            {/* Map */}
            <div className="relative rounded-3xl overflow-hidden shadow-elev ring-1 ring-border bg-card min-h-[420px] lg:min-h-[520px] group">
              <iframe
                title="Matrix Intertrade Location Map"
                src={companyMapEmbedUrl(company)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5 rounded-3xl" />
              <div className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-card ring-1 ring-border">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                Matrix Intertrade HQ
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
