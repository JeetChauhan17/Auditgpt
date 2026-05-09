# Beneish M-Score Model

The Beneish M-Score is a mathematical model that uses financial ratios to detect earnings manipulation. Developed by Professor Messod Beneish in 1999.

## Formula
M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI

## Threshold
- M > -1.78: High probability of manipulation
- M < -1.78: Low probability of manipulation

## Component Interpretation
- **DSRI (Days Sales in Receivables Index)**: Rising DSRI suggests revenue inflation or fictitious sales. DSRI > 1.5 is concerning.
- **GMI (Gross Margin Index)**: GMI > 1 means deteriorating margins, motivating manipulation.
- **AQI (Asset Quality Index)**: Rising AQI suggests asset capitalization to inflate earnings.
- **SGI (Sales Growth Index)**: High growth creates pressure to maintain trajectory.
- **DEPI (Depreciation Index)**: Slowing depreciation inflates earnings.
- **SGAI (SGA Expense Index)**: Disproportionate SGA changes suggest cost manipulation.
- **TATA (Total Accruals to Total Assets)**: High accruals relative to cash = red flag.
- **LVGI (Leverage Index)**: Rising leverage increases incentive to manipulate.

## Key Insight
The most powerful indicator is TATA — when reported earnings significantly exceed operating cash flow, the "earnings" exist only on paper. This was the primary signal in the Satyam fraud.
