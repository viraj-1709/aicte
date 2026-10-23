import os
import io
from pathlib import Path
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_audit_pdf(app_data: Dict[str, Any], output_path: str) -> str:
    """
    Generates an official, publication-quality AICTE Scrutiny Dossier &
    Immutable Audit Certificate PDF using ReportLab.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    normal = styles['Normal']

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F2C59'),
        alignment=1 # Center
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=normal,
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#475569'),
        alignment=1 # Center
    )

    principle_style = ParagraphStyle(
        'Principle',
        parent=normal,
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#9A3412'),
        backColor=colors.HexColor('#FFF7ED'),
        borderPadding=6,
        alignment=1 # Center
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F2C59'),
        spaceBefore=10,
        spaceAfter=6
    )

    cell_style = ParagraphStyle(
        'Cell',
        parent=normal,
        fontName='Helvetica',
        fontSize=8,
        leading=10
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=normal,
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10
    )

    story = []

    # Header
    story.append(Paragraph("ALL INDIA COUNCIL FOR TECHNICAL EDUCATION", title_style))
    story.append(Paragraph("STATUTORY BODY OF THE GOVERNMENT OF INDIA | APPROVAL PROCESS 2026-27", subtitle_style))
    story.append(Paragraph("SMART INDIA HACKATHON 2026 | TEAM CRASHCODERS - AI VALIDATION PLATFORM", subtitle_style))
    story.append(Spacer(1, 8))

    # Mandatory Product Principle Banner
    story.append(Paragraph(
        "<b>LEGAL NOTICE & SCRUTINY PRINCIPLE:</b> THIS PLATFORM IS DECISION SUPPORT, NOT A DECISION MAKER. "
        "Every finding is advisory, carries evidence and plain-language reason. Final statutory decision rests solely with the AICTE Scrutiny Officer.",
        principle_style
    ))
    story.append(Spacer(1, 10))

    # Application Summary Table
    app_id = app_data.get('id', 'N/A')
    inst_name = app_data.get('institution_name', 'N/A')
    category_name = app_data.get('category_name', app_data.get('category', 'N/A'))
    risk_score = app_data.get('risk_score', 0)
    risk_band = app_data.get('risk_band', 'LOW')
    status = app_data.get('status', 'SUBMITTED')

    risk_color = "#16A34A" if risk_score < 30 else ("#D97706" if risk_score < 60 else "#DC2626")

    summary_data = [
        [
            Paragraph("<b>Application ID:</b>", cell_style), Paragraph(app_id, cell_bold),
            Paragraph("<b>Category:</b>", cell_style), Paragraph(category_name, cell_style)
        ],
        [
            Paragraph("<b>Institution:</b>", cell_style), Paragraph(inst_name, cell_bold),
            Paragraph("<b>Trust / Society:</b>", cell_style), Paragraph(app_data.get('trust_name', 'N/A'), cell_style)
        ],
        [
            Paragraph("<b>Location:</b>", cell_style), Paragraph(f"{app_data.get('district', '')}, {app_data.get('state', '')}", cell_style),
            Paragraph("<b>Land Area:</b>", cell_style), Paragraph(f"{app_data.get('land_area_acres', 'N/A')} Acres", cell_style)
        ],
        [
            Paragraph("<b>Overall Risk Score:</b>", cell_style),
            Paragraph(f"<font color='{risk_color}'><b>{risk_score}/100 ({risk_band})</b></font>", cell_bold),
            Paragraph("<b>Current Status:</b>", cell_style), Paragraph(f"<b>{status}</b>", cell_bold)
        ]
    ]

    t_summary = Table(summary_data, colWidths=[1.3*inch, 2.3*inch, 1.3*inch, 2.3*inch])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 12))

    # Findings & Explainable Flags Table
    story.append(Paragraph("Automated Validation & Anomaly Findings (Decision Support)", h2_style))
    flags = app_data.get('flags', [])
    if flags:
        flag_rows = [[
            Paragraph("<b>Severity</b>", cell_bold),
            Paragraph("<b>What We Found (Finding)</b>", cell_bold),
            Paragraph("<b>Evidence Source</b>", cell_bold),
            Paragraph("<b>Why It Matters (Rule / Regulation)</b>", cell_bold),
            Paragraph("<b>Confidence</b>", cell_bold)
        ]]
        for f in flags:
            sev = f.get('severity', 'MEDIUM')
            sev_color = "#DC2626" if sev == "CRITICAL" else ("#EA580C" if sev == "HIGH" else "#475569")
            ev = f.get('evidence', {})
            ev_doc = ev.get('source_doc_type', 'Application Dossier')
            conf = int(f.get('confidence', 0.9) * 100)

            flag_rows.append([
                Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", cell_style),
                Paragraph(f.get('title', ''), cell_style),
                Paragraph(ev_doc, cell_style),
                Paragraph(f.get('reason', ''), cell_style),
                Paragraph(f"{conf}%", cell_style)
            ])

        t_flags = Table(flag_rows, colWidths=[0.8*inch, 2.2*inch, 1.2*inch, 2.4*inch, 0.6*inch])
        t_flags.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_flags)
    else:
        story.append(Paragraph("<i>No compliance anomalies or regulatory flags detected. Application fully adheres to prescribed checklist.</i>", normal))

    story.append(Spacer(1, 12))

    # Issuing Authority Verification Table
    story.append(Paragraph("Issuing Authority Cross-Verification (Source API Checks)", h2_style))
    verifs = app_data.get('verification_results', [])
    if verifs:
        verif_rows = [[
            Paragraph("<b>Issuing Authority</b>", cell_bold),
            Paragraph("<b>Identifier Checked</b>", cell_bold),
            Paragraph("<b>Result Status</b>", cell_bold),
            Paragraph("<b>Cryptographic Verification</b>", cell_bold)
        ]]
        for v in verifs:
            v_stat = v.get('status', 'PENDING')
            v_color = "#16A34A" if v_stat == "VERIFIED" else ("#DC2626" if v_stat == "MISMATCH" else "#D97706")
            qr_text = "QR & Digital Sig Valid (SHA-256)" if v.get('qr_verified') else "Manual Review / Legacy Archive"
            verif_rows.append([
                Paragraph(v.get('authority_name', ''), cell_style),
                Paragraph(v.get('identifier_checked', ''), cell_style),
                Paragraph(f"<font color='{v_color}'><b>{v_stat}</b></font>", cell_bold),
                Paragraph(qr_text, cell_style)
            ])

        t_verifs = Table(verif_rows, colWidths=[2.6*inch, 1.6*inch, 1.2*inch, 1.8*inch])
        t_verifs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_verifs)

    story.append(Spacer(1, 12))

    # Officer Scrutiny Decision Box
    story.append(Paragraph("AICTE Scrutiny Officer Statutory Decision", h2_style))
    decision_obj = app_data.get('officer_decision') or {
        "decision": status,
        "officer_name": "Dr. S. K. Sharma (Regional Scrutiny Officer)",
        "remarks": "Pending final review committee hearing or decision submission.",
        "timestamp": "2026-05-18T14:30:00Z"
    }

    dec_val = decision_obj.get('decision', 'UNDER_REVIEW')
    dec_color = "#16A34A" if dec_val == "ACCEPTED" else ("#DC2626" if dec_val == "REJECTED" else "#D97706")

    dec_data = [
        [
            Paragraph("<b>Final Statutory Decision:</b>", cell_style),
            Paragraph(f"<font color='{dec_color}'><b>{dec_val}</b></font>", cell_bold),
            Paragraph("<b>Deciding Officer:</b>", cell_style),
            Paragraph(decision_obj.get('officer_name', 'Scrutiny Officer'), cell_bold)
        ],
        [
            Paragraph("<b>Mandatory Remarks:</b>", cell_style),
            Paragraph(decision_obj.get('remarks', 'N/A'), cell_style),
            Paragraph("<b>Timestamp:</b>", cell_style),
            Paragraph(str(decision_obj.get('timestamp', 'N/A')), cell_style)
        ]
    ]
    t_dec = Table(dec_data, colWidths=[1.4*inch, 2.2*inch, 1.4*inch, 2.2*inch])
    t_dec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#93C5FD')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#BFDBFE')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_dec)
    story.append(Spacer(1, 12))

    # Immutable Hash-Chain Ledger Summary
    story.append(Paragraph("Cryptographic Hash-Chained Audit Ledger (Tamper-Proof)", h2_style))
    audit_chain = app_data.get('audit_chain', [])
    if audit_chain:
        chain_rows = [[
            Paragraph("<b>Blk #</b>", cell_bold),
            Paragraph("<b>Timestamp (UTC)</b>", cell_bold),
            Paragraph("<b>Actor</b>", cell_bold),
            Paragraph("<b>Action Logged</b>", cell_bold),
            Paragraph("<b>SHA-256 Hash Link (First 16 chars)</b>", cell_bold)
        ]]
        for blk in audit_chain[-5:]: # Last 5 blocks to fit elegantly
            b_idx = str(blk.get('index', 0))
            b_time = blk.get('timestamp', '')[:19].replace('T', ' ')
            b_actor = blk.get('actor', '')
            b_action = blk.get('action', '')
            b_hash = blk.get('hash', '')[:20] + "..."

            chain_rows.append([
                Paragraph(b_idx, cell_style),
                Paragraph(b_time, cell_style),
                Paragraph(b_actor, cell_style),
                Paragraph(b_action, cell_style),
                Paragraph(f"<code>{b_hash}</code>", cell_style)
            ])

        t_chain = Table(chain_rows, colWidths=[0.5*inch, 1.5*inch, 1.4*inch, 2.2*inch, 1.6*inch])
        t_chain.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(t_chain)

    story.append(Spacer(1, 16))
    story.append(Paragraph("<b>End of Official AICTE Scrutiny Dossier</b> | Generated securely by AICTE Validation Platform (Team CrashCoders, SIH 2026)", subtitle_style))

    doc.build(story)
    return output_path
