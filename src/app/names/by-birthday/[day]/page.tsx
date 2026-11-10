import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BIRTHDAY_DAY_KEYS, isBirthdayDay } from '@/components/names/BirthdayDayLandingPage';
import { NamesBirthdayPage } from '@/components/names/NamesCategoryPage';
import { namingBirthdayLinks } from '@/data/babyNaming';
import { siteUrl } from '@/lib/seo';
export const dynamicParams = false;
export const revalidate = 600;
export function generateStaticParams(){return BIRTHDAY_DAY_KEYS.map(day=>({day}));}
export async function generateMetadata({params}:{params:Promise<{day:string}>}):Promise<Metadata>{const {day}=await params;if(!isBirthdayDay(day))return {};const label=namingBirthdayLinks.find(([key])=>key===day)![1];return {title:{absolute:`ตั้งชื่อลูกเกิด${label} พร้อมความหมาย | NameMongkol`},description:`เลือกชื่อเกิด${label} พร้อมความหมายที่ตรวจแล้ว ผลรวมชื่อ และตัวเลือกใช้ได้ทุกเพศ ตรวจทักษาด้วยสูตรเดียวกับเครื่องมือวิเคราะห์`,alternates:{canonical:`${siteUrl}/names/by-birthday/${day}`}};}
export default async function Page({params}:{params:Promise<{day:string}>}){const {day}=await params;if(!isBirthdayDay(day))notFound();return <NamesBirthdayPage day={day}/>;}
