# 2026 MCM Problem C - Code Flowchart

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
│ Simulate Votes          │
│ - For each season       │
│ - For each week         │
│ - Multiple iterations   │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Validate Results        │
│ - Against actual        │
│   eliminations          │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Generate Charts         │
│ 1. Frequency histograms │
│ 2. Pie charts           │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Perform Sensitivity     │
│ Analysis                │
│ 1. Simulation count     │
│ 2. Noise levels         │
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│ Save Results            │
│ - CSV files             │
│ - Summary files         │
└─────────────────────────┘
```

## Flowchart Description

1. **Start Program**: Initialize the Monte Carlo simulation process for the 2026 MCM Problem C.

2. **Initialize Simulator**: Set up the MCMC simulator with appropriate parameters, including simulation mode (fast test or full simulation) and number of simulations.

3. **Load Data**: Read the necessary CSV files containing competition data, including judge scores and contestant information.

4. **Preprocess Data**: Handle missing values and prepare the data for simulation.

5. **Simulate Votes**: Execute multiple iterations of the Monte Carlo simulation to model audience votes for each season and week.

6. **Validate Results**: Validate the simulation results against actual elimination data to ensure the model's accuracy.

7. **Generate Charts**: Create various charts to visualize the simulation results:
   - Frequency Histograms: Show the distribution of vote shares for selected contestants
   - Pie Charts: Show the distribution of vote shares among contestants for selected seasons

8. **Perform Sensitivity Analysis**:
   - **Simulation Count**: Analyze how different numbers of simulations affect the results
   - **Noise Levels**: Analyze how different levels of noise in the input data affect the results

9. **Save Results**: Save the simulation results to CSV files and generate summary statistics for further reference.

## Key Functions

- `DWTSMonteCarloSimulator.__init__()`: Initialize the simulator with parameters
- `preprocess_data()`: Preprocess the data for simulation
- `get_week_contestants()`: Extract contestant data for a specific season and week
- `simulate_votes_for_week()`: Simulate votes for a single week
- `validate_simulation()`: Validate simulation results against actual eliminations
- `generate_frequency_histograms()`: Generate frequency distribution histograms
- `generate_pie_charts()`: Generate pie charts
- `sensitivity_analysis_mcmc_parameters()`: Perform sensitivity analysis on simulation parameters
- `sensitivity_analysis_noise_level()`: Perform sensitivity analysis on noise levels
- `main()`: Main function that orchestrates the entire simulation process