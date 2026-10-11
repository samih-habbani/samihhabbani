// Who issues the invoices/quotes. Banking and legal details come from server
// env vars (never committed — this repo is public); anything left unset is
// simply omitted from the PDF rather than invented.
const clean = (v?: string) => (v && v.trim() ? v.trim() : '')

export function getIssuer() {
  return {
    name: clean(process.env.INVOICE_ISSUER_NAME) || 'Samih Habbani',
    // e.g. "Freelance — License No. 12345 — DET" (optional)
    legal: clean(process.env.INVOICE_ISSUER_LEGAL),
    // Lines separated by "|" — e.g. "Dubai Marina|Dubai, United Arab Emirates"
    addressLines: (clean(process.env.INVOICE_ISSUER_ADDRESS) || 'Dubai, United Arab Emirates').split('|').map((l) => l.trim()).filter(Boolean),
    email: clean(process.env.INVOICE_ISSUER_EMAIL) || 'samihhabbani@gmail.com',
    phone: clean(process.env.INVOICE_ISSUER_PHONE),
    website: clean(process.env.INVOICE_ISSUER_WEBSITE) || 'www.samihhabbani.com',
    // UAE Tax Registration Number — printed when set (required on VAT invoices)
    trn: clean(process.env.INVOICE_ISSUER_TRN),
    bank: {
      holder: clean(process.env.INVOICE_BANK_HOLDER),
      iban: clean(process.env.INVOICE_BANK_IBAN),
      bic: clean(process.env.INVOICE_BANK_BIC),
      bankName: clean(process.env.INVOICE_BANK_NAME),
      bankAddress: clean(process.env.INVOICE_BANK_ADDRESS).split('|').join('\n'),
    },
  }
}
export type Issuer = ReturnType<typeof getIssuer>
