# MCMC Simulation - Code Flowchart

```
┌─────────────────────────┐
│ Start Program           │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Initialize Simulator    │
│ - Set parameters        │
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
│ Run MCMC Simulation     │
│ - Multiple iterations   │
│ - Validate results      │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Generate Frequency      │
│ Histograms              │
│ - For selected seasons  │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Generate Pie Charts     │
│ - For selected seasons  │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Perform Sensitivity     │
│ Analysis                │
│ 1. Parameter Sensitivity│
│ 2. Noise Level Sensitivity│
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Save Results            │
│ - CSV files             │
│ - Excel files           │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the simulation process.

2. **Initialize Simulator**: Set up the MCMC simulator with appropriate parameters.

3. **Load Data**: Read the necessary CSV files containing competition data and other relevant information.

4. **Preprocess Data**: Handle missing values and prepare the data for simulation.

5. **Run MCMC Simulation**: Execute multiple iterations of the Monte Carlo simulation to model audience votes, and validate the results against actual elimination data.

6. **Generate Frequency Histograms**: Create frequency distribution histograms for selected seasons and contestants to visualize vote distribution patterns.

7. **Generate Pie Charts**: Create pie charts for selected seasons to visualize vote share distribution among contestants.

8. **Perform Sensitivity Analysis**:
   - **Parameter Sensitivity**: Analyze how changes in simulation parameters affect the results.
   - **Noise Level Sensitivity**: Analyze how changes in noise levels affect the results.

9. **Save Results**: Save the simulation results to CSV and Excel files for further reference.

## Key Functions

- `DWTSMonteCarloSimulator.__init__()`: Initialize the simulator with parameters
- `load_data()`: Loads the necessary data files
- `preprocess_data()`: Preprocesses the data for simulation
- `simulate_votes_for_week()`: Simulate votes for a single week
- `validate_simulation()`: Validate simulation results against actual data
- `generate_frequency_histograms()`: Generate frequency distribution histograms
- `generate_pie_charts()`: Generate pie charts
- `sensitivity_analysis_mcmc_parameters()`: Perform parameter sensitivity analysis
- `sensitivity_analysis_noise_level()`: Perform noise level sensitivity analysis
- `main()`: Main function that orchestrates the entire simulation process