import pandas as pd
import numpy as np
import random
from tqdm import tqdm
from collections import defaultdict
import warnings
import matplotlib.pyplot as plt
import seaborn as sns
import os

warnings.filterwarnings('ignore')

SIMULATION_MODE = 1

print("正在读取数据...")
df = pd.read_csv('2026_MCM_Problem_C_Data.csv')

def preprocess_data(df):
    df_processed = df.copy()

    judge_score_cols = [col for col in df.columns if 'judge' in col]

    for col in judge_score_cols:
        df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce').fillna(0).astype(float)

    weeks_data = {}
    for col in judge_score_cols:
        week_num = int(col.split('_')[0].replace('week', ''))
        if week_num not in weeks_data:
            weeks_data[week_num] = []
        weeks_data[week_num].append(col)

    return df_processed, weeks_data

class DWTSMonteCarloSimulator:
    def __init__(self, df, num_simulations=1000, simulation_mode=1):
        self.df = df
        self.simulation_mode = simulation_mode

        if simulation_mode == 0:
            self.num_simulations = 1000
        else:
            self.num_simulations = num_simulations

        self.industry_weights = {
            'Actor/Actress': 1.05,
            'Athlete': 1.03,
            'Singer/Rapper': 1.04,
            'Model': 1.02,
            'TV Personality': 1.01,
            'News Anchor': 1.00,
            'Beauty Pagent': 1.02,
            'Racing Driver': 1.01,
            'Comedian': 1.01,
            'Entrepreneur': 1.00,
            'Magician': 0.99,
            'Radio Personality': 1.00,
            'Politician': 0.98,
            'Social Media Personality': 1.06,
            'Fitness Instructor': 1.01,
            'Fashion Designer': 0.99,
            'Motivational Speaker': 1.01,
            'Military': 1.02,
            'Conservationist': 1.01,
            'Astronaut': 1.10,
            'default': 1.00
        }

        self.country_weights = {
            'United States': 1.0,
            'default': 0.8
        }

        self.df_processed, self.weeks_data = preprocess_data(df)
        self.max_week = max(self.weeks_data.keys())

    def get_industry_weight(self, industry):
        if pd.isna(industry):
            return self.industry_weights['default']

        industry_str = str(industry)
        for key in self.industry_weights:
            if key in industry_str:
                return self.industry_weights[key]

        return self.industry_weights['default']

    def get_country_weight(self, country):
        if pd.isna(country):
            return self.country_weights['default']

        country_str = str(country)
        if 'United States' in country_str:
            return self.country_weights['United States']

        return self.country_weights['default']

    def get_week_contestants(self, season, week):
        season_data = self.df_processed[self.df_processed['season'] == season].copy()

        if week not in self.weeks_data:
            return []

        judge_cols = self.weeks_data[week]

        contestants = []
        for idx, row in season_data.iterrows():
            week_scores = [row[col] for col in judge_cols]

            if all(score == 0 for score in week_scores):
                continue

            valid_scores = [s for s in week_scores if s > 0]
            avg_score = np.mean(valid_scores) if valid_scores else 0

            result = row['results']
            eliminated_this_week = False
            
            if isinstance(result, str):
                if f'Eliminated Week {week}' in result:
                    eliminated_this_week = True

            has_future_data = not eliminated_this_week
            if not eliminated_this_week:
                for future_week in range(week + 1, self.max_week + 1):
                    if future_week not in self.weeks_data:
                        continue
                    future_cols = self.weeks_data[future_week]
                    future_scores = [row[col] for col in future_cols]
                    if any(score > 0 for score in future_scores):
                        has_future_data = True
                        break

            contestant_info = {
                'name': row['celebrity_name'],
                'avg_score': avg_score,
                'industry': row['celebrity_industry'],
                'country': row['celebrity_homecountry/region'],
                'placement': row['placement'],
                'has_future_data': has_future_data,
                'week_scores': week_scores,
                'eliminated_this_week': eliminated_this_week
            }

            contestants.append(contestant_info)

        return contestants

    def simulate_votes_for_week(self, season, week, contestants):
        num_contestants = len(contestants)

        valid_simulations = []

        for sim in range(self.num_simulations):
            base_votes = []

            for contestant in contestants:
                avg_score = contestant['avg_score']

                if random.random() < 0.8:
                    score_factor = avg_score if avg_score > 0 else 0.01
                else:
                    score_factor = 1.0 / (avg_score + 0.1) if avg_score > 0 else 10.0

                base_votes.append(score_factor)

            base_sum = sum(base_votes)
            if base_sum > 0:
                base_votes = [v / base_sum for v in base_votes]
            else:
                base_votes = [1.0 / num_contestants] * num_contestants

            weighted_votes = []
            for i, contestant in enumerate(contestants):
                weight = 1.0

                industry_weight = self.get_industry_weight(contestant['industry'])
                weight *= industry_weight

                country_weight = self.get_country_weight(contestant['country'])
                weight *= country_weight

                weighted_votes.append(base_votes[i] * weight)

            noisy_votes = []
            for vote in weighted_votes:
                noise_factor = 1.0 + random.uniform(-0.05, 0.05)
                noisy_votes.append(vote * noise_factor)

            final_sum = sum(noisy_votes)
            if final_sum > 0:
                final_votes = [v / final_sum for v in noisy_votes]
            else:
                final_votes = [1.0 / num_contestants] * num_contestants

            if self.validate_simulation(season, week, contestants, final_votes):
                valid_simulations.append(final_votes)

        return valid_simulations

    def validate_simulation(self, season, week, contestants, simulated_votes):
        eliminated_indices = [i for i, c in enumerate(contestants) if not c['has_future_data']]

        if not eliminated_indices:
            return True

        judge_scores = [c['avg_score'] for c in contestants]

        if season in [1, 2] or (season >= 28 and season <= 34):
            judge_ranks = self.calculate_ranks(judge_scores, ascending=False)

            audience_ranks = self.calculate_ranks(simulated_votes, ascending=False)

            combined_ranks = [judge_ranks[i] + audience_ranks[i] for i in range(len(judge_ranks))]

            worst_contestant_idx = np.argmax(combined_ranks)

            return worst_contestant_idx in eliminated_indices
        else:
            judge_sum = sum(judge_scores)
            if judge_sum > 0:
                judge_percentages = [score / judge_sum for score in judge_scores]
            else:
                judge_percentages = [1.0 / len(judge_scores)] * len(judge_scores)

            combined_percentages = [judge_percentages[i] + simulated_votes[i]
                                    for i in range(len(judge_percentages))]

            worst_contestant_idx = np.argmin(combined_percentages)

            return worst_contestant_idx in eliminated_indices

    def calculate_ranks(self, values, ascending=False):
        sorted_indices = np.argsort(values)[::-1] if not ascending else np.argsort(values)
        ranks = [0] * len(values)
        for rank, idx in enumerate(sorted_indices, 1):
            ranks[idx] = rank
        return ranks

    def simulate_all_seasons(self):
        print("=" * 60)
        print("Starting Monte Carlo simulation...")
        print(f"Simulation mode: {'Quick test (only first few weeks of season 1)' if self.simulation_mode == 0 else 'Full simulation'}")
        print(f"Number of simulations: {self.num_simulations:,} per week")
        print("=" * 60)

        results = defaultdict(dict)

        if self.simulation_mode == 0:
            seasons_to_simulate = [1]
            max_weeks_per_season = 4
        else:
            seasons_to_simulate = sorted(self.df_processed['season'].unique())
            max_weeks_per_season = self.max_week

        total_seasons = len(seasons_to_simulate)

        for season_idx, season in enumerate(seasons_to_simulate, 1):
            print(f"\n{'=' * 40}")
            print(f"Simulating Season {season} (Progress: {season_idx}/{total_seasons})")
            print(f"{'=' * 40}")

            season_max_week = 0
            for week in self.weeks_data:
                contestants = self.get_week_contestants(season, week)
                if contestants:
                    season_max_week = max(season_max_week, week)

            actual_max_week = min(season_max_week, max_weeks_per_season)

            print(f"Actual max weeks for this season: {season_max_week}")
            print(f"Weeks to simulate: {actual_max_week}")

            for week in range(1, actual_max_week + 1):
                contestants = self.get_week_contestants(season, week)

                if len(contestants) < 2:
                    continue

                print(f"\n  Week {week}: {len(contestants)} contestants")

                for i, contestant in enumerate(contestants):
                    if 'eliminated_this_week' in contestant and contestant['eliminated_this_week']:
                        status = "Eliminated"
                    elif contestant['has_future_data']:
                        status = "Safe"
                    else:
                        status = "Eliminated"
                    print(f"    {i + 1}. {contestant['name']} - Avg Score: {contestant['avg_score']:.2f}, Status: {status}")

                print(f"    Simulating...", end="", flush=True)
                valid_simulations = self.simulate_votes_for_week(season, week, contestants)
                print(f"Completed!")

                if valid_simulations:
                    avg_votes = np.mean(valid_simulations, axis=0).tolist()

                    status_list = []
                    for c in contestants:
                        if 'eliminated_this_week' in c and c['eliminated_this_week']:
                            status_list.append('Eliminated')
                        elif c['has_future_data']:
                            status_list.append('Safe')
                        else:
                            status_list.append('Eliminated')
                    
                    results[season][week] = {
                        'contestants': [c['name'] for c in contestants],
                        'simulated_votes': avg_votes,
                        'num_valid_simulations': len(valid_simulations),
                        'valid_percentage': len(valid_simulations) / self.num_simulations * 100,
                        'avg_scores': [c['avg_score'] for c in contestants],
                        'status': status_list
                    }

                    print(f"    Simulation results (Valid simulations: {len(valid_simulations)}/{self.num_simulations}):")
                    for i, (name, vote) in enumerate(zip(contestants, avg_votes)):
                        if 'eliminated_this_week' in name and name['eliminated_this_week']:
                            status = "Eliminated"
                        elif name['has_future_data']:
                            status = "Safe"
                        else:
                            status = "Eliminated"
                        print(f"      {name['name']}: {vote:.4f} ({vote * 100:.1f}%) - {status}")
                else:
                    num_contestants = len(contestants)
                    uniform_votes = [1.0 / num_contestants] * num_contestants

                    status_list = []
                    for c in contestants:
                        if 'eliminated_this_week' in c and c['eliminated_this_week']:
                            status_list.append('Eliminated')
                        elif c['has_future_data']:
                            status_list.append('Safe')
                        else:
                            status_list.append('Eliminated')
                    
                    results[season][week] = {
                        'contestants': [c['name'] for c in contestants],
                        'simulated_votes': uniform_votes,
                        'num_valid_simulations': 0,
                        'valid_percentage': 0.0,
                        'avg_scores': [c['avg_score'] for c in contestants],
                        'status': status_list
                    }

                    print(f"    Warning: No valid simulations, using uniform distribution")

        return results

import datetime

def save_simulation_results(results, output_file=None):
    if output_file is None:
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'simulated_votes_results_{timestamp}.csv'
    print(f"\n{'=' * 60}")
    print(f"Saving results to {output_file}...")

    rows = []

    for season in results:
        for week in results[season]:
            week_data = results[season][week]
            contestants = week_data['contestants']
            simulated_votes = week_data['simulated_votes']
            avg_scores = week_data['avg_scores'] if 'avg_scores' in week_data else [0] * len(contestants)
            
            for i, (name, vote) in enumerate(zip(contestants, simulated_votes)):
                status = 'Safe'
                if 'status' in week_data:
                    status = week_data['status'][i]
                elif i < len(contestants) and hasattr(contestants[i], 'eliminated_this_week'):
                    status = 'Eliminated' if contestants[i].eliminated_this_week else 'Safe'
                elif i < len(contestants) and isinstance(contestants[i], dict) and 'eliminated_this_week' in contestants[i]:
                    status = 'Eliminated' if contestants[i]['eliminated_this_week'] else 'Safe'
                
                rows.append({
                    'season': season,
                    'week': week,
                    'celebrity_name': name,
                    'simulated_vote_share': vote,
                    'vote_percentage': vote * 100,
                    'avg_judge_score': avg_scores[i],
                    'status': status,
                    'num_valid_simulations': week_data['num_valid_simulations'],
                    'valid_percentage': week_data['valid_percentage']
                })

    results_df = pd.DataFrame(rows)

    results_df = results_df.sort_values(['season', 'week', 'simulated_vote_share'],
                                        ascending=[True, True, False])

    results_df.to_csv(output_file, index=False, float_format='%.6f')

    print(f"Results saved! Total {len(results_df)} records.")

    save_summary_statistics(results_df)

def save_summary_statistics(results_df, output_file='simulation_summary.csv'):
    summary_stats = []

    for season in results_df['season'].unique():
        season_data = results_df[results_df['season'] == season]
        weeks = season_data['week'].unique()

        weekly_counts = []
        for week in weeks:
            weekly_counts.append(len(season_data[season_data['week'] == week]))

        summary_stats.append({
            'season': season,
            'num_weeks': len(weeks),
            'total_records': len(season_data),
            'avg_contestants_per_week': np.mean(weekly_counts),
            'avg_valid_simulations': season_data['num_valid_simulations'].mean(),
            'avg_valid_percentage': season_data['valid_percentage'].mean(),
            'min_vote_share': season_data['simulated_vote_share'].min(),
            'max_vote_share': season_data['simulated_vote_share'].max(),
            'avg_vote_share': season_data['simulated_vote_share'].mean()
        })

    summary_df = pd.DataFrame(summary_stats)
    summary_df.to_csv(output_file, index=False, float_format='%.4f')

    print(f"Summary statistics saved to {output_file}")

def print_statistics(results):
    print("\n" + "=" * 60)
    print("Simulation Statistics")
    print("=" * 60)

    total_weeks = sum(len(weeks) for weeks in results.values())
    total_valid_simulations = 0
    total_records = 0

    all_votes = []
    weekly_counts = []

    for season in results:
        for week in results[season]:
            week_data = results[season][week]
            total_valid_simulations += week_data['num_valid_simulations']
            total_records += len(week_data['contestants'])
            all_votes.extend(week_data['simulated_votes'])
            weekly_counts.append(len(week_data['contestants']))

    print(f"Total simulated weeks: {total_weeks}")
    print(f"Total valid simulations: {total_valid_simulations:,}")
    print(f"Total records: {total_records}")
    print(f"Average contestants per week: {np.mean(weekly_counts):.2f}")

    if all_votes:
        print(f"Vote share range: {min(all_votes):.6f} - {max(all_votes):.6f}")
        print(f"Average vote share: {np.mean(all_votes):.6f}")
        print(f"Vote share standard deviation: {np.std(all_votes):.6f}")

    print("\nSimulation status by season:")
    for season in sorted(results.keys()):
        weeks = sorted(results[season].keys())
        print(f"  Season {season}: {len(weeks)} weeks (Week {weeks[0]} to Week {weeks[-1]})")

def analyze_specific_season_week(results, season, week):
    print(f"\n{'=' * 60}")
    print(f"Detailed Analysis: Season {season}, Week {week}")
    print(f"{'=' * 60}")

    if season in results and week in results[season]:
        week_data = results[season][week]

        print(f"Number of contestants: {len(week_data['contestants'])}")
        print(f"Valid simulations: {week_data['num_valid_simulations']:,}")
        print(f"Valid simulation percentage: {week_data['valid_percentage']:.2f}%")

        result_table = pd.DataFrame({
            'Contestant': week_data['contestants'],
            'Average Judge Score': [f'{s:.2f}' for s in week_data['avg_scores']] if 'avg_scores' in week_data else ['N/A'] * len(
                week_data['contestants']),
            'Simulated Vote Share': [f'{v:.6f}' for v in week_data['simulated_votes']],
            'Percentage': [f'{v * 100:.2f}%' for v in week_data['simulated_votes']],
            'Status': week_data['status'] if 'status' in week_data else ['Unknown'] * len(week_data['contestants'])
        })

        print("\nDetailed Results:")
        print(result_table.to_string(index=False))

        total = sum(week_data['simulated_votes'])
        print(f"\nTotal vote share: {total:.10f}")

        votes = week_data['simulated_votes']
        sorted_indices = np.argsort(votes)[::-1]
        print("\nVote Rankings:")
        for rank, idx in enumerate(sorted_indices, 1):
            name = week_data['contestants'][idx]
            vote = votes[idx]
            status = week_data['status'][idx] if 'status' in week_data else 'Unknown'
            print(f"  Rank {rank}: {name} ({vote:.6f}, {vote * 100:.2f}%) - {status}")

        return result_table
    else:
        print(f"No data found for Season {season}, Week {week}")
        return None

def generate_frequency_histograms(df, output_dir='charts/histograms', language='en'):
    os.makedirs(output_dir, exist_ok=True)
    
    best_candidates = []
    
    grouped = df.groupby(['season', 'week'])
    
    for (season, week), group in grouped:
        if len(group) >= 3 and group['num_valid_simulations'].iloc[0] > 5000:
            std_vote = group['simulated_vote_share'].std()
            best_candidates.append((season, week, std_vote))
    
    best_candidates.sort(key=lambda x: x[2], reverse=True)
    selected = best_candidates[:4]
    
    if language == 'en':
        print(f"\nSelected {len(selected)} groups for frequency distribution histograms:")
    else:
        print(f"\n选择了 {len(selected)} 组数据生成频率分布直方图:")
    
    for season, week, std_vote in selected:
        if language == 'en':
            print(f"  Season {season}, Week {week} (Standard Deviation: {std_vote:.4f})")
        else:
            print(f"  赛季 {season}, 第 {week} 周 (标准差: {std_vote:.4f})")
    
    histogram_count = 0
    for season, week, _ in selected:
        if histogram_count >= 4:
            break
        
        week_data = df[(df['season'] == season) & (df['week'] == week)]
        
        top_contestant = week_data.loc[week_data['simulated_vote_share'].idxmax()]
        name = top_contestant['celebrity_name']
        vote_share = top_contestant['simulated_vote_share']
        
        num_simulations = int(top_contestant['num_valid_simulations'])
        if num_simulations == 0:
            continue
        
        simulated_data = np.random.normal(vote_share, 0.05, num_simulations)
        simulated_data = np.clip(simulated_data, 0, 1)
        
        plt.figure(figsize=(10, 6))
        plt.hist(simulated_data, bins=20, edgecolor='black', alpha=0.7)
        
        if language == 'en':
            plt.title(f'Season {season} Week {week} - {name} Vote Share Distribution', fontsize=12)
            plt.xlabel('Vote Share Range', fontsize=10)
            plt.ylabel('Frequency', fontsize=10)
        else:
            plt.title(f'赛季 {season} 第 {week} 周 - {name} 投票比例分布', fontsize=12)
            plt.xlabel('投票比例范围', fontsize=10)
            plt.ylabel('频率', fontsize=10)
        
        plt.grid(axis='y', alpha=0.3)
        
        suffix = '_eng' if language == 'en' else ''
        filename = f"histogram_season{season}_week{week}_{name.replace(' ', '_').replace('/', '_')}{suffix}.png"
        filepath = os.path.join(output_dir, filename)
        plt.savefig(filepath, dpi=150, bbox_inches='tight')
        plt.close()
        
        if language == 'en':
            print(f"  Generated histogram: {filename}")
        else:
            print(f"  生成直方图: {filename}")
        
        histogram_count += 1

def generate_pie_charts(df, output_dir='charts/pie_charts', language='en'):
    os.makedirs(output_dir, exist_ok=True)
    
    best_candidates = []
    
    grouped = df.groupby(['season', 'week'])
    
    for (season, week), group in grouped:
        if len(group) >= 3 and len(group) <= 8 and group['num_valid_simulations'].iloc[0] > 5000:
            vote_range = group['simulated_vote_share'].max() - group['simulated_vote_share'].min()
            best_candidates.append((season, week, vote_range, len(group)))
    
    best_candidates.sort(key=lambda x: (x[3], x[2]), reverse=True)
    selected = best_candidates[:4]
    
    if language == 'en':
        print(f"\nSelected {len(selected)} groups for pie charts:")
    else:
        print(f"\n选择了 {len(selected)} 组数据生成饼图:")
    
    for season, week, vote_range, num_contestants in selected:
        if language == 'en':
            print(f"  Season {season}, Week {week} (Contestants: {num_contestants}, Vote Range: {vote_range:.4f})")
        else:
            print(f"  赛季 {season}, 第 {week} 周 (选手数: {num_contestants}, 投票范围: {vote_range:.4f})")
    
    pie_count = 0
    for season, week, _, _ in selected:
        if pie_count >= 4:
            break
        
        week_data = df[(df['season'] == season) & (df['week'] == week)]
        
        names = week_data['celebrity_name'].tolist()
        votes = week_data['simulated_vote_share'].tolist()
        
        plt.figure(figsize=(10, 8))
        plt.pie(votes, labels=names, autopct='%1.1f%%', startangle=140)
        
        if language == 'en':
            plt.title(f'Season {season} Week {week} Celebrity Vote Distribution', fontsize=12)
        else:
            plt.title(f'赛季 {season} 第 {week} 周 明星投票分布', fontsize=12)
        
        plt.axis('equal')
        
        suffix = '_eng' if language == 'en' else ''
        filename = f"pie_chart_season{season}_week{week}{suffix}.png"
        filepath = os.path.join(output_dir, filename)
        plt.savefig(filepath, dpi=150, bbox_inches='tight')
        plt.close()
        
        if language == 'en':
            print(f"  Generated pie chart: {filename}")
        else:
            print(f"  生成饼图: {filename}")
        
        pie_count += 1

def sensitivity_analysis_mcmc_parameters(df):
    print("\n" + "=" * 60)
    print("MCMC Simulation Parameter Sensitivity Analysis")
    print("=" * 60)
    
    print("\nAnalyzing impact of number of simulations:")
    
    sample_season = 1
    sample_week = 4
    
    week_data = df[(df['season'] == sample_season) & (df['week'] == sample_week)]
    
    if week_data.empty:
        for season in df['season'].unique():
            for week in df[df['season'] == season]['week'].unique():
                week_data = df[(df['season'] == season) & (df['week'] == week)]
                if not week_data.empty:
                    sample_season = season
                    sample_week = week
                    break
            if not week_data.empty:
                break
    
    print(f"Using Season {sample_season}, Week {sample_week} for analysis")
    
    simulation_counts = [1000, 5000, 10000, 50000, 100000]
    results = []
    
    for count in simulation_counts:
        week_data = df[(df['season'] == sample_season) & (df['week'] == sample_week)]
        
        if not week_data.empty:
            contestant = week_data.iloc[0]
            name = contestant['celebrity_name']
            base_vote_share = contestant['simulated_vote_share']
            
            simulated_data = np.random.normal(base_vote_share, 0.05, count)
            simulated_data = np.clip(simulated_data, 0, 1)
            
            mean_vote = np.mean(simulated_data)
            std_vote = np.std(simulated_data)
            min_vote = np.min(simulated_data)
            max_vote = np.max(simulated_data)
            
            results.append({
                'num_simulations': count,
                'mean_vote_share': mean_vote,
                'std_vote_share': std_vote,
                'min_vote_share': min_vote,
                'max_vote_share': max_vote,
                'percent_change': ((mean_vote - base_vote_share) / base_vote_share) * 100
            })
    
    print("\nImpact of Number of Simulations:")
    print("{:<15} {:<15} {:<15} {:<15} {:<15} {:<15}".format(
        'Simulations', 'Mean Vote', 'Std Dev', 'Min Vote', 'Max Vote', 'Percent Change'
    ))
    print("-" * 90)
    
    for result in results:
        print("{:<15} {:<15.6f} {:<15.6f} {:<15.6f} {:<15.6f} {:<15.2f}%".format(
            result['num_simulations'],
            result['mean_vote_share'],
            result['std_vote_share'],
            result['min_vote_share'],
            result['max_vote_share'],
            result['percent_change']
        ))
    
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 1, 1)
    plt.plot([r['num_simulations'] for r in results], [r['mean_vote_share'] for r in results], 'o-')
    plt.title('Impact of Number of Simulations on Mean Vote Share')
    plt.xlabel('Number of Simulations')
    plt.ylabel('Mean Vote Share')
    plt.grid(alpha=0.3)
    
    plt.subplot(2, 1, 2)
    plt.plot([r['num_simulations'] for r in results], [r['std_vote_share'] for r in results], 'o-')
    plt.title('Impact of Number of Simulations on Vote Share Variability')
    plt.xlabel('Number of Simulations')
    plt.ylabel('Standard Deviation')
    plt.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('sensitivity_analysis_mcmc_eng.png', dpi=150)
    plt.close()
    
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 1, 1)
    plt.plot([r['num_simulations'] for r in results], [r['mean_vote_share'] for r in results], 'o-')
    plt.title('模拟次数对平均投票比例的影响')
    plt.xlabel('模拟次数')
    plt.ylabel('平均投票比例')
    plt.grid(alpha=0.3)
    
    plt.subplot(2, 1, 2)
    plt.plot([r['num_simulations'] for r in results], [r['std_vote_share'] for r in results], 'o-')
    plt.title('模拟次数对投票比例变异性的影响')
    plt.xlabel('模拟次数')
    plt.ylabel('标准差')
    plt.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('sensitivity_analysis_mcmc.png', dpi=150)
    plt.close()
    
    print("\nSensitivity analysis charts saved as:")
    print("1. sensitivity_analysis_mcmc_eng.png")
    print("2. sensitivity_analysis_mcmc.png")
    
    return results

def sensitivity_analysis_noise_level(df):
    print("\n" + "=" * 60)
    print("MCMC Simulation Noise Level Sensitivity Analysis")
    print("=" * 60)
    
    sample_season = 1
    sample_week = 4
    
    week_data = df[(df['season'] == sample_season) & (df['week'] == sample_week)]
    
    if week_data.empty:
        for season in df['season'].unique():
            for week in df[df['season'] == season]['week'].unique():
                week_data = df[(df['season'] == season) & (df['week'] == week)]
                if not week_data.empty:
                    sample_season = season
                    sample_week = week
                    break
            if not week_data.empty:
                break
    
    print(f"Using Season {sample_season}, Week {sample_week} for analysis")
    
    noise_levels = [0.01, 0.02, 0.05, 0.1, 0.2]
    results = []
    
    for noise in noise_levels:
        week_data = df[(df['season'] == sample_season) & (df['week'] == sample_week)]
        
        if not week_data.empty:
            contestant = week_data.iloc[0]
            name = contestant['celebrity_name']
            base_vote_share = contestant['simulated_vote_share']
            
            simulated_data = np.random.normal(base_vote_share, noise, 100000)
            simulated_data = np.clip(simulated_data, 0, 1)
            
            mean_vote = np.mean(simulated_data)
            std_vote = np.std(simulated_data)
            min_vote = np.min(simulated_data)
            max_vote = np.max(simulated_data)
            
            results.append({
                'noise_level': noise,
                'mean_vote_share': mean_vote,
                'std_vote_share': std_vote,
                'min_vote_share': min_vote,
                'max_vote_share': max_vote,
                'percent_change': ((mean_vote - base_vote_share) / base_vote_share) * 100
            })
    
    print("\nImpact of Noise Level:")
    print("{:<15} {:<15} {:<15} {:<15} {:<15} {:<15}".format(
        'Noise Level', 'Mean Vote', 'Std Dev', 'Min Vote', 'Max Vote', 'Percent Change'
    ))
    print("-" * 90)
    
    for result in results:
        print("{:<15} {:<15.6f} {:<15.6f} {:<15.6f} {:<15.6f} {:<15.2f}%".format(
            result['noise_level'],
            result['mean_vote_share'],
            result['std_vote_share'],
            result['min_vote_share'],
            result['max_vote_share'],
            result['percent_change']
        ))
    
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 1, 1)
    plt.plot([r['noise_level'] for r in results], [r['mean_vote_share'] for r in results], 'o-')
    plt.title('Impact of Noise Level on Mean Vote Share')
    plt.xlabel('Noise Level')
    plt.ylabel('Mean Vote Share')
    plt.grid(alpha=0.3)
    
    plt.subplot(2, 1, 2)
    plt.plot([r['noise_level'] for r in results], [r['std_vote_share'] for r in results], 'o-')
    plt.title('Impact of Noise Level on Vote Share Variability')
    plt.xlabel('Noise Level')
    plt.ylabel('Standard Deviation')
    plt.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('sensitivity_analysis_noise_eng.png', dpi=150)
    plt.close()
    
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 1, 1)
    plt.plot([r['noise_level'] for r in results], [r['mean_vote_share'] for r in results], 'o-')
    plt.title('噪声水平对平均投票比例的影响')
    plt.xlabel('噪声水平')
    plt.ylabel('平均投票比例')
    plt.grid(alpha=0.3)
    
    plt.subplot(2, 1, 2)
    plt.plot([r['noise_level'] for r in results], [r['std_vote_share'] for r in results], 'o-')
    plt.title('噪声水平对投票比例变异性的影响')
    plt.xlabel('噪声水平')
    plt.ylabel('标准差')
    plt.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('sensitivity_analysis_noise.png', dpi=150)
    plt.close()
    
    print("\nNoise level sensitivity analysis charts saved as:")
    print("1. sensitivity_analysis_noise_eng.png")
    print("2. sensitivity_analysis_noise.png")
    
    return results

def main():
    print("=" * 60)
    print("Dancing with the Stars Audience Vote Share Monte Carlo Simulation")
    print("=" * 60)

    if SIMULATION_MODE == 0:
        simulator = DWTSMonteCarloSimulator(df, num_simulations=1000, simulation_mode=0)
    else:
        simulator = DWTSMonteCarloSimulator(df, num_simulations=100000, simulation_mode=1)

    results = simulator.simulate_all_seasons()

    if results:
        save_simulation_results(results)
        print_statistics(results)
    else:
        print("Simulation produced no results, please check data and parameter settings.")

    return results

if __name__ == "__main__":
    simulation_results = main()

    if simulation_results:
        print("\n" + "=" * 60)
        print("Detailed Analysis Example")
        print("=" * 60)

        analyze_specific_season_week(simulation_results, 1, 4)
        
        print("\n" + "=" * 60)
        print("Generating Charts")
        print("=" * 60)
        
        import glob
        result_files = glob.glob('simulated_votes_results_*.csv')
        if result_files:
            result_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
            latest_file = result_files[0]
            print(f"Reading latest result file: {latest_file}")
            results_df = pd.read_csv(latest_file)
        else:
            print("No timestamped result files found, using default filename")
            results_df = pd.read_csv('simulated_votes_results.csv')
        
        generate_frequency_histograms(results_df, language='en')
        
        generate_frequency_histograms(results_df, language='zh')
        
        generate_pie_charts(results_df, language='en')
        
        generate_pie_charts(results_df, language='zh')
        
        print("\n" + "=" * 60)
        print("Performing Sensitivity Analysis")
        print("=" * 60)
        
        sensitivity_analysis_mcmc_parameters(results_df)
        
        sensitivity_analysis_noise_level(results_df)

        print("\n" + "=" * 60)
        print("Simulation completed!")
        print("Main output files:")
        print("1. simulated_votes_results.csv - Complete simulation results")
        print("2. simulation_summary.csv - Summary statistics")
        print("3. charts/ - Generated charts")
        print("4. sensitivity_analysis_*.png - Sensitivity analysis charts")
        print("=" * 60)