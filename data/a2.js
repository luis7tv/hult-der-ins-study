window.DI_SESSIONS = window.DI_SESSIONS || [];
window.DI_SESSIONS.push({
  id: 'a2', n: 'A2', title: 'Tuition and earnings',
  sub: 'Team assignment. Two files that only answer the question together: merge, computed columns, payback years, baselines on both axes.',
  libs: ['pandas', 'matplotlib', 'seaborn'],
  cards: [
    { q: 'Why did A2 need two files?', a: 'tuition_cost.csv has the cost but not the pay. salary_potential.csv has the pay but not the cost. Return on cost needs both, so the files are joined on the school name and state.' },
    { q: 'How do you find out which schools have no room and board?', a: 'Filter to the rows where the column is null, then count another column.', code: "tuition[tuition['room_and_board'].isnull()]['degree_length'].value_counts()" },
    { q: 'How do you fix text so two files match?', a: 'str.replace on the column. The salary file wrote New-York with a dash; the tuition file wrote New York with a space.', code: "salary['state'] = salary['state_name'].str.replace('-', ' ')" },
    { q: 'How do you join two tables side by side?', a: 'pd.merge on the shared columns. By default it keeps only rows that appear in both files (an inner join). 724 of the 935 salary schools matched.', code: "combined = pd.merge(tuition, salary, on=['name', 'state'])" },
    { q: 'How do you check how many rows found a match?', a: 'Compare the lengths before and after the merge.', code: 'print("Schools matched:         ", len(combined))\nprint("Schools without a match: ", len(salary) - len(combined))' },
    { q: 'How do you list the rows that did NOT match?', a: 'isin against the matched names, then == False to flip it.', code: "salary[salary['name'].isin(combined['name']) == False]['name'].head(10)" },
    { q: 'How was payback years calculated?', a: 'Four years of in-state tuition divided by early career pay: the years of starting salary needed to pay the degree back.', code: "combined['cost_4yr'] = combined['in_state_tuition'] * 4\ncombined['payback_years'] = combined['cost_4yr'] / combined['early_career_pay']" },
    { q: 'How do you get the best 10 and the worst 10?', a: 'sort_values on payback_years, head(10). ascending=False for the worst.', code: "combined_sorted = combined.sort_values(by='payback_years')\ncombined_sorted[['name', 'type', 'payback_years']].head(10)\ncombined.sort_values(by='payback_years', ascending=False).head(10)" },
    { q: 'How many of the 50 best are public?', a: 'Take the first 50 sorted rows and count the type column.', code: "top_50 = combined_sorted.head(50)\ntop_50['type'].value_counts()" },
    { q: 'How do you put a baseline on both axes?', a: 'axhline for the horizontal (average pay), axvline for the vertical (average cost). Together they split the chart into four quadrants.', code: "ax.axhline(combined['early_career_pay'].mean(), color='gray', linestyle='--')\nax.axvline(combined['cost_4yr'].mean(), color='gray', linestyle='--')" },
    { q: 'How do you plot two groups in different colors with a legend?', a: 'One ax.scatter per group with its own label, then ax.legend().', code: "ax.scatter(public_c['cost_4yr'], public_c['early_career_pay'], label='Public', alpha=0.5)\nax.scatter(private_c['cost_4yr'], private_c['early_career_pay'], label='Private', alpha=0.5, color='orange')\nax.legend()" },
    { q: 'How do you find "best value" schools?', a: 'Two conditions with &: high pay and low cost.', code: "best_value = combined[(combined['early_career_pay'] > 60000) & (combined['in_state_tuition'] < 10000)]" },
    { q: 'How do you see which characteristic explains payback?', a: 'corr() on the chosen columns, read the payback_years column, sort it.', code: "combined[['payback_years', 'in_state_tuition', 'early_career_pay', 'stem_percent']].corr()['payback_years'].sort_values(ascending=False).round(3)" },
    { q: 'How did the notebook compare high-STEM and low-STEM schools?', a: 'A cutoff, two filters, then the same three averages printed for each group. Repeated for public schools only to control for type.', code: "stem_cutoff = 30\nhigh_stem = combined[combined['stem_percent'] >= stem_cutoff]\nlow_stem = combined[combined['stem_percent'] < stem_cutoff]\nprint(round(high_stem['payback_years'].mean(), 2), round(low_stem['payback_years'].mean(), 2))" },
    { q: 'Suspicious zeros, again', a: 'Many schools report 0% STEM. Like Insulin = 0 in Session 3, that is probably missing data recorded as zero. Count them before trusting a STEM comparison.', code: "print(\"Schools with 0% STEM:\", (salary['stem_percent'] == 0).sum())" },
    { q: 'How do you keep only four-year degrees?', a: 'A filter on degree_length.', code: "combined = combined[combined['degree_length'] == '4 Year']" },
    { q: 'How do you set the figure size with subplots?', a: 'figsize inside plt.subplots.', code: 'fig, ax = plt.subplots(figsize=(10, 6))' }
  ],
  quiz: [
    { t: 'fill', q: 'Join tuition and salary on name and state.', code: "combined = pd.____(tuition, salary, on=['name', 'state'])", a: ['merge'], why: 'merge joins side by side on keys. concat stacks top to bottom.' },
    { t: 'mc', q: 'By default, which rows does pd.merge keep?', o: ['Only schools whose name and state appear in both files', 'Every row from both files', 'All tuition rows, with blanks for missing salary', 'The first file only'], a: 0, why: 'The default is an inner join. 724 matched out of 935 salary schools.' },
    { t: 'fill', q: 'Replace the dash in state names with a space.', code: "salary['state'] = salary['state_name'].str.____('-', ' ')", a: ['replace'], why: 'str.replace runs on every value of a text column.' },
    { t: 'mc', q: 'The salary file has 935 schools and 724 matched. How many did not match?', o: ['211', '724', '935', '1659'], a: 0, why: '935 - 724 = 211. That is len(salary) - len(combined).' },
    { t: 'fill', q: 'Years of starting salary to pay back four years of tuition.', code: "combined['payback_years'] = combined['cost_4yr'] ____ combined['early_career_pay']", a: ['/'], why: 'Cost divided by yearly pay gives years.' },
    { t: 'fill', q: 'The 10 schools with the shortest payback.', code: "combined.sort_values(by='payback_years').____(10)", a: ['head'], why: 'Sorted ascending, head(10) is the ten smallest.' },
    { t: 'fill', q: 'Draw the vertical baseline at the average cost.', code: "ax.____(combined['cost_4yr'].mean(), color='gray', linestyle='--')", a: ['axvline'], why: 'axvline is vertical (a fixed x). axhline is horizontal.' },
    { t: 'mc', q: 'What does this return?', code: "salary[salary['name'].isin(combined['name']) == False]", o: ['Salary schools that found no match in the merge', 'Schools that matched', 'All salary schools', 'An error'], a: 0, why: 'isin marks matched names True; == False keeps the unmatched ones.' },
    { t: 'fill', q: 'Keep four-year degrees only.', code: "combined = combined[combined['degree_length'] ____ '4 Year']", a: ['=='], why: 'A single = would try to assign. == compares.' },
    { t: 'mc', q: 'What does top_50[\'type\'].value_counts() tell you?', o: ['How many of the 50 best-return schools are public and how many private', 'The 50 most common school types', 'The average type', 'The top 50 tuitions'], a: 0, why: 'value_counts on the type column of the 50 shortest-payback rows.' },
    { t: 'mc', q: 'Tuition 8,000 a year and early pay 64,000. Payback years?', o: ['0.5', '8', '2', '0.125'], a: 0, why: '8,000 x 4 = 32,000; 32,000 / 64,000 = 0.5 years.' },
    { t: 'fill', q: 'High pay AND low cost.', code: "combined[(combined['early_career_pay'] > 60000) ____ (combined['in_state_tuition'] < 10000)]", a: ['&'], why: '& for and, with parentheses around each condition.' },
    { t: 'mc', q: 'Which one joins two tables that share a key column?', o: ['pd.merge', 'pd.concat', 'pd.cut', 'pd.crosstab'], a: 0, why: 'merge joins on keys. concat stacks. cut bins. crosstab counts.' },
    { t: 'fill', q: 'Count schools reporting 0% STEM.', code: "(salary['stem_percent'] ____ 0).sum()", a: ['=='], why: 'The comparison gives True/False; sum() counts the Trues.' }
  ]
});
