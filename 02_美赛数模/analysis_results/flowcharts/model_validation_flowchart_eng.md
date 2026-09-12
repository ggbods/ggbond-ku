# Model Validation - Code Flowchart

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
│ Run Validation Tests    │
│ 1. Consistency Test     │
│ 2. Determinism Test     │
│ 3. Stability Test       │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Generate Validation     │
│ Charts                  │
│ - Confidence intervals  │
│ - Heatmaps              │
│ - Entropy distribution  │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Perform Sensitivity     │
│ Analysis                │
│ - Validation parameters │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Save Results            │
│ - CSV files             │
│ - Excel files           │
│ - Text files            │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the validation process.

2. **Load Data**: Read the necessary CSV files containing model results and other relevant information.

3. **Preprocess Data**: Handle missing values and prepare the data for validation.

4. **Run Validation Tests**:
   - **Consistency Test**: Test the consistency of model predictions across different runs.
   - **Determinism Test**: Test the determinism of the model under identical conditions.
   - **Stability Test**: Test the stability of the model over time and across different inputs.

5. **Generate Validation Charts**: Create various charts to visualize the validation results, including confidence intervals, heatmaps, and entropy distribution.

6. **Perform Sensitivity Analysis**: Analyze how changes in validation parameters affect the validation results.

7. **Save Results**: Save the validation results to CSV, Excel, and text files for further reference.

## Key Functions

- `load_validation_data()`: Loads the necessary data files for validation
- `run_consistency_test()`: Runs consistency tests on model predictions
- `run_determinism_test()`: Runs determinism tests on the model
- `run_stability_test()`: Runs stability tests on the model
- `generate_validation_charts()`: Generates various validation charts
- `sensitivity_analysis_validation()`: Performs sensitivity analysis on validation parameters
- `run_all_validations()`: Runs all validation tests and generates results
- `main()`: Main function that orchestrates the entire validation process