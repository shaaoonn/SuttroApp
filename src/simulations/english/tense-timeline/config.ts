import type { SimulationConfig } from '../../_template/config';

export const tenseTimelineConfig: SimulationConfig = {
  id: 'tense-timeline',
  slug: 'tense-timeline',
  title: { bn: 'কাল - টেন্স টাইমলাইন', en: 'Tense Timeline' },
  subject: 'english',
  nctb: { class: 9, chapter: 2, section: '2.1' },
  variables: [
    { id: 'tenseGroup', label: { bn: 'কালের প্রকার', en: 'Tense Group' }, unit: '', min: 0, max: 2, default: 0, step: 1 },
    { id: 'subType', label: { bn: 'উপ-প্রকার', en: 'Sub-type' }, unit: '', min: 0, max: 3, default: 0, step: 1 },
  ],
  formulas: [
    { expression: '12 Tenses = 3 Times × 4 Aspects', description: { bn: '৩টি কাল × ৪টি রূপ = ১২টি টেন্স', en: '3 times × 4 aspects = 12 tenses' } },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};

export interface TenseData {
  name: string;
  nameBn: string;
  formula: string;
  example: string;
  exampleBn: string;
  color: string;
}

export const TENSE_GROUPS = ['Past', 'Present', 'Future'];
export const TENSE_GROUPS_BN = ['অতীত', 'বর্তমান', 'ভবিষ্যৎ'];
export const SUB_TYPES = ['Simple', 'Continuous', 'Perfect', 'Perfect Continuous'];
export const SUB_TYPES_BN = ['সাধারণ', 'চলমান', 'পূর্ণ', 'পূর্ণ চলমান'];

// [group][subType]
export const TENSES: TenseData[][] = [
  // Past
  [
    { name: 'Past Simple', nameBn: 'সাধারণ অতীত', formula: 'S + V₂ + O', example: 'I played football.', exampleBn: 'আমি ফুটবল খেলেছিলাম।', color: '#F87171' },
    { name: 'Past Continuous', nameBn: 'অতীত চলমান', formula: 'S + was/were + V-ing', example: 'I was playing football.', exampleBn: 'আমি ফুটবল খেলছিলাম।', color: '#FB923C' },
    { name: 'Past Perfect', nameBn: 'অতীত পূর্ণ', formula: 'S + had + V₃', example: 'I had played football.', exampleBn: 'আমি ফুটবল খেলে ফেলেছিলাম।', color: '#FBBF24' },
    { name: 'Past Perfect Cont.', nameBn: 'অতীত পূর্ণ চলমান', formula: 'S + had been + V-ing', example: 'I had been playing.', exampleBn: 'আমি খেলে চলেছিলাম।', color: '#A3E635' },
  ],
  // Present
  [
    { name: 'Present Simple', nameBn: 'সাধারণ বর্তমান', formula: 'S + V₁/V₁s + O', example: 'I play football.', exampleBn: 'আমি ফুটবল খেলি।', color: '#34D399' },
    { name: 'Present Continuous', nameBn: 'বর্তমান চলমান', formula: 'S + am/is/are + V-ing', example: 'I am playing football.', exampleBn: 'আমি ফুটবল খেলছি।', color: '#2DD4BF' },
    { name: 'Present Perfect', nameBn: 'বর্তমান পূর্ণ', formula: 'S + have/has + V₃', example: 'I have played football.', exampleBn: 'আমি ফুটবল খেলেছি।', color: '#22D3EE' },
    { name: 'Present Perfect Cont.', nameBn: 'বর্তমান পূর্ণ চলমান', formula: 'S + have been + V-ing', example: 'I have been playing.', exampleBn: 'আমি খেলে চলেছি।', color: '#60A5FA' },
  ],
  // Future
  [
    { name: 'Future Simple', nameBn: 'সাধারণ ভবিষ্যৎ', formula: 'S + will/shall + V₁', example: 'I will play football.', exampleBn: 'আমি ফুটবল খেলব।', color: '#818CF8' },
    { name: 'Future Continuous', nameBn: 'ভবিষ্যৎ চলমান', formula: 'S + will be + V-ing', example: 'I will be playing.', exampleBn: 'আমি খেলতে থাকব।', color: '#A78BFA' },
    { name: 'Future Perfect', nameBn: 'ভবিষ্যৎ পূর্ণ', formula: 'S + will have + V₃', example: 'I will have played.', exampleBn: 'আমি খেলে ফেলব।', color: '#C084FC' },
    { name: 'Future Perfect Cont.', nameBn: 'ভবিষ্যৎ পূর্ণ চলমান', formula: 'S + will have been + V-ing', example: 'I will have been playing.', exampleBn: 'আমি খেলে চলে থাকব।', color: '#E879F9' },
  ],
];
