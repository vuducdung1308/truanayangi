# Spending-based selection

Current model: default 50k VND per lunch; presets 35/50/75/100/150k and custom integer 30–180k. These are expected prices across independent draws, not a hard maximum or a promise for each meal. Prices remain approximate, with uneven source quality documented in food-price-audit-2026-09.md.

## Price and color

Fixed boundaries: blue <=40k, purple (40,65], pink (65,100], red (100,130], gold >130k. The label is assigned after selection and does not affect probability. No fixed gold/jackpot mass, no separate jackpot overlay, no pity mechanism. Gold cards retain their existing mystery artwork during the reel.

## Distribution

Let x_i=ln(c_i/50), n(c_i)=number of catalog meals with that exact price, and sigma=.2 (log-price width ~±20% around the selected spend). Use

p_i(theta) = exp(-x_i²/(2 sigma²) + theta*x_i) / n(c_i) / Z(theta).

Solve theta numerically so sum(p_i*c_i)=M. The log-price width is a product design choice to concentrate results near the selected spend; it is not estimated from Vietnamese diner behavior. This is a finite-catalog log-price kernel, not a continuous lognormal sample.

Equal prior weight per distinct price prevents adding variants at an existing price from increasing its total mass. Within a price group all meals have equal probability. A newly introduced price can still change the distribution; this does not claim to neutralize every possible catalog taxonomy change.

The derivative of expected cost with respect to theta is Cov(c,ln(c/50))>0 for unequal prices, so the interior solution is unique. Fixed upper price-tail probabilities are nondecreasing as theta and M increase. An intermediate tier can rise then fall. Log-sum-exp normalization avoids overflow; endpoint means are handled explicitly. The UI keeps targets away from catalog endpoints (25/260k) to avoid forced single-price outcomes.

Selector calculation is memoized on the selected mean, outside the open-click and animation paths. Reel filler conditions the same probabilities on recent-food exclusions, but never determines the independently selected winner.

## Current pool measurements

| Mean k | Blue % | Purple % | Pink % | Red % | Gold % | Within ±30% of mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 35 | 87.419 | 12.565 | .017 | 0 | 0 | 96.1% |
| 50 | 23.329 | 71.605 | 5.063 | .004 | 0 | 94.8% |
| 75 | .240 | 32.207 | 64.441 | 3.044 | .067 | 89.4% |
| 100 | .001 | 2.613 | 60.027 | 33.331 | 4.029 | 93.4% |
| 150 | 0 | .002 | 3.071 | 31.997 | 64.931 | 92.7% |

These are computed from the catalog's approximate prices, not measured purchase rates. They replace the earlier mean-only maximum-entropy plots. The old 51k + fixed .7% gold selector is no longer used.

## Vegetarian filter

Condition the full-pool distribution on vegetarian meals: p(i|veg)=p_i/sum_veg(p). Do not refit eight vegetarian choices to an exact 150k mean, which would force falafel every time. The UI explicitly shows the filtered expected price (~37k for the 50k setting, ~127k for 150k). Thus the displayed general spending preference remains the user's input while the filtered mean can differ. No hidden hard price cap applies.

## Validation

Run node tests/selection.cjs: exact means and normalization, 700,000 seeded draws over seven targets, concentration checks, cumulative tier monotonicity at every integer mean 30–180, equal-price duplicate neutrality, vegetarian conditional CDFs, and invalid/endpoint cases.

Browser checks in tests/spending-ui.cjs cover default/presets, all 116 items staying eligible, vegetarian disclosure, invalid custom input, narrow mobile layout and a 150k roll. tests/mobile-audio.cjs verifies audio/mute behavior; geometry regression checks confirm continuous leftward animation and correct pointer/winner after repeated rolls. Browser tests mock the global counter.
