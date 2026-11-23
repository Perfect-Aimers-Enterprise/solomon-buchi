import { z } from "zod";
import { clean } from "@/lib/utils/sanitize";

const text = (min: number, max: number) =>
  z.string().transform(clean).pipe(z.string().min(min, `Must be at least ${min} characters`).max(max));

const phone = z
  .string()
  .transform(clean)
  .pipe(z.string().min(6, "Enter a valid phone number").max(30).regex(/^[+\d][\d\s()\-]{4,}$/, "Enter a valid phone number"));

const email = z.string().transform((s) => clean(s).toLowerCase()).pipe(z.string().email("Enter a valid email address").max(200));

export const customerSchema = z.object({
  fullName: text(2, 120),
  email,
  phone,
  country: text(2, 80),
});

export const requestSchema = customerSchema
  .extend({
    category: z.enum(["coaching", "mentorship", "consulting", "speaking", "training", "event-ticket", "general"]),
    subject: text(3, 160),
    message: text(10, 4000),
    additionalInfo: z.string().transform(clean).pipe(z.string().max(2000)).optional().default(""),
    eventSlug: z.string().transform(clean).pipe(z.string().max(100)).optional().default(""),
    ticketTier: z.string().transform(clean).pipe(z.string().max(100)).optional().default(""),
    tickets: z.coerce.number().int().min(1).max(20).optional(),
    paymentMethod: z.string().transform(clean).pipe(z.string().max(60)).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.category === "event-ticket") {
      if (!v.eventSlug) ctx.addIssue({ code: "custom", path: ["eventSlug"], message: "Select an event" });
      if (!v.ticketTier) ctx.addIssue({ code: "custom", path: ["ticketTier"], message: "Select a ticket category" });
      if (!v.tickets) ctx.addIssue({ code: "custom", path: ["tickets"], message: "Enter the number of tickets" });
    }
  });

export type RequestInput = z.infer<typeof requestSchema>;

export const checkoutSchema = z.object({
  customer: customerSchema,
  itemId: z.string().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(20),
});
