import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Atomic Structure - Bohr Model
// NCTB Class 9, Chapter 3: পদার্থের গঠন
// Electron shells, protons, neutrons
// ─────────────────────────────────────────────

export const atomicStructureConfig: SimulationConfig = {
  id: 'atomic-structure',
  slug: 'atomic-structure',
  title: { bn: 'পরমাণুর গঠন - বোর মডেল', en: 'Atomic Structure - Bohr Model' },
  subject: 'chemistry',
  nctb: { class: 9, chapter: 3, section: '3.2' },
  variables: [
    {
      id: 'atomicNumber',
      label: { bn: 'পারমাণবিক সংখ্যা', en: 'Atomic Number' },
      unit: '',
      min: 1,
      max: 20,
      default: 1,
      step: 1,
    },
  ],
  formulas: [
    {
      expression: 'ইলেকট্রন বিন্যাস: 2, 8, 8, 2',
      description: { bn: 'K, L, M, N শেলের সর্বোচ্চ ধারণক্ষমতা', en: 'Max electrons per shell (K, L, M, N)' },
    },
    {
      expression: 'প্রোটন সংখ্যা = পারমাণবিক সংখ্যা',
      description: { bn: 'নিউক্লিয়াসে ধনাত্মক কণা', en: 'Positive particles in nucleus' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};

/** First 20 elements - covers NCTB Class 9-10 */
export interface ElementData {
  z: number;             // atomic number
  symbol: string;
  name: { bn: string; en: string };
  mass: number;          // atomic mass (rounded)
  neutrons: number;      // most common isotope
  shells: number[];      // electron configuration per shell
  group: string;         // element category
  color: string;         // display color
}

export const ELEMENTS: ElementData[] = [
  { z: 1,  symbol: 'H',  name: { bn: 'হাইড্রোজেন', en: 'Hydrogen' },     mass: 1,   neutrons: 0,  shells: [1],          group: 'অধাতু', color: '#60A5FA' },
  { z: 2,  symbol: 'He', name: { bn: 'হিলিয়াম', en: 'Helium' },          mass: 4,   neutrons: 2,  shells: [2],          group: 'নিষ্ক্রিয় গ্যাস', color: '#FBBF24' },
  { z: 3,  symbol: 'Li', name: { bn: 'লিথিয়াম', en: 'Lithium' },         mass: 7,   neutrons: 4,  shells: [2, 1],       group: 'ধাতু', color: '#F87171' },
  { z: 4,  symbol: 'Be', name: { bn: 'বেরিলিয়াম', en: 'Beryllium' },     mass: 9,   neutrons: 5,  shells: [2, 2],       group: 'ধাতু', color: '#F87171' },
  { z: 5,  symbol: 'B',  name: { bn: 'বোরন', en: 'Boron' },               mass: 11,  neutrons: 6,  shells: [2, 3],       group: 'অপধাতু', color: '#A78BFA' },
  { z: 6,  symbol: 'C',  name: { bn: 'কার্বন', en: 'Carbon' },            mass: 12,  neutrons: 6,  shells: [2, 4],       group: 'অধাতু', color: '#60A5FA' },
  { z: 7,  symbol: 'N',  name: { bn: 'নাইট্রোজেন', en: 'Nitrogen' },     mass: 14,  neutrons: 7,  shells: [2, 5],       group: 'অধাতু', color: '#60A5FA' },
  { z: 8,  symbol: 'O',  name: { bn: 'অক্সিজেন', en: 'Oxygen' },         mass: 16,  neutrons: 8,  shells: [2, 6],       group: 'অধাতু', color: '#60A5FA' },
  { z: 9,  symbol: 'F',  name: { bn: 'ফ্লোরিন', en: 'Fluorine' },        mass: 19,  neutrons: 10, shells: [2, 7],       group: 'অধাতু', color: '#60A5FA' },
  { z: 10, symbol: 'Ne', name: { bn: 'নিয়ন', en: 'Neon' },               mass: 20,  neutrons: 10, shells: [2, 8],       group: 'নিষ্ক্রিয় গ্যাস', color: '#FBBF24' },
  { z: 11, symbol: 'Na', name: { bn: 'সোডিয়াম', en: 'Sodium' },          mass: 23,  neutrons: 12, shells: [2, 8, 1],    group: 'ধাতু', color: '#F87171' },
  { z: 12, symbol: 'Mg', name: { bn: 'ম্যাগনেসিয়াম', en: 'Magnesium' }, mass: 24,  neutrons: 12, shells: [2, 8, 2],    group: 'ধাতু', color: '#F87171' },
  { z: 13, symbol: 'Al', name: { bn: 'অ্যালুমিনিয়াম', en: 'Aluminium' }, mass: 27,  neutrons: 14, shells: [2, 8, 3],    group: 'ধাতু', color: '#F87171' },
  { z: 14, symbol: 'Si', name: { bn: 'সিলিকন', en: 'Silicon' },          mass: 28,  neutrons: 14, shells: [2, 8, 4],    group: 'অপধাতু', color: '#A78BFA' },
  { z: 15, symbol: 'P',  name: { bn: 'ফসফরাস', en: 'Phosphorus' },       mass: 31,  neutrons: 16, shells: [2, 8, 5],    group: 'অধাতু', color: '#60A5FA' },
  { z: 16, symbol: 'S',  name: { bn: 'সালফার', en: 'Sulfur' },           mass: 32,  neutrons: 16, shells: [2, 8, 6],    group: 'অধাতু', color: '#60A5FA' },
  { z: 17, symbol: 'Cl', name: { bn: 'ক্লোরিন', en: 'Chlorine' },       mass: 35,  neutrons: 18, shells: [2, 8, 7],    group: 'অধাতু', color: '#60A5FA' },
  { z: 18, symbol: 'Ar', name: { bn: 'আর্গন', en: 'Argon' },             mass: 40,  neutrons: 22, shells: [2, 8, 8],    group: 'নিষ্ক্রিয় গ্যাস', color: '#FBBF24' },
  { z: 19, symbol: 'K',  name: { bn: 'পটাসিয়াম', en: 'Potassium' },     mass: 39,  neutrons: 20, shells: [2, 8, 8, 1], group: 'ধাতু', color: '#F87171' },
  { z: 20, symbol: 'Ca', name: { bn: 'ক্যালসিয়াম', en: 'Calcium' },     mass: 40,  neutrons: 20, shells: [2, 8, 8, 2], group: 'ধাতু', color: '#F87171' },
];
