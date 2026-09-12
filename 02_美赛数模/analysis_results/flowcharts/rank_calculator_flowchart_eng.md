# Rank Calculator - Code Flowchart

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
│ Calculate Ranks         │
│ - For each season       │
│ - For each week         │
│ - Apply different methods│
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Perform Sensitivity     │
│ Analysis                │
│ 1. Weight combinations  │
│ 2. Noise levels         │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Visualize Results       │
│ - Generate charts       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Save Results            │
│ - CSV files             │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the rank calculation process.

2. **Load Data**: Read the necessary CSV files containing judge scores, audience votes, and other relevant information.

3. **Preprocess Data**: Handle missing values and prepare the data for rank calculation.

4. **Calculate Ranks**: Calculate ranks for each season and week using different ranking methods:
   - Rank Combination Method: Sum of judge ranks and audience vote ranks
   - Percentage Combination Method: Sum of judge score percentages and audience vote percentages

5. **Perform Sensitivity Analysis**:
   - **Weight Combinations**: Analyze how different weight combinations between judge scores and audience votes affect the rankings.
   - **Noise Levels**: Analyze how different levels of noise in the input data affect the rankings.

6. **Visualize Results**: Generate charts to visualize the ranking results and sensitivity analysis findings.

7. **Save Results**: Save the ranking results to CSV files for further reference.

## Key Functions

- `load_data()`: Loads the necessary data files
- `preprocess_judge_data()`: Preprocesses the judge score data
- `get_week_judge_scores()`: Extracts judge scores for a specific season and week
- `get_week_vote_data()`: Extracts vote data for a specific season and week
- `calculate_ranks()`: Calculates ranks based on input values
- `calculate_weekly_ranks()`: Calculates weekly ranks using different methods
- `sensitivity_analysis_rank_methods()`: Performs sensitivity analysis on different ranking methods
- `sensitivity_analysis_noise_level()`: Performs sensitivity analysis on different noise levels
- `visualize_sensitivity_analysis()`: Visualizes sensitivity analysis results
- `main()`: Main function that orchestrates the entire rank calculation process