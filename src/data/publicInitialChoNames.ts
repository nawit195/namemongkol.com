import type { DayKey } from './thaksa';

// Supplied readings/meanings are preliminary, not linguistic approvals.
const entries: [string, string, string, DayKey[]][] = [
    ['ชิณคิณา', 'ชิน-คิ-นา', 'มีปัญญา และมีความรู้', ['sunday', 'saturday', 'wednesday_night', 'friday']],
    ['ชิณคินา', 'ชิน-คิ-นา', 'มีปัญญา มีความรู้ และอ่อนโยน', ['sunday', 'wednesday_night', 'friday']],
    ['ชิณคิมา', 'ชิน-คิ-มา', 'มีปัญญา มีความรู้ และมีเมตตา', ['sunday', 'saturday', 'friday']],
    ['ชิณคิหา', 'ชิน-คิ-หา', 'มีปัญญา มีความรู้ และเข้มแข็ง', ['saturday', 'wednesday_night', 'friday']],
    ['ชิณริมา', 'ชิน-ริ-มา', 'มีปัญญา รุ่งเรือง และมีเมตตา', ['sunday', 'tuesday', 'saturday']],
    ['ชิณริหา', 'ชิน-ริ-หา', 'มีปัญญา รุ่งเรือง และเข้มแข็ง', ['tuesday', 'saturday', 'wednesday_night']],
    ['ชินธิณา', 'ชิน-ทิ-นา', 'อ่อนโยน มีคุณธรรม และมีปัญญา', ['sunday', 'tuesday', 'wednesday_night', 'friday']],
    ['ชินธินา', 'ชิน-ทิ-นา', 'อ่อนโยน และมีคุณธรรม', ['sunday', 'tuesday', 'thursday', 'wednesday_night', 'friday']],
    ['ชินธิมา', 'ชิน-ทิ-มา', 'อ่อนโยน มีคุณธรรม และมีเมตตา', ['sunday', 'tuesday', 'thursday', 'friday']],
    ['ชินธิหา', 'ชิน-ทิ-หา', 'อ่อนโยน มีคุณธรรม และเข้มแข็ง', ['tuesday', 'thursday', 'wednesday_night', 'friday']],
    ['ชินรัณา', 'ชิน-ระ-นา', 'อ่อนโยน รุ่งเรือง และมีปัญญา', ['sunday', 'tuesday', 'wednesday_night']],
    ['ชินรันา', 'ชิน-ระ-นา', 'อ่อนโยน และรุ่งเรือง', ['sunday', 'tuesday', 'thursday', 'wednesday_night']],
    ['ชินรัมา', 'ชิน-ระ-มา', 'อ่อนโยน รุ่งเรือง และมีเมตตา', ['sunday', 'tuesday', 'thursday']],
    ['ชินรัหา', 'ชิน-ระ-หา', 'อ่อนโยน รุ่งเรือง และเข้มแข็ง', ['tuesday', 'thursday', 'wednesday_night']],
    ['ชินริณา', 'ชิน-ริ-นา', 'อ่อนโยน รุ่งเรือง และมีปัญญา', ['sunday', 'tuesday', 'wednesday_night']],
    ['ชินรินา', 'ชิน-ริ-นา', 'อ่อนโยน และรุ่งเรือง', ['sunday', 'tuesday', 'thursday', 'wednesday_night']],
    ['ชินริมา', 'ชิน-ริ-มา', 'อ่อนโยน รุ่งเรือง และมีเมตตา', ['sunday', 'tuesday', 'thursday']],
    ['ชินริหา', 'ชิน-ริ-หา', 'อ่อนโยน รุ่งเรือง และเข้มแข็ง', ['tuesday', 'thursday', 'wednesday_night']],
    ['ชิมคิณา', 'ชิม-คิ-นา', 'มีเมตตา มีความรู้ และมีปัญญา', ['sunday', 'saturday', 'friday']],
    ['ชิมคินา', 'ชิม-คิ-นา', 'มีเมตตา มีความรู้ และอ่อนโยน', ['sunday', 'thursday', 'friday']],
    ['ชิมคิมา', 'ชิม-คิ-มา', 'มีเมตตา และมีความรู้', ['sunday', 'saturday', 'thursday', 'friday']],
    ['ชิมคิหา', 'ชิม-คิ-หา', 'มีเมตตา มีความรู้ และเข้มแข็ง', ['saturday', 'thursday', 'friday']],
    ['ชิมธิณา', 'ชิม-ทิ-นา', 'มีเมตตา มีคุณธรรม และมีปัญญา', ['sunday', 'tuesday', 'friday']],
    ['ชิมธินา', 'ชิม-ทิ-นา', 'มีเมตตา มีคุณธรรม และอ่อนโยน', ['sunday', 'tuesday', 'thursday', 'friday']],
    ['ชิมธิมา', 'ชิม-ทิ-มา', 'มีเมตตา และมีคุณธรรม', ['sunday', 'tuesday', 'thursday', 'friday']],
    ['ชิมธิหา', 'ชิม-ทิ-หา', 'มีเมตตา มีคุณธรรม และเข้มแข็ง', ['tuesday', 'thursday', 'friday']],
    ['ชัณริณา', 'ชัน-ริ-นา', 'มีปัญญา และรุ่งเรือง', ['sunday', 'tuesday', 'saturday', 'wednesday_night']],
    ['ชัณรินา', 'ชัน-ริ-นา', 'มีปัญญา รุ่งเรือง และอ่อนโยน', ['sunday', 'tuesday', 'wednesday_night']],
    ['ชัณริมา', 'ชัน-ริ-มา', 'มีปัญญา รุ่งเรือง และมีเมตตา', ['sunday', 'tuesday', 'saturday']],
    ['ชัณริหา', 'ชัน-ริ-หา', 'มีปัญญา รุ่งเรือง และเข้มแข็ง', ['tuesday', 'saturday', 'wednesday_night']],
];

export const publicInitialChoNames = entries.map(([name, pronunciation, meaning, suitableDays]) => ({
    name, pronunciation, meaning, suitableDays,
}));
