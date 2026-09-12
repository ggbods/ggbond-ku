# New Rule Elimination - Code Flowchart

```
┌─────────────────────────┐
│ Start Program           │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Load Data               │
│ - Read CSV files        │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Preprocess Data         │
│ - Handle missing values │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Get Week Data           │
│ - For each season       │
│ - For each week         │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Simulate Elimination    │
│ - Apply new rules       │
│ - Consider both judge   │
│   scores and votes      │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Perform Sensitivity     │
│ Analysis                │
│ - Different elimination │
│   rules                 │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Visualize Results       │
│ - Generate charts       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Save Results            │
│ - Excel files           │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the elimination analysis process.

2. **Load Data**: Read the necessary CSV files containing ranking data and other relevant information.

3. **Preprocess Data**: Handle missing values and prepare the data for analysis.

4. **Get Week Data**: Extract data for each season and week to analyze elimination patterns.

5. **Simulate Elimination**: Apply the new elimination rules to simulate which contestants would be eliminated, considering both judge scores and audience votes.

6. **Perform Sensitivity Analysis**: Analyze how different elimination rules and parameters affect the elimination results.

7. **Visualize Results**: Generate charts to visualize the elimination results and sensitivity analysis findings.

8. **Save Results**: Save the elimination results to Excel files for further reference.

## Key Functions

- `load_data()`: Loads the necessary data files
- `preprocess_data()`: Preprocesses the data for analysis
- `get_week_data()`: Extracts data for each season and week
- `simulate_elimination()`: Simulates elimination based on new rules
- `sensitivity_analysis_elimination_rules()`: Performs sensitivity analysis on different elimination rules
- `visualize_sensitivity_analysis()`: Visualizes sensitivity analysis results
- `main()`: Main function that orchestrates the entire elimination analysis process