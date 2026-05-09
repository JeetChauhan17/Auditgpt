# Altman Z-Score Model

Developed by Edward Altman in 1968 to predict corporate bankruptcy.

## Formula
Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 1.0*X5

Where:
- X1 = Working Capital / Total Assets (liquidity)
- X2 = Retained Earnings / Total Assets (profitability over time)
- X3 = EBIT / Total Assets (operating efficiency)
- X4 = Market Value of Equity / Total Liabilities (solvency)
- X5 = Sales / Total Assets (asset utilization)

## Zones
- Z > 3.0: Safe zone — low probability of bankruptcy
- 1.8 < Z < 3.0: Grey zone — moderate risk
- Z < 1.8: Distress zone — high probability of bankruptcy

## In Fraud Detection Context
While designed for bankruptcy prediction, the Z-Score is valuable in fraud detection because:
1. Deteriorating Z-Score alongside "strong" reported earnings = manipulation red flag
2. Companies in distress have stronger incentive to manipulate
3. X3 (EBIT/Total Assets) catches earnings inflation when total assets are inflated
4. Rapid Z-Score decline signals something fundamentally wrong

## Industry Considerations
- Banking/financial companies: Z-Score is less meaningful (different asset structure)
- IT Services: Typically Z > 3.0 due to asset-light model
- Capital-intensive sectors (Power, Metals): Z naturally lower, use 1.5 as threshold
