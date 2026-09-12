# Feature Importance Analysis - Code Flowchart

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
│ - Merge datasets        │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Calculate Feature       │
│ Importance              │
│ - Use Random Forest      │
│ - Use Gradient Boosting  │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Visualize Feature       │
│ Importance              │
│ - Generate bar charts   │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Perform Sensitivity     │
│ Analysis                │
│ 1. Feature Sensitivity  │
│ 2. Parameter Sensitivity│
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Visualize Sensitivity   │
│ Analysis Results        │
│ - Generate charts       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Save Results            │
│ - CSV files             │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the analysis process.

2. **Load Data**: Read the necessary CSV files containing feature data and other relevant information.

3. **Preprocess Data**: Handle missing values, merge datasets, and prepare the data for analysis.

4. **Calculate Feature Importance**: Use Random Forest and Gradient Boosting algorithms to determine the importance of different features.

5. **Visualize Feature Importance**: Generate bar charts to display the importance of each feature.

6. **Perform Sensitivity Analysis**:
   - **Feature Sensitivity**: Analyze how changes in feature values affect the model predictions.
   - **Parameter Sensitivity**: Analyze how changes in model parameters affect the results.

7. **Visualize Sensitivity Analysis Results**: Generate charts to display the results of the sensitivity analysis.

8. **Save Results**: Save the analysis results to CSV files for further reference.

## Key Functions

- `load_data()`: Loads the necessary data files
- `preprocess_data()`: Preprocesses the data for analysis
- `calculate_feature_importance()`: Calculates feature importance using Random Forest and Gradient Boosting
- `sensitivity_analysis_feature()`: Performs feature sensitivity analysis
- `sensitivity_analysis_parameters()`: Performs parameter sensitivity analysis
- `visualize_feature_importance()`: Visualizes feature importance
- `visualize_sensitivity_analysis()`: Visualizes sensitivity analysis results
- `main()`: Main function that orchestrates the entire analysis process