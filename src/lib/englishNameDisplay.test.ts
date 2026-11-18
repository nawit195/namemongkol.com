import { expect, test } from 'vitest';
import { englishNameExplanation, englishNameStatusLabel } from './englishNameDisplay';

test('distinguishes source spellings from unreviewed suggestions without asserting document spellings', () => {
    expect(englishNameStatusLabel('pending')).toBe('รอตรวจสอบ');
    expect(englishNameStatusLabel('draft')).toBe('รอตรวจสอบ');
    expect(englishNameStatusLabel('approved')).toBe('ตรวจสอบแล้ว');
    expect(englishNameStatusLabel()).toBe('ตามข้อมูลต้นทาง');
    expect(englishNameExplanation('Kamon', 'pending')).toContain('ไม่ใช่การยืนยันการสะกดในเอกสาร');
    expect(englishNameExplanation('Kamon', 'pending', 'rtgs-reading-v1')).toContain('จากคำอ่านไทย');
    expect(englishNameExplanation('KAMOL')).toContain('ตามข้อมูลต้นทาง');
    expect(englishNameExplanation()).toBe('ยังไม่มีข้อมูล');
    expect(englishNameExplanation(undefined, 'pending', 'rtgs-reading-v1')).toContain('อยู่ระหว่างตรวจสอบชื่อภาษาอังกฤษ');
});
