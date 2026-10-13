window.DI_LEARN = window.DI_LEARN || {};

window.DI_LEARN.s1 = {
  intro: 'Your first charts with Matplotlib, and the one question a business audience always asks about a number: compared to what?',
  sections: [
    { h: 'Your first line chart', p: ['Matplotlib is the library that draws charts. You import it once and call it `plt`.', '`plt.subplots()` hands you two things: `fig`, the whole picture, and `ax`, the one plot inside it. You draw on `ax` and show the result with `plt.show()`.'],
      code: 'import matplotlib.pyplot as plt\n\nsquares = [1, 4, 9, 16, 25]\n\nfig, ax = plt.subplots()   # fig - entire figure, ax - single plot\nax.plot(squares)\nplt.show()' },
    { h: 'Titles, labels and line width', p: ['`linewidth=` makes the line thicker. `set_title`, `set_xlabel` and `set_ylabel` give the chart its words, each with a `fontsize=`. `tick_params(labelsize=)` sets the size of the numbers on the axes.'],
      code: 'fig, ax = plt.subplots()\nax.plot(squares, linewidth=3)\n\nax.set_title("Square Numbers", fontsize=24)\nax.set_xlabel("Value", fontsize=14)\nax.set_ylabel("Square of Value", fontsize=14)\nax.tick_params(labelsize=14)\nplt.show()' },
    { h: 'Give the chart both x and y', p: ['With one list, Matplotlib counts 0, 1, 2, 3, 4 for x. That is why 25 sat under 4 instead of 5.', 'Pass two lists, x first and y second, and every point lands where it should.'],
      code: 'input_values = [1, 2, 3, 4, 5]\nsquares = [1, 4, 9, 16, 25]\n\nfig, ax = plt.subplots()\nax.plot(input_values, squares, linewidth=3)\nplt.xticks(rotation=45)   # tilt long labels so they do not overlap\nplt.show()' },
    { h: 'Mean and median: what counts as normal?', p: ['A chart shows what happened. A business audience asks: compared to what? That needs a baseline.', 'The mean is the sum divided by the count. The median is the middle value after sorting. One disaster month at 10% pulls the mean from 3.66 to 4.07, but the median stays at 3.7. With outliers, the median is the safer "typical" number; report the outlier separately.'],
      code: 'mean_rate = sum(rates) / len(rates)\n\nfrom statistics import median\nmedian_rate = median(rates)\n\nprint("Mean:  ", round(mean_rate, 2))\nprint("Median:", median_rate)\nprint("Lowest: ", min(rates))\nprint("Highest:", max(rates))' },
    { h: 'Draw the baseline on the chart', p: ['`ax.axhline()` draws a horizontal line at a value, across the whole chart. Dashed and grey keeps it behind the data.', '`ax.text()` writes a small label at a position. `va=\'bottom\'` sits the text just above that point.'],
      code: "ax.plot(months, rates, linewidth=2)\nax.axhline(mean_rate, color='gray', linestyle='--')          # the baseline\nax.text(0, mean_rate, ' average', va='bottom', fontsize=12, color='gray')" },
    { h: 'Scatter charts', p: ['`ax.scatter()` draws one dot per point instead of a line. `s=` is the dot size.', "`plt.style.use('seaborn-v0_8')` changes the whole look: grey background, white grid. It is a style name, not the Seaborn library."],
      code: "plt.style.use('seaborn-v0_8')\nfig, ax = plt.subplots()\nax.scatter(x_values, y_values, s=100)\nplt.show()" },
    { h: 'Let Python make the numbers', p: ['Instead of typing 1, 4, 9, 16, 25, compute them. `range(1, 1001)` is 1 to 1000 (the stop is excluded). A list comprehension applies a formula to every number in one line.'],
      code: 'x_values = range(1, 1001)\ny_values = [x**2 for x in x_values]   # the square of every x\n\nax.scatter(x_values, y_values, s=10)' },
    { h: 'Color maps', p: ['A colormap is a gradient of one color. Give the values to `c=` and the gradient to `cmap=`, and each dot gets darker as its value grows.'],
      code: 'ax.scatter(x_values, y_values, c=y_values, cmap=plt.cm.Blues, s=10)' },
    { h: 'Save the chart for a deck', p: ["`plt.savefig('name.png')` writes the chart to a file next to the notebook. Call it before `plt.show()`, or the file comes out blank. Then download it and insert it into PowerPoint."],
      code: "plt.savefig('squares_plot.png')\nplt.show()" },
    { h: 'Case study: a random stock chart, your first class', p: ['A class is a blueprint for objects. `RandomWalk` keeps its own lists in `self.x_values` and `self.y_values`. `__init__` runs when you create one. `fill_walk()` keeps adding points until there are `num_points`.', 'Each step moves x one day forward and moves y up or down by a random amount from `choice()`. `[-1]` is the last item of a list.'],
      code: "from random import choice\n\nclass RandomWalk:\n  def __init__(self, num_points = 500):\n    self.num_points = num_points\n    self.x_values = [0]\n    self.y_values = [100]\n\n  def fill_walk(self):\n    while len(self.x_values) < self.num_points:\n      x = self.x_values[-1] + 1\n      y = self.y_values[-1] + choice([1, 0, -1]) * choice([1, 2, 3, 4, 5])\n      self.x_values.append(x)\n      self.y_values.append(y)\n\nrw = RandomWalk()   # create\nrw.fill_walk()      # calculate\nax.plot(rw.x_values, rw.y_values)" },
    { h: 'Reading stories into noise', p: ['Every one of those charts is pure randomness, yet each one looks like a story: a boom, a crash, a recovery. Your eyes find patterns whether or not they exist.', 'So before you call a trend real in business data, compare it to a baseline and ask whether chance could explain it.'] },
    { h: 'Polish: start, end and no axes', p: ['Extra `scatter` calls draw single dots on top: green for the start, red for the end. `edgecolors=\'none\'` removes the outline of each dot. `get_xaxis().set_visible(False)` hides an axis.'],
      code: "ax.scatter(rw.x_values[0], rw.y_values[0], c='green', edgecolors='none', s=100)\nax.scatter(rw.x_values[-1], rw.y_values[-1], c='red', edgecolors='none', s=100)\nax.get_xaxis().set_visible(False)\nax.get_yaxis().set_visible(False)" }
  ]
};

window.DI_LEARN.s2 = {
  intro: 'Real data from files. pandas loads a CSV, describe() summarizes a column in one line, spread tells you how much to trust the average, and Plotly puts earthquakes on a map.',
  sections: [
    { h: 'Load a CSV with pandas', p: ['pandas works with tables. `pd.read_csv()` reads a file into a DataFrame, a table with named columns. `df.head()` shows the first 5 rows. `df.shape` gives (rows, columns).'],
      code: "import pandas as pd\n\ndf = pd.read_csv('sitka_weather_2021_simple.csv')\ndf.head()\ndf.shape   # (364, 6)" },
    { h: 'Pick a column and plot it', p: ["`df['TMAX']` is one column, called a Series. Give it to `ax.plot()` and you have a line of the daily highs. Pass the dates as x to label the axis. `plt.xticks(range(0, len(dates), 30))` shows every 30th date and `fig.autofmt_xdate()` tilts them."],
      code: "dates = df['DATE']\nhighs = df['TMAX']\n\nfig, ax = plt.subplots()\nax.plot(dates, highs, color='red')\nplt.xticks(range(0, len(dates), 30))\nfig.autofmt_xdate()\nplt.show()" },
    { h: 'describe(): eight numbers in one line', p: ['count, mean, std, min, 25%, 50%, 75%, max. The 50% row is the median. When you need just one number, `mean()` gives the average.'],
      code: "df['TMAX'].describe()\n\nmean_high = df['TMAX'].mean()\nprint(\"Average high in 2021:\", round(mean_high, 1), \"F\")" },
    { h: 'Is the average useful?', p: ['The yearly average high was 49.7, but almost no day was near it: winter highs in the 30s, summer highs in the 60s.', 'An average is a good summary only when most values sit close to it. With seasons, outliers or a wide spread, report the spread too, or break the data into groups such as months.'] },
    { h: 'Highs and lows together, shaded', p: ['Two `ax.plot()` calls draw two lines. `alpha=` makes a line see-through. `ax.fill_between()` shades the area between them.'],
      code: "ax.plot(dates, highs, color='red', alpha=0.5)\nax.plot(dates, lows, color='blue', alpha=0.5)\nax.fill_between(dates, highs, lows, facecolor='blue', alpha=0.1)\n\nplt.savefig('high_low.png')\nplt.show()" },
    { h: 'Measuring spread', p: ['The standard deviation (`std`) says how far a typical value sits from the mean. Rule of thumb: about two thirds of values fall within one std of the mean.', "A new column is arithmetic between columns, row by row: `df['RANGE'] = df['TMAX'] - df['TMIN']`."],
      code: "print(\"Standard deviation:\", round(df['TMAX'].std(), 1))\n\ndf['RANGE'] = df['TMAX'] - df['TMIN']\ndf['RANGE'].describe()" },
    { h: 'Reading a JSON file', p: ['GeoJSON is JSON: dictionaries and lists nested inside each other. `Path().read_text()` reads the file as one string, `json.loads()` turns that string into Python data, and `json.dumps(indent=4)` writes it back out in a readable form.'],
      code: "from pathlib import Path\nimport json\n\npath = Path('eq_data_1_day_m1.geojson')\ncontents = path.read_text()\nall_eq_data = json.loads(contents)\n\nreadable_contents = json.dumps(all_eq_data, indent=4)" },
    { h: 'Pull values out of nested data', p: ["`'features'` is a list with one dictionary per earthquake. Each has `'properties'` (mag, title) and `'geometry'` with `'coordinates'` = [longitude, latitude, depth]. A for loop with `append` turns that into plain lists."],
      code: "all_eq_dicts = all_eq_data['features']\n\nmags, lons, lats = [], [], []\nfor eq_dict in all_eq_dicts:\n  mags.append(eq_dict['properties']['mag'])\n  lons.append(eq_dict['geometry']['coordinates'][0])\n  lats.append(eq_dict['geometry']['coordinates'][1])\n\npd.Series(mags).describe()   # a list has no describe(); a Series does" },
    { h: 'An interactive map with Plotly', p: ['Plotly Express makes charts you can zoom and hover. `px.scatter_geo()` puts a dot at each latitude and longitude. `size=` scales dots by magnitude, `color=` drives a color scale, `hover_name=` sets the hover text, `projection=` changes the map shape.'],
      code: "import plotly.express as px\n\nfig = px.scatter_geo(lat=lats, lon=lons, size=mags, title='Global Earthquakes',\n                     color=mags,\n                     color_continuous_scale='viridis',\n                     labels={'color': 'Magnitude'},\n                     projection='natural earth',\n                     hover_name=eq_titles)\nfig.show()" },
    { h: 'Pick a color scale', p: ["One hue that darkens (`'reds'`) reads as darker = more dangerous. `'viridis'` is colorblind-safe and prints in black and white. `'rainbow'` looks busy and the middle colors grab attention for no reason."] },
    { h: 'One day is not enough', p: ['Every conclusion on that map came from a single day of earthquakes. Big ones are rare, aftershocks look like many separate events, and the USGS records more small quakes inside the US.', 'Before advising a company to move a supplier, ask how much data you have and how much you would need. Decades, not days.'] }
  ]
};

window.DI_LEARN.s3 = {
  intro: 'pandas hands-on with 768 patients: pick rows and columns, filter, sort, drop, build a table, see the shape of a column, find missing data that pandas cannot see, and measure correlation.',
  sections: [
    { h: 'Load and check for blanks', p: ['`df.isnull().sum()` counts empty cells per column. Here it reports zero everywhere. Keep that in mind; it turns out to be misleading.'],
      code: "df = pd.read_csv('diabetes.csv')\ndf.head()\ndf.isnull().sum()" },
    { h: 'Select a column, a row, a cell', p: ["`df['Pregnancies']` is a column. `df.iloc[0]` is the first row by position; counting starts at 0, so `iloc[24]` is the 25th row. `df.iloc[0, 1]` is one cell: row 0, column 1."],
      code: "df['Pregnancies']      # a column\ndf.iloc[24]            # the 25th row\nprint(df.iloc[0, 1])   # row 0, column 1" },
    { h: 'Single versus double brackets', p: ["`df['Age']` gives a Series. `df[['Age']]` gives a DataFrame. Several columns need the double brackets with a list inside."],
      code: "df[['Pregnancies']]\ndf[['Age', 'Insulin', 'Outcome']]" },
    { h: 'Filter rows with a condition', p: ["`df['Outcome'] == 1` gives True or False for every row. Put it inside `df[...]` and only the True rows stay.", 'Two conditions: wrap each in parentheses and join with `&` (and) or `|` (or). `isin([30, 31, 32])` keeps rows whose value is in the list.'],
      code: "outcome_1 = df[df['Outcome'] == 1]\nskinthickness_30 = df[df['SkinThickness'] > 30]\nfiltered_df = df[(df['Glucose'] > 100) & (df['Glucose'] < 130)]\nages_30_31_32 = df[df['Age'].isin([30, 31, 32])]" },
    { h: 'Mini project: does high glucose mean diabetes?', p: ['Filter to each group and take the mean of Glucose: about 110 without diabetes, about 141 with. `.shape[0]` counts the rows of a filter, which gives the four-box comparison around a cutoff of 140.'],
      code: "avg_glucose_outcome_0 = df[df['Outcome'] == 0]['Glucose'].mean()\navg_glucose_outcome_1 = df[df['Outcome'] == 1]['Glucose'].mean()\n\nglucose_cutoff = 140\nh_glu_diab = df[(df['Glucose'] >= glucose_cutoff) & (df['Outcome'] == 1)].shape[0]" },
    { h: 'Your first Seaborn chart', p: ["Seaborn draws statistical charts straight from a DataFrame. `sns.boxplot(x='Outcome', y='Glucose', data=df)` compares the two groups. The box is the middle half of the values, the line is the median, the dots are outliers."],
      code: "import seaborn as sns\n\nplt.figure(figsize=(10, 6))\nsns.boxplot(x='Outcome', y='Glucose', data=df)\nplt.title('Comparison of Glucose Levels by Outcome')\nplt.show()" },
    { h: 'Build a DataFrame yourself', p: ['`pd.DataFrame()` on a list of dictionaries. Each dictionary is one row; its keys become the column names. `index=` names the rows.'],
      code: "scores = [\n    {'Subject': 'Mathematics', 'Score': 85, 'Grade': 'B'},\n    {'Subject': 'History', 'Score': 98, 'Grade': 'A'}\n]\nmy_df = pd.DataFrame(scores, index=['Student1', 'Student2'])" },
    { h: 'loc versus iloc', p: ["`loc` uses labels: `df.loc['Student1', 'Grade']`. `iloc` uses positions: `df.iloc[3]`. With `loc` a slice includes the end (2:4 is three rows); with `iloc` it excludes it (2:4 is two rows).", '`loc` on the left of `=` changes a value. Leave the column out and the whole row changes.'],
      code: 'my_df.loc[2:4, ["Grade", "Score"]]\nmy_df.loc["Student1":"Student3", "Grade"]\nmy_df.loc[(my_df["Score"] > 80) & (my_df["Remarks"] == "Excellent"), ["Score", "Grade"]]\n\nmy_df.loc["Student3", "Score"] = 97   # change one cell\nmy_df.iloc[[2, 3], [0, 1]]            # rows 2 and 3, columns 0 and 1' },
    { h: 'Drop, filter, reset', p: ['`drop([1, 4])` removes rows by index; `drop([...], axis=1)` removes columns. `filter()` is the opposite: it keeps what you list.', '`inplace=True` changes the table itself and returns None. Without it you get a new table and the original stays. `reset_index()` renumbers the rows after dropping.'],
      code: 'my_df2 = my_df.drop([1, 4])\nmy_df2.reset_index(inplace=True)\nmy_df2 = my_df.drop(["Subject", "Grade"], axis=1)\nmy_df2 = my_df.filter(["Score", "Grade"], axis=1)' },
    { h: 'Sort', p: ["`sort_values(by='Age')` sorts ascending. `ascending=False` puts the largest first. A list of columns breaks ties with the second one."],
      code: "df_sorted = df.sort_values(by='Age')\ndf_descending = df.sort_values(by='Age', ascending=False)\ndf_sort2 = df.sort_values(by=['Age', 'BloodPressure'])" },
    { h: 'The shape of a column', p: ["`describe()` gives eight numbers. A histogram shows the shape: `plot(kind='hist', bins=30)`. Glucose looks like a bell. Insulin is lopsided with a spike at zero, so its mean (79.8) and median (30.5) disagree. When a distribution is skewed, the mean gets pulled toward the tail."],
      code: "df['Glucose'].plot(kind='hist', bins=30, edgecolor='white')\nplt.title('Distribution of Glucose')\nplt.show()\n\nprint(\"Insulin - mean:\", round(df['Insulin'].mean(), 1), \" median:\", df['Insulin'].median())" },
    { h: 'Missing data that does not look missing', p: ['A living person cannot have an insulin level of 0. Those zeros are missing values that somebody typed as 0, and `isnull()` cannot see them. Count the zeros yourself and leave them out when you average.'],
      code: "for col in ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']:\n    zeros = (df[col] == 0).sum()\n    print(f\"{col:<15} zeros: {zeros:>4}   ({zeros/len(df):.0%} of rows)\")\n\ndf[df['Insulin'] > 0]['Insulin'].mean()   # excluding the zeros" },
    { h: 'Correlation', p: ['`df.corr()` gives a number from -1 to +1 for every pair of columns. Near 0 means no relationship, near +1 they rise together, near -1 one rises as the other falls. Pick one column to read it: Glucose relates most to the outcome, at 0.47.', 'Correlation is not causation. Age and Pregnancies correlate at 0.54, and neither causes the other.'],
      code: "df.corr().round(2)\ndf.corr()['Outcome'].sort_values(ascending=False).round(3)" },
    { h: 'Counting values', p: ['`unique()` lists the distinct values, `nunique()` counts how many there are, `value_counts()` counts rows per value, and `plot(kind=\'bar\')` charts that. `df.count()` counts non-null cells per column.'],
      code: "df['Age'].unique()\ndf['Age'].nunique()\ndf['Age'].value_counts()\n\nage_counts = df['Age'].value_counts()\nage_counts.plot(kind='bar')" }
  ]
};
