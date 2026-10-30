'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowRightLeft, Check, Plus, ShieldCheck } from 'lucide-react';
import { thaksaConfig } from '@/data/thaksaConfig';
import { compareNames, sortComparisons, validateComparison, type ComparisonOrder, type NameComparison } from '@/lib/nameComparison';
import { NameInput } from './NameInput';
import { ComparisonTable } from './ComparisonTable';
import styles from './comparison.module.css';

type NameSlot = { id: number; value: string };

export default function CompareNamesClient() {
  const [names, setNames] = useState<NameSlot[]>([{ id: 0, value: '' }, { id: 1, value: '' }]);
  const nextId = useRef(2);
  const [surname, setSurname] = useState('');
  const [day, setDay] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [result, setResult] = useState<NameComparison[] | null>(null);
  const [order, setOrder] = useState<ComparisonOrder>('grade');
  const resultRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = validateComparison(names.map(item => item.value), surname, day);
  const sorted = useMemo(() => result ? sortComparisons(result, order) : [], [result, order]);

  // Prefill from the individual analysis entry, after hydration, without making this page dynamic.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      if (name) setNames([{ id: 0, value: name.slice(0, 100) }, { id: 1, value: '' }]);
      setSurname((params.get('surname') ?? '').slice(0, 100));
      const initialDay = params.get('day') ?? '';
      if (Object.hasOwn(thaksaConfig, initialDay)) setDay(initialDay);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function invalidate() { setResult(null); }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!errors.valid) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setResult(compareNames(names.map(item => item.value), surname, day));
    setHasCompared(true);
    requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    });
  }

  return (
    <>
      <form ref={formRef} onSubmit={submit} noValidate className={styles.form} aria-label="ข้อมูลเปรียบเทียบชื่อ">
        <div className={styles.formHeading}><span className={styles.step}>01</span><div><h2>ชื่อที่อยากเปรียบเทียบ</h2><p>เลือกจากฐานข้อมูล หรือพิมพ์ชื่อที่คุณมีในใจ</p></div><span className={styles.count}>{names.length} / 5 ชื่อ</span></div>
        <div className={styles.nameGrid}>
          {names.map((item, index) => <NameInput key={item.id} number={index + 1} value={item.value}
            error={attempted ? errors.names[index] : undefined}
            onChange={value => { setNames(current => current.map(slot => slot.id === item.id ? { ...slot, value } : slot)); invalidate(); }}
            onRemove={names.length > 2 ? () => {
              setNames(current => current.filter(slot => slot.id !== item.id)); invalidate();
              requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[role="combobox"]')?.focus());
            } : undefined} />)}
          {names.length < 5 && <button type="button" className={styles.addName} onClick={() => {
            const id = nextId.current++;
            setNames(current => [...current, { id, value: '' }]); invalidate();
            requestAnimationFrame(() => { const inputs = formRef.current?.querySelectorAll<HTMLInputElement>('[role="combobox"]'); inputs?.[inputs.length - 1]?.focus(); });
          }}><Plus size={20} aria-hidden="true" /> เพิ่มชื่อ</button>}
        </div>
        <p className={styles.formHint}>พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา เปรียบเทียบชื่อจริงของคนเดียวกันได้ครั้งละ 2–5 ชื่อ</p>
        <div className={styles.sharedHeading}><span className={styles.step}>02</span><h2>ข้อมูลร่วมสำหรับทุกชื่อ</h2></div>
        <div className={styles.sharedFields}>
          <div><label htmlFor="compare-surname">นามสกุล <span>(ไม่บังคับ)</span></label><input id="compare-surname" value={surname} maxLength={100} placeholder="ใช้นามสกุลเดียวกันทุกชื่อ" aria-invalid={attempted && !!errors.surname} aria-describedby={attempted && errors.surname ? 'surname-error' : undefined} onChange={event => { setSurname(event.target.value); invalidate(); }} />{attempted && errors.surname && <p id="surname-error" className={styles.error}>{errors.surname}</p>}</div>
          <div><label htmlFor="compare-day">วันเกิด</label><select id="compare-day" value={day} aria-invalid={attempted && !!errors.day} aria-describedby={attempted && errors.day ? 'day-error' : undefined} onChange={event => { setDay(event.target.value); invalidate(); }}><option value="" disabled>เลือกวันเกิด</option>{Object.entries(thaksaConfig).map(([key, config]) => <option key={key} value={key}>{config.name}</option>)}</select>{attempted && errors.day && <p id="day-error" className={styles.error}>{errors.day}</p>}</div>
          <button type="submit" className={styles.primary}><ArrowRightLeft size={19} aria-hidden="true" /> เปรียบเทียบชื่อ</button>
        </div>
        <div className={styles.formFooter}><ShieldCheck size={16} aria-hidden="true" /><span>ใช้ฟรี ไม่ต้องสมัคร และไม่บันทึกชุดเปรียบเทียบ</span></div>
        {attempted && !errors.valid && <p role="alert" className={styles.error}>{errors.form || 'ตรวจสอบข้อมูลที่ระบุไว้ก่อนเปรียบเทียบอีกครั้ง'}</p>}
      </form>

      <div role="status" className={styles.changeStatus}>{hasCompared && !result ? 'ข้อมูลเปลี่ยนแล้ว กดเปรียบเทียบชื่อเพื่อดูผลล่าสุด' : result ? `เปรียบเทียบแล้ว ${result.length} ชื่อ` : ''}</div>

      {result ? <section ref={resultRef} tabIndex={-1} className={styles.results} aria-labelledby="comparison-results-title">
        <div className={styles.resultHeading}><div><p className={styles.eyebrow}>ผลเปรียบเทียบ</p><h2 id="comparison-results-title">เห็นความต่าง แล้วเลือกชื่อที่ใช่</h2><p className={styles.resultContext}>{thaksaConfig[result[0].day].name}{result[0].surname ? ` · นามสกุล ${result[0].surname}` : ' · เปรียบเทียบเฉพาะชื่อจริง'}</p></div><div className={styles.order}><label htmlFor="comparison-order">เรียงตาม</label><select id="comparison-order" value={order} onChange={event => setOrder(event.target.value as ComparisonOrder)}><option value="grade">เกรด A+ → C</option><option value="input">ลำดับที่กรอก</option></select></div></div>
        <p className={styles.methodNote}>เกรดพิจารณาผลรวมเลขศาสตร์และคู่เลข ส่วนกาลกิณีตรวจแยกตามวันเกิด ชื่อเกรด A+ จึงยังอาจมีกาลกิณีได้ เมื่อเกรดเท่ากันจะคงลำดับที่กรอก</p>
        <p className={styles.scrollHint}>เลื่อนตารางซ้าย–ขวาเพื่อดูทุกชื่อ <ArrowRight size={15} aria-hidden="true" /></p>
        <ComparisonTable rows={sorted} />
        <p className={styles.tableNote}>คู่เลขนับแยกในชื่อและนามสกุล ไม่สร้างคู่เลขข้ามรอยต่อ ผลลัพธ์เป็นข้อมูลประกอบการพิจารณาตามศาสตร์ความเชื่อ <Link href="/methodology">อ่านหลักการคำนวณ</Link></p>
      </section> : <section className={styles.empty} aria-label="สิ่งที่จะได้รับจากการเปรียบเทียบ"><ArrowRightLeft size={27} aria-hidden="true" /><h2>ไม่ต้องจำผลทีละชื่อ</h2><p>กรอกชื่อที่สนใจ แล้วดูเลขศาสตร์ คู่เลข กาลกิณี และอายตนะเคียงข้างกัน</p><div><span><Check size={15} aria-hidden="true" /> สูตรเดียวกับหน้าวิเคราะห์ชื่อ</span><span><Check size={15} aria-hidden="true" /> ดูผลละเอียดต่อได้ทุกชื่อ</span></div></section>}
    </>
  );
}
