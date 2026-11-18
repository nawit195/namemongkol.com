import type { PublicNameReviewStatus } from './publicNames';

export function englishNameStatusLabel(status?: PublicNameReviewStatus): string {
    if (status === 'pending' || status === 'draft') return 'รอตรวจสอบ';
    if (status === 'approved') return 'ตรวจสอบแล้ว';
    if (status === 'rejected') return 'ไม่เผยแพร่';
    return 'ตามข้อมูลต้นทาง';
}

export function englishNameExplanation(name?: string, status?: PublicNameReviewStatus, source?: string): string {
    if (status === 'pending' || status === 'draft') {
        if (!name) return 'ยังไม่มีคำสะกดพร้อมแสดง หรือคำอ่านมีการเปลี่ยนแปลง อยู่ระหว่างตรวจสอบชื่อภาษาอังกฤษ';
        return source === 'rtgs-reading-v1'
            ? 'คำถอดเสียงแนะนำจากคำอ่านไทย ยังไม่ผ่านการตรวจสอบ ไม่ใช่การยืนยันการสะกดในเอกสาร'
            : 'ตัวเลือกการสะกดตามข้อมูลต้นทาง ยังไม่ผ่านการตรวจสอบ ไม่ใช่การยืนยันการสะกดในเอกสาร';
    }
    if (status === 'rejected') return 'ข้อมูลการสะกดนี้ยังไม่เผยแพร่';
    return name ? 'ตัวเลือกการสะกดตามข้อมูลต้นทาง ควรยืนยันก่อนใช้ในเอกสาร' : 'ยังไม่มีข้อมูล';
}
