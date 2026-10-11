import React from 'react'
import path from 'path'
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { Issuer } from '@/lib/issuer'

// One layout for both training quotes and training invoices — a port of the
// syrama-yachting invoice PDF (navy header rule, issuer / bill-to boxes,
// navy table head, totals block, bank box), adapted to training delivery.
export interface PdfLine {
  title: string
  description: string | null
  details: string[]
  rateLine: string | null
  startDate: string | null
  endDate: string | null
  hours: string | null
  amount: string | null
}

export interface DocumentPdfData {
  kind: 'quote' | 'invoice'
  number: string
  date: string
  extraDateLabel: string
  extraDate: string | null
  status: string
  issuer: Issuer

  billToName: string | null
  billToLines: string[]

  lines: PdfLine[]
  // Only for single-line documents — shown as the "Training Details" box
  infoBox: { client: string | null; location: string | null; topic: string | null; schedule: string | null; participants: number | null } | null

  applyVat: boolean
  vatRate: number
  subtotal: string | null
  vatAmount: string | null
  totalDue: string | null
  currency: string

  notes: string | null
}

// Same emblem as the syrama-yachting invoices (same issuing company).
const LOGO_PATH = path.join(process.cwd(), 'public/assets/invoices/syrama-logo.png')
const NAVY = '#0d1b2e'

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: 'Helvetica', color: '#1a1a1a', padding: '16px 36px' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: NAVY, paddingBottom: 8, marginBottom: 10 },
  // react-pdf's letterSpacing adds points between EVERY character — keep tiny.
  companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, textTransform: 'uppercase', color: NAVY },
  companyLegal: { fontSize: 8, color: '#888', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 1 },
  companyAddr: { fontSize: 8.5, color: '#555', marginTop: 4, lineHeight: 1.6 },
  docLabel: { fontSize: 21, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: NAVY, letterSpacing: 0.3, textAlign: 'right', marginTop: 2 },
  docMeta: { fontSize: 9, color: '#555', textAlign: 'right', marginTop: 6, lineHeight: 1.6 },
  docMetaBold: { fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  badge: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4, padding: '3px 8px', borderRadius: 2, alignSelf: 'flex-end', marginTop: 6 },
  partyRow: { flexDirection: 'row', marginBottom: 10, gap: 16 },
  partyBox: { flex: 1, borderWidth: 1, borderColor: '#d8d8d8', padding: '8px 13px' },
  partyLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#888', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 3, marginBottom: 5 },
  partyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 3 },
  partyDetail: { fontSize: 9, color: '#555', lineHeight: 1.6 },
  sectionTitle: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.6, color: '#888', borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 3, marginTop: 6, marginBottom: 5 },
  infoBox: { backgroundColor: '#f8f8f8', borderLeftWidth: 3, borderLeftColor: NAVY, padding: '6px 12px', fontSize: 9.5, lineHeight: 1.6, color: '#333' },
  table: { marginTop: 4 },
  tableHead: { flexDirection: 'row', backgroundColor: NAVY },
  th: { padding: '7px 9px', fontSize: 8, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  td: { padding: '9px 9px', fontSize: 10, color: '#333' },
  serviceName: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: NAVY },
  serviceDetail: { fontSize: 8.5, color: '#888', marginTop: 2, lineHeight: 1.5 },
  totalsTable: { width: 260, marginTop: 4, marginLeft: 'auto' },
  totalsRow: { flexDirection: 'row', padding: '5px 12px', fontSize: 10, color: '#555', borderBottomWidth: 1, borderBottomColor: '#eee' },
  totalsLabel: { width: '58%' },
  totalsVal: { width: '42%', textAlign: 'right', color: '#1a1a1a' },
  grandRow: { flexDirection: 'row', padding: '7px 12px', backgroundColor: NAVY, fontSize: 11, fontFamily: 'Helvetica-Bold', alignItems: 'center' },
  grandLabel: { width: '58%', color: '#fff', lineHeight: 1.3 },
  grandVal: { width: '42%', textAlign: 'right', color: '#fff' },
  noVat: { fontSize: 7.5, color: '#aaa', textAlign: 'right', marginTop: 4, fontStyle: 'italic', width: 260, marginLeft: 'auto' },
  bankBox: { flexDirection: 'row', backgroundColor: '#f8f8f8', borderLeftWidth: 3, borderLeftColor: NAVY, fontSize: 9.5, color: '#333', lineHeight: 1.6 },
  bankCol: { flex: 1, padding: '8px 13px' },
  bankHeading: { color: NAVY, fontFamily: 'Helvetica-Bold' },
  notesBox: { backgroundColor: '#f9f9f9', borderLeftWidth: 3, borderLeftColor: NAVY, padding: '7px 12px', fontSize: 9, lineHeight: 1.5, color: '#555', marginTop: 6 },
  signRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  signBox: { flex: 1, borderWidth: 1, borderColor: '#d8d8d8', padding: '8px 13px', height: 64 },
  signLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#888' },
  footer: { marginTop: 7, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 5, fontSize: 7.5, color: '#aaa', textAlign: 'center', lineHeight: 1.5 },
})

const BADGES: Record<string, { label: string; background: string; color: string }> = {
  draft: { label: 'Draft', background: '#eeeeee', color: '#666666' },
  sent: { label: 'Sent', background: '#e8a100', color: '#ffffff' },
  paid: { label: 'Paid', background: '#1a7a4a', color: '#ffffff' },
  accepted: { label: 'Accepted', background: '#1a7a4a', color: '#ffffff' },
  declined: { label: 'Declined', background: '#a33a3a', color: '#ffffff' },
  invoiced: { label: 'Invoiced', background: '#1d4f8a', color: '#ffffff' },
}

function DocumentView({ data }: { data: DocumentPdfData }) {
  const isQuote = data.kind === 'quote'
  const badge = BADGES[data.status] || BADGES.draft
  const { issuer, bank } = { issuer: data.issuer, bank: data.issuer.bank }
  const hasBank = !!(bank.iban || bank.holder)
  const box = data.infoBox
  const details: [string, string | null][] = box ? [
    ['Client', box.client],
    ['Location', box.location],
    ['Topic', box.topic],
    ['Schedule', box.schedule],
    ['Participants', box.participants ? String(box.participants) : null],
  ] : []
  const shownDetails = details.filter(([, v]) => !!v)

  return (
    <Document title={`${isQuote ? 'Quote' : 'Invoice'} ${data.number}`} author={issuer.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ width: '52%' }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an HTML img */}
            <Image src={LOGO_PATH} style={{ width: 77, height: 46, marginBottom: 6 }} />
            <Text style={styles.companyName}>{issuer.name}</Text>
            {issuer.legal ? <Text style={styles.companyLegal}>{issuer.legal}</Text> : null}
            <Text style={styles.companyAddr}>
              {issuer.addressLines.join('\n')}
              {'\n'}
              {[issuer.email, issuer.website].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.docLabel}>{isQuote ? 'Quote' : 'Invoice'}</Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaBold}>{isQuote ? 'Quote No. :' : 'Invoice No. :'}</Text> {data.number}{'\n'}
              <Text style={styles.docMetaBold}>Date :</Text> {data.date}
              {data.extraDate ? <>{'\n'}<Text style={styles.docMetaBold}>{data.extraDateLabel} :</Text> {data.extraDate}</> : null}
              {'\n'}<Text style={styles.docMetaBold}>Type :</Text> TRAINING
            </Text>
            <Text style={[styles.badge, { backgroundColor: badge.background, color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.partyRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>From — Issuer</Text>
            <Text style={styles.partyName}>{issuer.name}</Text>
            <Text style={styles.partyDetail}>
              {[issuer.addressLines[0], 'DSO-IFZA, Dubai, UAE', 'License No. 74796 — DIEZA', issuer.trn ? `TRN ${issuer.trn}` : '', issuer.email].filter(Boolean).join('\n')}
            </Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>{isQuote ? 'Quote for — Client' : 'Bill To — Client'}</Text>
            {data.billToName ? (
              <>
                <Text style={styles.partyName}>{data.billToName}</Text>
                <Text style={styles.partyDetail}>{data.billToLines.join('\n')}</Text>
              </>
            ) : (
              <Text style={[styles.partyDetail, { color: '#bbb' }]}>— Not specified —</Text>
            )}
          </View>
        </View>

        {shownDetails.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Training Details</Text>
            <View style={styles.infoBox}>
              {shownDetails.map(([label, value]) => (
                <Text key={label}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{label} : </Text>{value}
                </Text>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>{isQuote ? 'Services Proposed' : 'Services Rendered'}</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '40%' }]}>Description</Text>
            <Text style={[styles.th, { width: '14%' }]}>Start</Text>
            <Text style={[styles.th, { width: '14%' }]}>End</Text>
            <Text style={[styles.th, { width: '10%' }]}>Hours</Text>
            <Text style={[styles.th, { width: '22%', textAlign: 'right' }]}>Total Price</Text>
          </View>
          {data.lines.map((l, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <View style={[styles.td, { width: '40%' }]}>
                <Text style={styles.serviceName}>{l.title}</Text>
                {l.description ? <Text style={styles.serviceDetail}>{l.description}</Text> : null}
                {l.details.map((d) => <Text key={d} style={styles.serviceDetail}>{d}</Text>)}
                {l.rateLine ? <Text style={styles.serviceDetail}>{l.rateLine}</Text> : null}
              </View>
              <Text style={[styles.td, { width: '14%' }]}>{l.startDate || '—'}</Text>
              <Text style={[styles.td, { width: '14%' }]}>{l.endDate || l.startDate || '—'}</Text>
              <Text style={[styles.td, { width: '10%' }]}>{l.hours || '—'}</Text>
              <Text style={[styles.td, { width: '22%', textAlign: 'right' }]}>{l.amount ? `${l.amount} ${data.currency}` : '—'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsTable}>
          {data.applyVat ? (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsVal}>{data.subtotal ? `${data.subtotal} ${data.currency}` : '—'}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>VAT ({data.vatRate}%)</Text>
                <Text style={styles.totalsVal}>{data.vatAmount ? `${data.vatAmount} ${data.currency}` : '—'}</Text>
              </View>
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>{isQuote ? 'Total (incl. VAT)' : 'Total due (incl. VAT)'}</Text>
                <Text style={styles.grandVal}>{data.totalDue ? `${data.totalDue} ${data.currency}` : '—'}</Text>
              </View>
            </>
          ) : (
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>{isQuote ? 'Total' : 'Total due'}</Text>
              <Text style={styles.grandVal}>{data.totalDue ? `${data.totalDue} ${data.currency}` : '—'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.noVat}>
          {data.applyVat
            ? `VAT ${data.vatRate}% applied as per UAE Federal Tax Authority`
            : 'VAT exempt — Free Zone entity (UAE)'}
        </Text>

        {!isQuote && hasBank && (
          <>
            <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
            <View style={styles.bankBox}>
              <View style={styles.bankCol}>
                {bank.holder ? <Text><Text style={styles.bankHeading}>Account Holder :</Text>{'\n'}{bank.holder}{'\n\n'}</Text> : null}
                {bank.iban ? <Text><Text style={styles.bankHeading}>IBAN :</Text>{'\n'}{bank.iban}</Text> : null}
              </View>
              <View style={styles.bankCol}>
                {bank.bic ? <Text><Text style={styles.bankHeading}>BIC / SWIFT :</Text>{'\n'}{bank.bic}{'\n\n'}</Text> : null}
                {bank.bankName || bank.bankAddress ? (
                  <Text><Text style={styles.bankHeading}>Bank Address :</Text>{'\n'}{[bank.bankName, bank.bankAddress].filter(Boolean).join('\n')}</Text>
                ) : null}
              </View>
            </View>
          </>
        )}

        {data.notes && (
          <View style={styles.notesBox}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Notes :</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        {isQuote && (
          <View style={styles.signRow}>
            <View style={styles.signBox}>
              <Text style={styles.signLabel}>Accepted by</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={styles.signLabel}>Date &amp; signature</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          <Text style={{ color: '#888888', fontFamily: 'Helvetica-Bold' }}>{issuer.name}</Text> · License No. 74796 · IFZA Properties, Dubai Silicon Oasis, DSO-IFZA, Dubai, UAE · Issued by Dubai Integrated Economic Zones Authority (DIEZA)
          {isQuote ? '\nThis quote is an offer and does not constitute an invoice.' : data.applyVat ? '' : '\nThis document is issued without VAT as per UAE Free Zone regulations.'}
        </Text>
      </Page>
    </Document>
  )
}

export async function generateDocumentPdf(data: DocumentPdfData): Promise<Buffer> {
  const buffer = await renderToBuffer(<DocumentView data={data} />)
  return Buffer.from(buffer)
}
