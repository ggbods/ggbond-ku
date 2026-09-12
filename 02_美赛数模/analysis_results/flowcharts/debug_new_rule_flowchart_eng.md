# Debug New Rule - Code Flowchart

```
┌─────────────────────────┐
│ Start Program           │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Imports            │
│ - Basic libraries       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Helper Functions   │
│ - Rank calculation      │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Data Loading       │
│ - Read CSV files        │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Week Data Extraction│
│ - For seasons and weeks │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Elimination        │
│ Simulation              │
│ - Apply new rules       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Sensitivity        │
│ Analysis                │
│ - Different weights     │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Test Visualization      │
│ - Generate charts       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Run Full Test           │
│ - Execute all functions │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the debugging process for the new elimination rule.

2. **Test Imports**: Verify that all necessary libraries are imported correctly.

3. **Test Helper Functions**: Test helper functions such as rank calculation to ensure they work correctly.

4. **Test Data Loading**: Test the data loading function to ensure it can read CSV files correctly.

5. **Test Week Data Extraction**: Test the function to extract data for each season and week.

6. **Test Elimination Simulation**: Test the elimination simulation function to ensure it correctly applies the new rules.

7. **Test Sensitivity Analysis**: Test the sensitivity analysis function to ensure it correctly analyzes different weight combinations.

8. **Test Visualization**: Test the visualization function to ensure it correctly generates charts.

9. **Run Full Test**: Execute all functions together to ensure the entire process works correctly.

## Key Functions

- `calculate_ranks()`: Calculates ranks based on input values
- `load_data()`: Loads the necessary data files
- `get_week_data()`: Extracts data for each season and week
- `simulate_elimination()`: Simulates elimination based on new rules
- `sensitivity_analysis_elimination()`: Performs sensitivity analysis on different weight combinations
- `visualize_sensitivity_analysis()`: Visualizes sensitivity analysis results
- `main test section`: Runs the full test process