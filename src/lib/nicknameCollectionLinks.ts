/** Public editorial entry points, kept separate from the server catalog resolver. */
export const NICKNAME_COLLECTION_LINKS = [
    { key: 'meaning/light', path: '/nicknames/meaning/light', label: 'สื่อถึงแสงสว่าง', title: 'ชื่อเล่นสื่อถึงแสงสว่าง พร้อมความหมาย' },
    { key: 'meaning/happiness', path: '/nicknames/meaning/happiness', label: 'ความสุขและความยินดี', title: 'ชื่อเล่นสื่อถึงความสุขและความยินดี พร้อมความหมาย' },
    { key: 'unisex', path: '/nicknames/unisex', label: 'ใช้ได้ทุกเพศ', title: 'ชื่อเล่นใช้ได้ทุกเพศ พร้อมความหมาย' },
] as const;

export type NicknameCollectionKey = (typeof NICKNAME_COLLECTION_LINKS)[number]['key'];
