window.DI_LIBS = [
  { id: 'pandas', name: 'pandas', imp: 'import pandas as pd', what: 'Tables. A DataFrame is a table with named columns; a Series is one column. Load files, select, filter, sort, summarize, join.', sessions: ['2', '3', '5', '6', '7', 'A2'],
    calls: [
      ['pd.read_csv(file, sep=";")', 'load a CSV'], ['df.head(n)', 'first rows'], ['df.shape', '(rows, columns)'], ['df.info()', 'types and non-null counts'],
      ['df["col"]  /  df[["a", "b"]]', 'Series / DataFrame'], ['df.iloc[3]  /  df.iloc[2:4, 0:2]', 'by position'], ['df.loc["label", "col"]', 'by label; slice includes the end'],
      ['df[(df.a > 1) & (df.b == 0)]', 'filter, & and | or'], ['df[df.a.isin([1, 2])]', 'value in list'], ['df.query("alcohol > 10.3")', 'filter as text'],
      ['df.describe()  .mean()  .median()  .std()', 'summaries'], ['df.isnull().sum()', 'blanks per column'], ['(df.a == 0).sum()', 'zeros that mean missing'],
      ['df.dropna()  df.fillna(v)', 'drop or fill missing'], ['df.duplicated().sum()  df.drop_duplicates()', 'repeats'], ['df.drop([...], axis=1, inplace=True)', 'drop rows (0) or columns (1)'],
      ['df.sort_values(by=col, ascending=False)', 'sort'], ['df.rename(columns={...})', 'rename'], ['df.set_index("id")  df.reset_index()', 'index'],
      ['s.unique()  s.nunique()  s.value_counts(normalize=True)', 'distinct values and counts'], ['s.map(dict)  s.apply(lambda x: ...)', 'transform each value'], ['s.astype(int)  s.str.extract(r"(\\d+)")  s.str.replace(a, b)', 'types and text'],
      ['df.groupby("g")["col"].mean()  .describe()  .agg(["mean", "size"])', 'per group'], ['pd.crosstab(a, b, normalize="index")', 'count two categoricals'], ['pd.cut(s, bins=edges, labels=names)', 'bin a number'],
      ['pd.concat([a, b], ignore_index=True)', 'stack rows'], ['pd.merge(a, b, on=["name", "state"])', 'join on keys'], ['df.corr()["target"]', 'correlation, -1 to 1'],
      ['pd.DataFrame(list_of_dicts)  pd.Series(list)', 'build from scratch'], ['s.plot(kind="hist" | "bar" | "box" | "pie")', 'quick charts'], ['pd.plotting.scatter_matrix(df)', 'every pair']
    ] },
  { id: 'matplotlib', name: 'Matplotlib', imp: 'import matplotlib.pyplot as plt', what: 'The basic chart library. Line, scatter, histogram. Titles, labels, baselines, colormaps, save to PNG.', sessions: ['1', '2', '3', '5', '6', '7', 'A2'],
    calls: [
      ['fig, ax = plt.subplots(figsize=(10, 6))', 'figure + one plot'], ['ax.plot(x, y, linewidth=2, color="red", alpha=.5)', 'line'], ['ax.scatter(x, y, s=100, c=vals, cmap=plt.cm.Blues)', 'dots'],
      ['ax.set_title()  ax.set_xlabel()  ax.set_ylabel()', 'titles'], ['ax.tick_params(labelsize=14)', 'tick number size'], ['plt.xticks(rotation=45)  plt.xticks(range(0, n, 30))', 'tick labels'],
      ['ax.axhline(y, linestyle="--")  ax.axvline(x)', 'baselines'], ['ax.text(x, y, "label", va="bottom", ha="right")', 'annotate'], ['ax.fill_between(x, hi, lo, alpha=.1)', 'shade a band'],
      ['ax.legend()  with label= on each series', 'legend'], ['fig.autofmt_xdate()', 'tilt date labels'], ['plt.style.use("seaborn-v0_8")', 'preset look'],
      ['plt.tight_layout()', 'fix overlapping subplots'], ['plt.savefig("x.png")  before  plt.show()', 'save'], ['ax.get_xaxis().set_visible(False)', 'hide an axis']
    ] },
  { id: 'seaborn', name: 'Seaborn', imp: 'import seaborn as sns', what: 'Statistical charts on top of matplotlib. Takes a DataFrame and column names directly, so a chart by group is one line.', sessions: ['3', '5', '6', 'A2'],
    calls: [
      ['sns.boxplot(x="group", y="value", data=df, order=[...])', 'box plot per category'], ['sns.scatterplot(x=, y=, data=df, s=20)', 'scatter from a DataFrame']
    ] },
  { id: 'plotly', name: 'Plotly Express', imp: 'import plotly.express as px', what: 'Interactive charts: zoom, pan, hover. Used for the earthquake world map.', sessions: ['2'],
    calls: [
      ['px.scatter_geo(lat=, lon=, size=, color=, hover_name=, projection="natural earth", color_continuous_scale="viridis")', 'dots on a map'], ['fig.show()', 'display'], ['px.colors.named_colorscales()', 'available scales']
    ] },
  { id: 'scipy', name: 'SciPy stats', imp: 'from scipy import stats', what: 'Hypothesis tests. Is the gap between two averages more than noise?', sessions: ['5'],
    calls: [
      ['stats.ttest_ind(a, b, equal_var=False)', 't-test on two groups; returns statistic and pvalue'], ['stats.ttest_ind_from_stats(mean1, std1, nobs1, mean2, std2, nobs2, equal_var=False)', 'same test from a summary table'], ['s.sem()', 'standard error of the mean (pandas)'], ['diff ± 1.96 * se', '95% interval']
    ] },
  { id: 'sklearn', name: 'scikit-learn', imp: 'from sklearn.linear_model import LinearRegression, LogisticRegression', what: 'Machine learning. Every model: create, fit, use. X is a table (double brackets), y is one column.', sessions: ['6', '7'],
    calls: [
      ['model = LinearRegression(); model.fit(X, y)', 'straight line'], ['model.coef_  model.intercept_', 'slope(s) and intercept'], ['model.predict(new_df)', 'predict'], ['model.score(X, y)', 'R squared (regression) or accuracy (classifier)'],
      ['LogisticRegression(max_iter=1000)', 'yes/no outcome, probabilities 0 to 1'], ['model.predict_proba(X)[:, 1]', 'probability of class 1'], ['from sklearn.tree import DecisionTreeClassifier, plot_tree', 'tree; max_depth=1 for one split; tree_.threshold[0]'], ['from sklearn.naive_bayes import GaussianNB', 'second opinion classifier']
    ] },
  { id: 'statsmodels', name: 'statsmodels', imp: 'import statsmodels.formula.api as smf', what: 'Regression with the full statistics table: coef, std err, 95% interval, P>|t|, R-squared, No. Observations.', sessions: ['7'],
    calls: [
      ['smf.ols("W ~ RD", data=df).fit()', 'fit from a formula'], ['"RS ~ OBP + SLG"', 'two predictors'], ['model.summary()', 'the table'], ['model.params["RD"]', 'one coefficient'], ['model.predict()', 'fitted values']
    ] },
  { id: 'stdlib', name: 'Python built-ins and standard library', imp: 'from statistics import median  /  from random import choice  /  import json  /  from pathlib import Path', what: 'What the course used from plain Python.', sessions: ['1', '2', '3', '5', '7'],
    calls: [
      ['sum(l) / len(l)  min()  max()  round(x, 1)', 'arithmetic'], ['median(l)', 'statistics module'], ['choice([1, 0, -1])', 'random pick'], ['range(1, 1001)', '1 to 1000, stop excluded'],
      ['[x**2 for x in xs]  {k: v for k in keys}', 'comprehensions'], ['l[-1]  l.append(x)  len(l)', 'lists'], ['d["key"]["nested"]', 'dictionaries'], ['json.loads(text)  json.dumps(obj, indent=4)', 'JSON'],
      ['Path(f).read_text()  .write_text(s)', 'files'], ['"a, b".count(",")  .split("/")[0]  .strip().lower().replace(" ", "_")', 'text'], ['f"{x:.1f}  {p:.1%}  {n:>4}  {s:<15}"', 'f-string formats'], ['class X:  def __init__(self, n=500):  self.n = n', 'classes'], ['zip(a, b)  isinstance(x, str)  lambda x: x + 1', 'helpers']
    ] },
  { id: 'numpy', name: 'NumPy', imp: 'import numpy as np', what: 'Math on arrays. Only np.sqrt appeared, in the interval for the difference of two means.', sessions: ['5', '6'],
    calls: [['np.sqrt(a.sem()**2 + b.sem()**2)', 'standard error of a difference']] }
];
