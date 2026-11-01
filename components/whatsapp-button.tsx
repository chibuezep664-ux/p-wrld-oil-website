import { MessageCircle } from 'lucide-react';
import {whatsappUrl} from '@/lib/whatsapp';
export function WhatsAppButton({message='Hello P-WRLD OIL, I would like to make an enquiry.',label='Chat on WhatsApp',className=''}:{message?:string;label?:string;className?:string}){return <a className={`button button-whatsapp ${className}`} href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" aria-label={`${label} — opens WhatsApp in a new tab`}><MessageCircle size={18}/>{label}</a>}
