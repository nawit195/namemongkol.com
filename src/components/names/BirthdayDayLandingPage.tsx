import type { DayKey } from '@/types';
import { NamesBirthdayPage } from './NamesCategoryPage';
export const BIRTHDAY_DAY_KEYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'wednesday_night',
    'thursday',
    'friday',
    'saturday',
] as const satisfies readonly DayKey[];

export type BirthdayGender = 'boys' | 'girls';

const dayLabels: Record<DayKey, string> = {
    sunday: 'วันอาทิตย์',
    monday: 'วันจันทร์',
    tuesday: 'วันอังคาร',
    wednesday: 'วันพุธกลางวัน',
    wednesday_night: 'วันพุธกลางคืน',
    thursday: 'วันพฤหัสบดี',
    friday: 'วันศุกร์',
    saturday: 'วันเสาร์',
};

const genderCopy = {
    boys: { label: 'ลูกชาย', gender: 'male' as const, color: 'sky' },
    girls: { label: 'ลูกสาว', gender: 'female' as const, color: 'pink' },
};

export function isBirthdayDay(value: string): value is DayKey {
    return BIRTHDAY_DAY_KEYS.includes(value as DayKey);
}
export function getBirthdayPageCopy(gender: BirthdayGender, day: DayKey) {
    const genderInfo = genderCopy[gender];
    const dayLabel = dayLabels[day];
    const title = `ตั้งชื่อ${genderInfo.label}เกิด${dayLabel} ชื่อมงคลพร้อมความหมาย`;
    const description = `รวมไอเดียตั้งชื่อ${genderInfo.label}เกิด${dayLabel} พร้อมความหมาย ผลรวมเลขศาสตร์ อักษรมงคล และอักษรกาลกิณีตามหลักทักษาปกรณ์ ก่อนตรวจร่วมกับนามสกุล`;

    return { genderInfo, dayLabel, title, description };
}

export function BirthdayDayLandingPage({gender,day}:{gender:BirthdayGender;day:DayKey}) {return <NamesBirthdayPage gender={gender} day={day}/>;}
