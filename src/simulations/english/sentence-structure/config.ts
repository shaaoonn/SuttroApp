import type { SimulationConfig } from '../../_template/config';

export const sentenceStructureConfig: SimulationConfig = {
  id: 'sentence-structure',
  slug: 'sentence-structure',
  title: { bn: 'বাক্য গঠন', en: 'Sentence Structure (SVO)' },
  subject: 'english',
  nctb: { class: 9, chapter: 1, section: '1.2' },
  variables: [
    { id: 'sentenceType', label: { bn: 'বাক্যের ধরন', en: 'Sentence Type' }, unit: '', min: 0, max: 4, default: 0, step: 1 },
  ],
  formulas: [
    { expression: 'Subject + Verb + Object', description: { bn: 'সাধারণ বাক্য গঠন (SVO)', en: 'Basic sentence structure' } },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};

export interface SentenceExample {
  type: string;
  typeBn: string;
  sentence: string;
  parts: { text: string; role: string; roleBn: string; color: string }[];
  bangla: string;
}

export const SENTENCES: SentenceExample[] = [
  {
    type: 'Declarative',
    typeBn: 'বিবৃতিমূলক',
    sentence: 'The cat sits on the mat.',
    parts: [
      { text: 'The cat', role: 'Subject', roleBn: 'কর্তা', color: '#60A5FA' },
      { text: 'sits', role: 'Verb', roleBn: 'ক্রিয়া', color: '#F87171' },
      { text: 'on the mat', role: 'Object/Complement', roleBn: 'কর্ম/পূরক', color: '#34D399' },
    ],
    bangla: 'বিড়ালটি মাদুরের উপর বসে।',
  },
  {
    type: 'Interrogative',
    typeBn: 'প্রশ্নবোধক',
    sentence: 'Does she play tennis?',
    parts: [
      { text: 'Does', role: 'Auxiliary', roleBn: 'সহায়ক ক্রিয়া', color: '#FBBF24' },
      { text: 'she', role: 'Subject', roleBn: 'কর্তা', color: '#60A5FA' },
      { text: 'play', role: 'Verb', roleBn: 'ক্রিয়া', color: '#F87171' },
      { text: 'tennis', role: 'Object', roleBn: 'কর্ম', color: '#34D399' },
    ],
    bangla: 'সে কি টেনিস খেলে?',
  },
  {
    type: 'Imperative',
    typeBn: 'আদেশমূলক',
    sentence: 'Open the door quickly.',
    parts: [
      { text: '(You)', role: 'Subject (implied)', roleBn: 'কর্তা (উহ্য)', color: '#60A5FA' },
      { text: 'Open', role: 'Verb', roleBn: 'ক্রিয়া', color: '#F87171' },
      { text: 'the door', role: 'Object', roleBn: 'কর্ম', color: '#34D399' },
      { text: 'quickly', role: 'Adverb', roleBn: 'ক্রিয়া বিশেষণ', color: '#A78BFA' },
    ],
    bangla: 'তাড়াতাড়ি দরজা খোলো।',
  },
  {
    type: 'Exclamatory',
    typeBn: 'বিস্ময়সূচক',
    sentence: 'What a beautiful day!',
    parts: [
      { text: 'What', role: 'Exclamation', roleBn: 'বিস্ময়সূচক', color: '#FBBF24' },
      { text: 'a beautiful', role: 'Adjective', roleBn: 'বিশেষণ', color: '#A78BFA' },
      { text: 'day', role: 'Noun', roleBn: 'বিশেষ্য', color: '#34D399' },
    ],
    bangla: 'কী সুন্দর দিন!',
  },
  {
    type: 'Negative',
    typeBn: 'নেতিবাচক',
    sentence: 'They do not like rain.',
    parts: [
      { text: 'They', role: 'Subject', roleBn: 'কর্তা', color: '#60A5FA' },
      { text: 'do not', role: 'Negative Aux', roleBn: 'নেতিবাচক সহায়ক', color: '#FBBF24' },
      { text: 'like', role: 'Verb', roleBn: 'ক্রিয়া', color: '#F87171' },
      { text: 'rain', role: 'Object', roleBn: 'কর্ম', color: '#34D399' },
    ],
    bangla: 'তারা বৃষ্টি পছন্দ করে না।',
  },
];
