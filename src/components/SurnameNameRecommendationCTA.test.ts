import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SurnameNameRecommendationCTA } from './SurnameNameRecommendationCTA';

describe('SurnameNameRecommendationCTA', () => {
  it('renders personalized premium-analysis copy and a clean destination URL', () => {
    const html = renderToStaticMarkup(
      React.createElement(SurnameNameRecommendationCTA, { surname: 'ใจดี' }),
    );

    expect(html).toContain('ค้นหาชื่อมงคลที่เข้ากับนามสกุล');
    expect(html).toContain('ใจดี');
    expect(html).toContain('แนะนำชื่อที่เข้ากับนามสกุล');
    expect(html).toContain('href="/premium-analysis"');
    expect(html).not.toContain('surname=');
    expect(html).toContain('data-track="name_result.premium_analysis.click"');
  });
});
