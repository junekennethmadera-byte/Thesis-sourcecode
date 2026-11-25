# Reporting And Charts

Implemented reports:
- Archived thesis count
- Pending approvals
- Originality averages
- Research categories
- Thesis volume per school year
- User activity monitoring
- Authenticated CSV export at `GET /api/reports/manuscripts.csv` for admins and faculty

The dashboard consumes the analytics endpoint for the summary charts. The
institution must still approve final report formats, retention periods, and
the evidence from usability evaluation.
