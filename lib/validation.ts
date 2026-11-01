import { z } from 'zod';
export const enquirySchema = z.object({
 customer_name:z.string().trim().min(2,'Enter your name').max(120), company_name:z.string().trim().max(120).optional().or(z.literal('')),
 email:z.string().trim().email('Enter a valid email address').max(254), telephone:z.string().trim().max(40).optional().or(z.literal('')),
 enquiry_type:z.enum(['quotation','product','bulk','general']), product_category:z.string().trim().min(2).max(100),
 quantity:z.string().trim().max(100).optional().or(z.literal('')), destination_country:z.string().trim().max(100).optional().or(z.literal('')),
 message:z.string().trim().min(10,'Please add a few details (at least 10 characters)').max(4000), website:z.string().max(0).optional(),
}).strict();
export type EnquiryInput=z.infer<typeof enquirySchema>;
