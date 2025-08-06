# An Interactive Visualization of AI's Environmental Impact
A repository for the final project of my Data, Computation and Innovation II class (MS Data Journalism, Columbia University, 2025)
By Lucia de la Torre, August 2025

## Project Overview
This project presents two interactive visualizations that explore the environmental impact of AI:

- A bar chart showing average energy consumption across different AI tasks.

- A world map illustrating regional differences in environmental impacts related to AI energy usage.

These visualizations communicate complex AI energy data clearly with engaging interactivity and transitions.

## How the Project Was Built
Data Preparation:
Curated and cleaned CSV files summarize energy consumption by AI task and regional environmental impact metrics for visualization.

## Visualizations:
Using D3.js (v7), the project features:

- An animated bar chart with hover tooltips highlighting energy use per AI task.

- An interactive choropleth world map with in-map toggle buttons switching between energy consumption (primary energy) and environmental depletion metrics, color-coded in orange and red respectively.

- Scaled map projections and data-driven fills aligned with best D3 practices.

- Tooltips and labels improve usability and accessibility.

## Project Structure:
Organized with separate JS files (bar_chart.js, map_chart.js), a CSS stylesheet (main.css), data stored in /data/, and a central index.html.

## Data Source
The visualized data comes from the Hugging Face AI Energy Score initiative — a transparent, peer-reviewed benchmarking project that quantifies AI model energy efficiency across popular tasks. Key points about these datasets include:

- Coverage of 10 common AI tasks based on real-world usage, such as text generation, image classification, and speech recognition, using pooled evaluation datasets of 1,000 samples per task.

- Benchmarks run on standardized NVIDIA H100 GPUs, measuring GPU watt-hours per 1,000 queries to enable apples-to-apples comparisons.

- Calculation of efficiency ratings supported by comprehensive measurement tools (CodeCarbon, Optimum Benchmark).

- Supplementation with regional environmental factors such as primary energy consumption and resource depletion for contextual impact assessment.

The Hugging Face AI Energy Score datasets are published at huggingface.co/AIEnergyScore/datasets. Full documentation and methodology are available on the project’s Hugging Face Hub and FAQ.

## Features and Interactivity
Bar chart animates bars in with smooth transitions, orders tasks by consumption, and shows detailed numeric tooltips.

Map uses a natural Earth projection, colors countries based on selected metric, supports toggling between energy and environmental impact, and includes informative tooltips and labels.

## Next Steps
- Expand regional data coverage to include additional countries and subregions.
- Incorporate additional environmental metrics such as carbon emissions or water use if data becomes available.
- Explore further interactivity—for example, scrollytelling or model-level drilldowns.

If you have questions or would like to discuss the project, please contact me at lg3394@columbia.edu.

Both graphics employ hover interactions and clear labels for enhanced understanding.

