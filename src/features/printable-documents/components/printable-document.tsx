/* eslint-disable @next/next/no-img-element -- Settings accepts operator-managed logo URLs without a fixed remote host. */
import type { ReactNode } from "react";
import type { PrintableBusiness, PrintableColumn, PrintableCustomer, PrintableMeta, PrintableRow, PrintableSignature, PrintableTotal } from "@/features/printable-documents/types";
import { formatBranch } from "@/features/printable-documents/printable-document-core";
import { PrintActions } from "./print-actions";
import styles from "./printable-document.module.css";

type Props = {
  backHref: string;
  business: PrintableBusiness;
  customer: PrintableCustomer;
  title: string;
  subtitle: string;
  documentNumber: string;
  statusLabel?: string;
  copyLabel?: string;
  metadata: PrintableMeta[];
  columns: PrintableColumn[];
  rows: PrintableRow[];
  totals: PrintableTotal[];
  amountWords?: string;
  notes?: string | null;
  footer?: string | null;
  signatures: PrintableSignature[];
  signaturePlacement?: "footer" | "summary";
  tableCaption: string;
};

function SignatureFields({ signatures, compact = false }: { signatures: PrintableSignature[]; compact?: boolean }) {
  return <div className={compact ? styles.summarySignatures : styles.signatures}>{signatures.map((signature) => <div key={signature.label} className={styles.signature}><div className={styles.signatureCard}><span className={styles.signatureLine} />{signature.dateLabel && <p className={styles.signatureDetail}>{signature.dateLabel} ____ / ____ / ______</p>}</div><p className={styles.signatureRole}>{signature.label}</p></div>)}</div>;
}

function printValue(value: ReactNode) { return typeof value === "string" ? value.replaceAll("฿", "") : value; }

export function PrintableDocument(props: Props) {
  const metadata = props.metadata.filter((item) => item.value !== null && item.value !== undefined && item.value !== "");
  const companyName = props.business.legalName || props.business.businessName;
  const signaturesInSummary = props.signaturePlacement === "summary";
  return <div className={`print-document-page ${styles.preview}`}>
    <PrintActions backHref={props.backHref} />
    <article className={styles.sheet} aria-labelledby="print-document-title">
      <header className={styles.header}>
        <div className={styles.businessIdentity}>
          {props.business.logoUrl && <img className={styles.logo} src={props.business.logoUrl} alt={`โลโก้ ${companyName}`} />}
          <div className={styles.businessDetails}>
            <p className={styles.businessName}>{companyName}</p>
            {props.business.address && <p>{props.business.address}</p>}
            {props.business.taxId && <p>เลขประจำตัวผู้เสียภาษี {props.business.taxId}{props.business.branch ? ` (${formatBranch(props.business.branch)})` : ""}</p>}
            {props.business.phone && <p>โทร {props.business.phone}</p>}
          </div>
        </div>
        <div className={styles.documentIdentity}>{props.copyLabel && <p className={styles.copyLabel}>{props.copyLabel}</p>}<h1 id="print-document-title">{props.title}</h1><p className={styles.subtitle}>{props.subtitle}</p><p className={styles.documentNumber}>{props.documentNumber}</p>{props.statusLabel && <p className={styles.status}>{props.statusLabel}</p>}</div>
      </header>
      <section className={styles.information}>
        <div className={styles.customer}><p className={styles.customerName}>{props.customer.name}</p><p>รหัสลูกค้า {props.customer.code}</p>{props.customer.taxId && <p>เลขประจำตัวผู้เสียภาษี {props.customer.taxId}{props.customer.branch ? ` (${formatBranch(props.customer.branch)})` : ""}</p>}{props.customer.address && <p>{props.customer.address}</p>}</div>
        <dl className={styles.metadata}>{metadata.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value || "-"}</dd></div>)}</dl>
      </section>
      <table className={styles.table}><caption className="sr-only">{props.tableCaption}</caption><thead><tr>{props.columns.map((column) => <th key={column.key} className={column.align ? styles[column.align] : undefined} style={{ width: column.width }}>{column.label}</th>)}</tr></thead><tbody>{props.rows.map((row) => <tr key={row.key}>{props.columns.map((column) => <td key={column.key} className={column.align ? styles[column.align] : undefined}>{printValue(row.cells[column.key] ?? "-")}</td>)}</tr>)}</tbody></table>
      <section className={styles.summary}>
        <div className={styles.summaryText}>{props.amountWords && <p><span>จำนวนเงิน (ตัวอักษร)</span><strong>{props.amountWords}</strong></p>}{props.notes && <p><span>หมายเหตุ</span>{props.notes}</p>}{signaturesInSummary && <SignatureFields signatures={props.signatures} compact />}</div>
        <dl className={styles.totals}>{props.totals.map((item) => <div key={item.label} className={item.strong ? styles.grandTotal : undefined}><dt>{item.label}</dt><dd>{printValue(item.amount)}</dd></div>)}</dl>
      </section>
      <footer className={styles.footer}>{!signaturesInSummary && <SignatureFields signatures={props.signatures} />}{props.footer && <p className={styles.footerNote}>{props.footer}</p>}</footer>
    </article>
  </div>;
}
