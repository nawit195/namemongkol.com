import React from 'react';
import Link from 'next/link';
import { getArticleNamingJourney } from '@/lib/articleNamingJourney';
import styles from './namingArticleJourney.module.css';

export function NamingArticleJourney({ slug }: { slug: string }) {
    const journey = getArticleNamingJourney(slug);
    if (!journey) return null;
    return (
        <nav className={styles.journey} aria-labelledby="article-naming-journey-title">
            <h2 id="article-naming-journey-title">{journey.title}</h2>
            <p className={styles.intro}>{journey.description}</p>
            <ol className={styles.steps}>
                {journey.steps.map((step, index) => (
                    <li key={step.href}>
                        <span className={styles.number} aria-hidden="true">{index + 1}.</span>
                        <div>
                            <Link prefetch={false} href={step.href}>{step.label}</Link>
                            <p>{step.description}</p>
                        </div>
                    </li>
                ))}
            </ol>
            {journey.related.length > 0 && <div className={styles.related}>
                <span>อ่านประกอบ:</span>
                {journey.related.map(link => <Link key={link.href} prefetch={false} href={link.href}>{link.label}</Link>)}
            </div>}
        </nav>
    );
}
