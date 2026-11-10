import Link from 'next/link';
import { babyNamingFaqs, babyNamingSteps } from '@/data/babyNaming';
import { NamingJsonLd } from './NamingShell';
import styles from './naming.module.css';
export function NamingGuide() {
    return (
        <>
            <section className={styles.section}>
                <h2>5 ขั้นตอนเลือกชื่อที่ครอบครัวใช้ได้จริง</h2>
                <ol className={styles.guide}>
                    {babyNamingSteps.map((step, index) => (
                        <li key={step.name}>
                            <h3>
                                {index + 1}. {step.name}
                            </h3>
                            <p>{step.text}</p>
                        </li>
                    ))}
                </ol>
                <p>
                    ความหมายเป็นข้อมูลทางภาษา
                    เลขศาสตร์และทักษาเป็นการตีความตามความเชื่อ ไม่รับประกันอนาคต
                    อ่าน{' '}
                    <Link href="/methodology">
                        วิธีคำนวณและนโยบายบรรณาธิการ
                    </Link>
                </p>
            </section>
            <section className={styles.section}>
                <h2>คำถามที่พบบ่อยเกี่ยวกับการเลือกชื่อ</h2>
                <div className={styles.faq}>
                    {babyNamingFaqs.map((faq) => (
                        <details key={faq.question}>
                            <summary>{faq.question}</summary>
                            <p>{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </section>
            <NamingJsonLd
                value={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: babyNamingFaqs.map((faq) => ({
                        '@type': 'Question',
                        name: faq.question,
                        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                    })),
                }}
            />
            <p className={styles.note}>
                จัดทำโดย <Link href="/about">ทีมงาน NameMongkol</Link> ·{' '}
                <Link href="/methodology">หลักการตรวจสอบข้อมูลและการแก้ไข</Link>
            </p>
        </>
    );
}
