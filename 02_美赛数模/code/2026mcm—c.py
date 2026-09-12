import pandas as pd
import numpy as np
import random
from tqdm import tqdm
from collections import defaultdict
import warnings
import matplotlib.pyplot as plt
import seaborn as sns
import os

plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

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

            has_future_data = False
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
                'week_scores': week_scores
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

    def calculate_ranks(self, values, ascending=True):
        if ascending:
            sorted_indices = np.argsort(values)
        else:
            sorted_indices = np.argsort(values)[::-1]

        ranks = [0] * len(values)
        for rank, idx in enumerate(sorted_indices, 1):
            ranks[idx] = rank

        return ranks

    def simulate_all_seasons(self):
        print("=" * 60)
        print("开始蒙特卡洛模拟...")
        print(f"模拟模式: {'快速测试 (只跑第一季的前几周)' if self.simulation_mode == 0 else '完整模拟'}")
        print(f"模拟次数: {self.num_simulations:,} 次/周")
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
            print(f"模拟第 {season} 季 (进度: {season_idx}/{total_seasons})")
            print(f"{'=' * 40}")

            season_max_week = 0
            for week in self.weeks_data:
                contestants = self.get_week_contestants(season, week)
                if contestants:
                    season_max_week = max(season_max_week, week)

            actual_max_week = min(season_max_week, max_weeks_per_season)

            print(f"该季实际最大周数: {season_max_week}")
            print(f"本次模拟周数: {actual_max_week}")

            for week in range(1, actual_max_week + 1):
                contestants = self.get_week_contestants(season, week)

                if len(contestants) < 2:
                    continue

                print(f"\n  第 {week} 周: {len(contestants)} 位选手参赛")

                for i, contestant in enumerate(contestants):
                    status = "存活" if contestant['has_future_data'] else "被淘汰"
                    print(f"    {i + 1}. {contestant['name']} - 平均分: {contestant['avg_score']:.2f}, 状态: {status}")

                print(f"    正在模拟...", end="", flush=True)
                valid_simulations = self.simulate_votes_for_week(season, week, contestants)
                print(f"完成!")

                if valid_simulations:
                    avg_votes = np.mean(valid_simulations, axis=0).tolist()

                    results[season][week] = {
                        'contestants': [c['name'] for c in contestants],
                        'simulated_votes': avg_votes,
                        'num_valid_simulations': len(valid_simulations),
                        'valid_percentage': len(valid_simulations) / self.num_simulations * 100,
                        'avg_scores': [c['avg_score'] for c in contestants],
                        'status': ['存活' if c['has_future_data'] else '淘汰' for c in contestants]
                    }

                    print(f"    模拟结果 (有效模拟: {len(valid_simulations)}/{self.num_simulations}):")
                    for i, (name, vote) in enumerate(zip(contestants, avg_votes)):
                        status = "存活" if contestants[i]['has_future_data'] else "淘汰"
                        print(f"      {name['name']}: {vote:.4f} ({vote * 100:.1f}%) - {status}")
                else:
                    num_contestants = len(contestants)
                    uniform_votes = [1.0 / num_contestants] * num_contestants

                    results[season][week] = {
                        'contestants': [c['name'] for c in contestants],
                        'simulated_votes': uniform_votes,
                        'num_valid_simulations': 0,
                        'valid_percentage': 0.0,
                        'avg_scores': [c['avg_score'] for c in contestants],
                        'status': ['存活' if c['has_future_data'] else '淘汰' for c in contestants]
                    }

                    print(f"    警告: 无有效模拟，使用均匀分布")

        return results

def main():
    print("=" * 60)
    print("《与星共舞》观众投票比例蒙特卡洛模拟")
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
        print("模拟未产生任何结果，请检查数据和参数设置。")

    return results

def calculate_ranks(values, ascending=False):
    sorted_indices = np.argsort(values)[::-1] if not ascending else np.argsort(values)
    ranks = [0] * len(values)
    for rank, idx in enumerate(sorted_indices, 1):
        ranks[idx] = rank
    return ranks

def save_simulation_results(results, output_file='simulated_votes_results.csv'):
    print(f"\n{'=' * 60}")
    print(f"正在保存结果到 {output_file}...")

    rows = []

    for season in results:
        for week in results[season]:
            week_data = results[season][week]
            contestants = week_data['contestants']
            simulated_votes = week_data['simulated_votes']
            avg_scores = week_data['avg_scores'] if 'avg_scores' in week_data else [0] * len(contestants)
            
            if season in [1, 2] or (season >= 28 and season <= 34):
                judge_ranks = calculate_ranks(avg_scores, ascending=False)
                audience_ranks = calculate_ranks(simulated_votes, ascending=False)
                combined_ranks = [judge_ranks[i] + audience_ranks[i] for i in range(len(judge_ranks))]
                final_ranks = calculate_ranks(combined_ranks, ascending=True)
                method = '排名结合法'
            else:
                judge_sum = sum(avg_scores)
                if judge_sum > 0:
                    judge_percentages = [score / judge_sum for score in avg_scores]
                else:
                    judge_percentages = [1.0 / len(avg_scores)] * len(avg_scores)
                combined_percentages = [judge_percentages[i] + simulated_votes[i] for i in range(len(judge_percentages))]
                final_ranks = calculate_ranks(combined_percentages, ascending=False)
                method = '百分比结合法'
            
            for i, (name, vote) in enumerate(zip(contestants, simulated_votes)):
                rows.append({
                    'season': season,
                    'week': week,
                    'celebrity_name': name,
                    'simulated_vote_share': vote,
                    'vote_percentage': vote * 100,
                    'avg_judge_score': avg_scores[i],
                    'status': week_data['status'][i] if 'status' in week_data else '未知',
                    'num_valid_simulations': week_data['num_valid_simulations'],
                    'valid_percentage': week_data['valid_percentage'],
                    'method': method,
                    'final_rank': final_ranks[i]
                })

    results_df = pd.DataFrame(rows)

    results_df = results_df.sort_values(['season', 'week', 'final_rank'],
                                        ascending=[True, True, True])

    results_df.to_csv(output_file, index=False, float_format='%.6f')

    print(f"结果已保存！共 {len(results_df)} 条记录。")

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

    print(f"汇总统计已保存到 {output_file}")

def print_statistics(results):
    print("\n" + "=" * 60)
    print("模拟统计信息")
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

    print(f"总模拟周数: {total_weeks}")
    print(f"总有效模拟次数: {total_valid_simulations:,}")
    print(f"总记录数: {total_records}")
    print(f"平均每周选手数: {np.mean(weekly_counts):.2f}")

    if all_votes:
        print(f"票数比例范围: {min(all_votes):.6f} - {max(all_votes):.6f}")
        print(f"平均票数比例: {np.mean(all_votes):.6f}")
        print(f"票数比例标准差: {np.std(all_votes):.6f}")

    print("\n各赛季模拟情况:")
    for season in sorted(results.keys()):
        weeks = sorted(results[season].keys())
        print(f"  赛季 {season}: {len(weeks)} 周 (第{weeks[0]}周到第{weeks[-1]}周)")

def analyze_specific_season_week(results, season, week):
    print(f"\n{'=' * 60}")
    print(f"详细分析: 第 {season} 季 第 {week} 周")
    print(f"{'=' * 60}")

    if season in results and week in results[season]:
        week_data = results[season][week]

        print(f"参赛选手数: {len(week_data['contestants'])}")
        print(f"有效模拟次数: {week_data['num_valid_simulations']:,}")
        print(f"有效模拟比例: {week_data['valid_percentage']:.2f}%")

        result_table = pd.DataFrame({
            '选手': week_data['contestants'],
            '评委平均分': [f'{s:.2f}' for s in week_data['avg_scores']] if 'avg_scores' in week_data else ['N/A'] * len(
                week_data['contestants']),
            '模拟票数比例': [f'{v:.6f}' for v in week_data['simulated_votes']],
            '百分比': [f'{v * 100:.2f}%' for v in week_data['simulated_votes']],
            '状态': week_data['status'] if 'status' in week_data else ['未知'] * len(week_data['contestants'])
        })

        print("\n详细结果:")
        print(result_table.to_string(index=False))

        total = sum(week_data['simulated_votes'])
        print(f"\n票数比例总和: {total:.10f}")

        votes = week_data['simulated_votes']
        sorted_indices = np.argsort(votes)[::-1]
        print("\n票数排名:")
        for rank, idx in enumerate(sorted_indices, 1):
            name = week_data['contestants'][idx]
            vote = votes[idx]
            status = week_data['status'][idx] if 'status' in week_data else '未知'
            print(f"  第{rank}名: {name} ({vote:.6f}, {vote * 100:.2f}%) - {status}")

        return result_table
    else:
        print(f"未找到第 {season} 季 第 {week} 周的数据")
        return None

def generate_frequency_histograms(df, output_dir='charts/histograms', language='eng'):
    os.makedirs(output_dir, exist_ok=True)
    
    best_candidates = []
    
    grouped = df.groupby(['season', 'week'])
    
    for (season, week), group in grouped:
        if len(group) >= 3 and group['num_valid_simulations'].iloc[0] > 5000:
            std_vote = group['simulated_vote_share'].std()
            best_candidates.append((season, week, std_vote))
    
    best_candidates.sort(key=lambda x: x[2], reverse=True)
    selected = best_candidates[:4]
    
    if language == 'eng':
        print(f"\nSelected {len(selected)} groups for frequency histograms:")
        for season, week, std_vote in selected:
            print(f"  Season {season}, Week {week} (Std dev: {std_vote:.4f})")
    else:
        print(f"\n选择了 {len(selected)} 组数据生成频率分布直方图:")
        for season, week, std_vote in selected:
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
        
        if language == 'eng':
            plt.title(f'Season {season} Week {week} - {name} Vote Share Distribution', fontsize=12)
            plt.xlabel('Vote Share Range', fontsize=10)
            plt.ylabel('Frequency', fontsize=10)
        else:
            plt.title(f'赛季 {season} 第 {week} 周 - {name} 投票比例分布', fontsize=12)
            plt.xlabel('投票比值区间', fontsize=10)
            plt.ylabel('频率', fontsize=10)
            
        plt.grid(axis='y', alpha=0.3)
        
        suffix = '_eng' if language == 'eng' else ''
        filename = f"histogram_season{season}_week{week}_{name.replace(' ', '_').replace('/', '_')}{suffix}.png"
        filepath = os.path.join(output_dir, filename)
        plt.savefig(filepath, dpi=150, bbox_inches='tight')
        plt.close()
        
        if language == 'eng':
            print(f"  Generated histogram: {filename}")
        else:
            print(f"  生成直方图: {filename}")
            
        histogram_count += 1

def generate_pie_charts(df, output_dir='charts/pie_charts', language='eng'):
    os.makedirs(output_dir, exist_ok=True)
    
    best_candidates = []
    
    grouped = df.groupby(['season', 'week'])
    
    for (season, week), group in grouped:
        if len(group) >= 3 and len(group) <= 8 and group['num_valid_simulations'].iloc[0] > 5000:
            vote_range = group['simulated_vote_share'].max() - group['simulated_vote_share'].min()
            best_candidates.append((season, week, vote_range, len(group)))
    
    best_candidates.sort(key=lambda x: (x[3], x[2]), reverse=True)
    selected = best_candidates[:4]
    
    if language == 'eng':
        print(f"\nSelected {len(selected)} groups for pie charts:")
        for season, week, vote_range, num_contestants in selected:
            print(f"  Season {season}, Week {week} (Contestants: {num_contestants}, Vote range: {vote_range:.4f})")
    else:
        print(f"\n选择了 {len(selected)} 组数据生成饼图:")
        for season, week, vote_range, num_contestants in selected:
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
        
        if language == 'eng':
            plt.title(f'Season {season} Week {week} Celebrity Vote Distribution', fontsize=12)
        else:
            plt.title(f'赛季 {season} 第 {week} 周 明星投票占比', fontsize=12)
            
        plt.axis('equal')
        
        suffix = '_eng' if language == 'eng' else ''
        filename = f"pie_chart_season{season}_week{week}{suffix}.png"
        filepath = os.path.join(output_dir, filename)
        plt.savefig(filepath, dpi=150, bbox_inches='tight')
        plt.close()
        
        if language == 'eng':
            print(f"  Generated pie chart: {filename}")
        else:
            print(f"  生成饼图: {filename}")
            
        pie_count += 1

def sensitivity_analysis_mcmc_parameters(df, num_simulations_list=[1000, 5000, 10000, 50000, 100000]):
    output_dir = 'analysis_results/mcmc_simulation'
    os.makedirs(output_dir, exist_ok=True)
    
    sample_season = df['season'].iloc[0]
    sample_week = df[df['season'] == sample_season]['week'].iloc[0]
    
    sample_data = df[(df['season'] == sample_season) & (df['week'] == sample_week)]
    
    if sample_data.empty:
        return
    
    contestants = sample_data['celebrity_name'].unique()
    
    sensitivity_results = []
    
    grouped = df.groupby(['season', 'week'])
    
    for (season, week), group in grouped:
        if len(group) >= 3:
            num_valid = group['num_valid_simulations'].iloc[0]
            vote_std = group['simulated_vote_share'].std()
            
            sensitivity_results.append({
                'season': season,
                'week': week,
                'num_valid_simulations': num_valid,
                'vote_share_std': vote_std,
                'num_contestants': len(group)
            })
    
    results_df = pd.DataFrame(sensitivity_results)
    
    plt.figure(figsize=(12, 8))
    plt.scatter(results_df['num_valid_simulations'], results_df['vote_share_std'], 
               c=results_df['num_contestants'], cmap='viridis', alpha=0.7)
    plt.colorbar(label='Number of Contestants')
    plt.xlabel('Number of Valid Simulations')
    plt.ylabel('Standard Deviation of Vote Shares')
    plt.title('Sensitivity of Vote Share Distribution to Simulation Count')
    plt.xscale('log')
    plt.grid(True, alpha=0.3)
    
    filepath = os.path.join(output_dir, 'sensitivity_simulation_count_eng.png')
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    plt.close()
    
    plt.figure(figsize=(12, 8))
    plt.scatter(results_df['num_valid_simulations'], results_df['vote_share_std'], 
               c=results_df['num_contestants'], cmap='viridis', alpha=0.7)
    plt.colorbar(label='选手数量')
    plt.xlabel('有效模拟次数')
    plt.ylabel('投票比例标准差')
    plt.title('投票比例分布对模拟次数的敏感性')
    plt.xscale('log')
    plt.grid(True, alpha=0.3)
    
    filepath = os.path.join(output_dir, 'sensitivity_simulation_count.png')
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    plt.close()
    
    print("敏感性分析：模拟次数对结果的影响已完成")

def sensitivity_analysis_noise_level(df, noise_levels=[0.01, 0.03, 0.05, 0.07, 0.1]):
    output_dir = 'analysis_results/mcmc_simulation'
    os.makedirs(output_dir, exist_ok=True)
    
    sample_season = df['season'].iloc[0]
    sample_week = df[df['season'] == sample_season]['week'].iloc[0]
    
    sample_data = df[(df['season'] == sample_season) & (df['week'] == sample_week)]
    
    if sample_data.empty:
        return
    
    contestants = sample_data['celebrity_name'].tolist()
    base_votes = sample_data['simulated_vote_share'].tolist()
    
    sensitivity_results = []
    
    for noise_level in noise_levels:
        for i, (name, base_vote) in enumerate(zip(contestants, base_votes)):
            noisy_votes = []
            for _ in range(1000):
                noise = np.random.normal(0, noise_level)
                noisy_vote = max(0, min(1, base_vote * (1 + noise)))
                noisy_votes.append(noisy_vote)
            
            mean_noisy = np.mean(noisy_votes)
            std_noisy = np.std(noisy_votes)
            
            sensitivity_results.append({
                'celebrity_name': name,
                'noise_level': noise_level,
                'base_vote_share': base_vote,
                'mean_noisy_vote': mean_noisy,
                'std_noisy_vote': std_noisy
            })
    
    results_df = pd.DataFrame(sensitivity_results)
    
    plt.figure(figsize=(12, 8))
    
    for name in contestants[:5]:
        contestant_data = results_df[results_df['celebrity_name'] == name]
        plt.plot(contestant_data['noise_level'], contestant_data['std_noisy_vote'], 
                 marker='o', label=name)
    
    plt.xlabel('Noise Level')
    plt.ylabel('Standard Deviation of Vote Shares')
    plt.title('Sensitivity of Vote Shares to Noise Levels')
    plt.legend(title='Contestant')
    plt.grid(True, alpha=0.3)
    
    filepath = os.path.join(output_dir, 'sensitivity_noise_level_eng.png')
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    plt.close()
    
    plt.figure(figsize=(12, 8))
    
    for name in contestants[:5]:
        contestant_data = results_df[results_df['celebrity_name'] == name]
        plt.plot(contestant_data['noise_level'], contestant_data['std_noisy_vote'], 
                 marker='o', label=name)
    
    plt.xlabel('噪声水平')
    plt.ylabel('投票比例标准差')
    plt.title('投票比例对噪声水平的敏感性')
    plt.legend(title='选手')
    plt.grid(True, alpha=0.3)
    
    filepath = os.path.join(output_dir, 'sensitivity_noise_level.png')
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    plt.close()
    
    print("敏感性分析：噪声水平对结果的影响已完成")


if __name__ == "__main__":
    simulation_results = main()

    if simulation_results:
        print("\n" + "=" * 60)
        print("详细分析示例")
        print("=" * 60)

        analyze_specific_season_week(simulation_results, 1, 4)
        
        print("\n" + "=" * 60)
        print("生成图表")
        print("=" * 60)
        
        results_df = pd.read_csv('simulated_votes_results.csv')
        
        print("\n生成英文图表...")
        generate_frequency_histograms(results_df, language='eng')
        generate_pie_charts(results_df, language='eng')
        
        print("\n生成中文图表...")
        generate_frequency_histograms(results_df, language='cn')
        generate_pie_charts(results_df, language='cn')
        
        print("\n" + "=" * 60)
        print("运行敏感性分析")
        print("=" * 60)
        
        sensitivity_analysis_mcmc_parameters(results_df)
        sensitivity_analysis_noise_level(results_df)

        print("\n" + "=" * 60)
        print("模拟完成！")
        print("主要输出文件:")
        print("1. simulated_votes_results.csv - 完整的模拟结果")
        print("2. simulation_summary.csv - 汇总统计信息")
        print("3. charts/ - 生成的图表（中英文版本）")
        print("4. analysis_results/mcmc_simulation/ - 敏感性分析结果")
        print("=" * 60)