import { en } from './en';
import { hi } from './hi';
import { ta } from './ta';
import { te } from './te';
import { mr } from './mr';
import { gu } from './gu';
import { bn } from './bn';
import { ur } from './ur';
import { Lang } from '../types';

export const translations: Record<Lang, typeof en> = {
  en,
  hi,
  ta,
  te,
  mr,
  gu,
  bn,
  ur
};

export const LANGUAGE_OPTIONS: { code: Lang; name: string; nativeName: string; isRTL?: boolean }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true }
];
