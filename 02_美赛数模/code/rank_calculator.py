import pandas as pd
import numpy as np
import os
import glob
import matplotlib.pyplot as plt
import seaborn as sns

def calculate_ranks(values, ascending=False):
    sorted_indices = np.argsort(values)[::-1] if not ascending else np.argsort(values)
    ranks = [0] * len(values)
    for rank, idx in enumerate(sorted_indices, 1):
        ranks[idx] = rank
    return ranks

def load_data():
    judge_data_path = '2026_MCM_Problem_C_Data.csv'
    if not os.path.exists(judge_data_path):
        print(f"错误：找不到文件 {judge_data_path}")
        return None, None
    
    judge_df = pd.read_csv(judge_data_path)
    
    result_files = glob.glob('simulated_votes_results_*.csv')
    if not result_files:
        result_files = glob.glob('simulated_votes_results.csv')
    
    if not result_files:
        print("错误：找不到模拟结果文件")
        return None, None
    
    result_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    latest_file = result_files[0]
    print(f"读取最新的模拟结果文件: {latest_file}")
    
    vote_df = pd.read_csv(latest_file)
    
    return judge_df, vote_df

def preprocess_judge_data(judge_df):
    judge_df_processed = judge_df.copy()
    
    judge_score_cols = [col for col in judge_df.columns if 'judge' in col]
    
    for col in judge_score_cols:
        judge_df_processed[col] = pd.to_numeric(judge_df_processed[col], errors='coerce').fillna(0).astype(float)
    
    return judge_df_processed, judge_score_cols

def get_week_judge_scores(judge_df, season, week):
    season_data = judge_df[judge_df['season'] == season].copy()
    
    judge_cols = [col for col in judge_df.columns if f'week{week}_judge' in col]
    
    if not judge_cols:
        return []
    
    contestants = []
    for idx, row in season_data.iterrows():
        week_scores = [row[col] for col in judge_cols]
        
        if all(score == 0 for score in week_scores):
            continue
        
        valid_scores = [s for s in week_scores if s > 0]
        avg_score = np.mean(valid_scores) if valid_scores else 0
        
        contestant_info = {
            'name': row['celebrity_name'],
            'avg_score': avg_score
        }
        
        contestants.append(contestant_info)
    
    return contestants

def get_week_vote_data(vote_df, season, week):
    week_data = vote_df[(vote_df['season'] == season) & (vote_df['week'] == week)].copy()
    
    if week_data.empty:
        return []
    
    vote_data = []
    for idx, row in week_data.iterrows():
        vote_info = {
            'name': row['celebrity_name'],
            'vote_share': row['simulated_vote_share']
        }
        vote_data.append(vote_info)
    
    return vote_data

def calculate_weekly_ranks(season, week, judge_data, vote_data):
    if not judge_data or not vote_data:
        return []
    
    judge_dict = {c['name']: c['avg_score'] for c in judge_data}
    vote_dict = {c['name']: c['vote_share'] for c in vote_data}
    
    common_contestants = list(set(judge_dict.keys()) & set(vote_dict.keys()))
    
    if not common_contestants:
        return []
    
    avg_scores = [judge_dict[name] for name in common_contestants]
    vote_shares = [vote_dict[name] for name in common_contestants]
    
    judge_ranks = calculate_ranks(avg_scores, ascending=False)
    audience_ranks = calculate_ranks(vote_shares, ascending=False)
    combined_ranks = [judge_ranks[i] + audience_ranks[i] for i in range(len(judge_ranks))]
    rank_combination_ranks = calculate_ranks(combined_ranks, ascending=True)
    
    judge_sum = sum(avg_scores)
    if judge_sum > 0:
        judge_percentages = [score / judge_sum for score in avg_scores]
    else:
        judge_percentages = [1.0 / len(avg_scores)] * len(avg_scores)
    combined_percentages = [judge_percentages[i] + vote_shares[i] for i in range(len(judge_percentages))]
    percentage_combination_ranks = calculate_ranks(combined_percentages, ascending=False)
    
    if season in [1, 2] or (season >= 28 and season <= 34):
        applicable_method = "Rank Combination Method"
        applicable_method_cn = "排名结合法"
    else:
        applicable_method = "Percentage Combination Method"
        applicable_method_cn = "百分比结合法"
    
    results = []
    for i, name in enumerate(common_contestants):
        results.append({
            'season': season,
            'week': week,
            'celebrity_name': name,
            'avg_judge_score': avg_scores[i],
            'simulated_vote_share': vote_shares[i],
            'rank_combination_rank': rank_combination_ranks[i],
            'percentage_combination_rank': percentage_combination_ranks[i],
            'applicable_method': applicable_method,
            'applicable_method_cn': applicable_method_cn
        })
    
    return results

def sensitivity_analysis_rank_methods(season, week, judge_data, vote_data):
    if not judge_data or not vote_data:
        return []
    
    judge_dict = {c['name']: c['avg_score'] for c in judge_data}
    vote_dict = {c['name']: c['vote_share'] for c in vote_data}
    common_contestants = list(set(judge_dict.keys()) & set(vote_dict.keys()))
    
    if not common_contestants:
        return []
    
    avg_scores = [judge_dict[name] for name in common_contestants]
    vote_shares = [vote_dict[name] for name in common_contestants]
    
    weight_combinations = [(0.1, 0.9), (0.3, 0.7), (0.5, 0.5), (0.7, 0.3), (0.9, 0.1)]
    
    sensitivity_results = []
    for judge_weight, vote_weight in weight_combinations:
        judge_ranks = calculate_ranks(avg_scores, ascending=False)
        audience_ranks = calculate_ranks(vote_shares, ascending=False)
        
        weighted_scores = [judge_weight * judge_ranks[i] + vote_weight * audience_ranks[i] 
                         for i in range(len(judge_ranks))]
        
        weighted_ranks = calculate_ranks(weighted_scores, ascending=True)
        
        for i, name in enumerate(common_contestants):
            sensitivity_results.append({
                'season': season,
                'week': week,
                'celebrity_name': name,
                'judge_weight': judge_weight,
                'vote_weight': vote_weight,
                'avg_judge_score': avg_scores[i],
                'simulated_vote_share': vote_shares[i],
                'weighted_rank': weighted_ranks[i]
            })
    
    return sensitivity_results

def sensitivity_analysis_noise_level(season, week, judge_data, vote_data, noise_levels=[0.05, 0.1, 0.15, 0.2]):
    if not judge_data or not vote_data:
        return []
    
    judge_dict = {c['name']: c['avg_score'] for c in judge_data}
    vote_dict = {c['name']: c['vote_share'] for c in vote_data}
    common_contestants = list(set(judge_dict.keys()) & set(vote_dict.keys()))
    
    if not common_contestants:
        return []
    
    sensitivity_results = []
    for noise_level in noise_levels:
        avg_scores = [judge_dict[name] for name in common_contestants]
        vote_shares = [vote_dict[name] for name in common_contestants]
        
        noisy_scores = [score * (1 + np.random.normal(0, noise_level)) for score in avg_scores]
        noisy_votes = [vote * (1 + np.random.normal(0, noise_level)) for vote in vote_shares]
        
        noisy_scores = [max(0, score) for score in noisy_scores]
        noisy_votes = [max(0, min(1, vote)) for vote in noisy_votes]
        
        judge_ranks = calculate_ranks(noisy_scores, ascending=False)
        audience_ranks = calculate_ranks(noisy_votes, ascending=False)
        combined_ranks = [judge_ranks[i] + audience_ranks[i] for i in range(len(judge_ranks))]
        final_ranks = calculate_ranks(combined_ranks, ascending=True)
        
        for i, name in enumerate(common_contestants):
            sensitivity_results.append({
                'season': season,
                'week': week,
                'celebrity_name': name,
                'noise_level': noise_level,
                'original_score': avg_scores[i],
                'noisy_score': noisy_scores[i],
                'original_vote': vote_shares[i],
                'noisy_vote': noisy_votes[i],
                'final_rank': final_ranks[i]
            })
    
    return sensitivity_results

def visualize_sensitivity_analysis(sensitivity_results, language='eng'):
    if not sensitivity_results:
        return
    
    results_df = pd.DataFrame(sensitivity_results)
    
    output_dir = 'analysis_results/rank_calculation'
    os.makedirs(output_dir, exist_ok=True)
    
    plt.figure(figsize=(12, 8))
    
    unique_contestants = results_df['celebrity_name'].unique()
    
    for contestant in unique_contestants:
        contestant_data = results_df[results_df['celebrity_name'] == contestant]
        plt.plot(contestant_data['judge_weight'], contestant_data['weighted_rank'], 
                 marker='o', label=contestant)
    
    if language == 'eng':
        plt.title('Rank Sensitivity to Different Weight Combinations')
        plt.xlabel('Judge Score Weight')
        plt.ylabel('Rank (Lower is Better)')
        plt.legend(title='Contestant')
        filename = os.path.join(output_dir, 'rank_sensitivity_weights_eng.png')
    else:
        plt.title('不同权重组合对排名的敏感性')
        plt.xlabel('评委评分权重')
        plt.ylabel('排名（越低越好）')
        plt.legend(title='选手')
        filename = os.path.join(output_dir, 'rank_sensitivity_weights.png')
    
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()
    
    noise_results = [r for r in sensitivity_results if 'noise_level' in r]
    if noise_results:
        noise_df = pd.DataFrame(noise_results)
        
        plt.figure(figsize=(12, 8))
        
        for contestant in unique_contestants:
            contestant_data = noise_df[noise_df['celebrity_name'] == contestant]
            plt.plot(contestant_data['noise_level'], contestant_data['final_rank'], 
                     marker='o', label=contestant)
        
        if language == 'eng':
            plt.title('Rank Sensitivity to Noise Levels')
            plt.xlabel('Noise Level')
            plt.ylabel('Rank (Lower is Better)')
            plt.legend(title='Contestant')
            filename = os.path.join(output_dir, 'rank_sensitivity_noise_eng.png')
        else:
            plt.title('噪声水平对排名的敏感性')
            plt.xlabel('噪声水平')
            plt.ylabel('排名（越低越好）')
            plt.legend(title='选手')
            filename = os.path.join(output_dir, 'rank_sensitivity_noise.png')
        
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(filename)
        plt.close()

def main():
    print("开始计算排名...")
    
    judge_df, vote_df = load_data()
    if judge_df is None or vote_df is None:
        return
    
    judge_df_processed, judge_score_cols = preprocess_judge_data(judge_df)
    
    seasons = sorted(vote_df['season'].unique())
    all_results = []
    all_sensitivity_results = []
    all_noise_results = []
    
    for season in seasons:
        print(f"处理赛季 {season}...")
        weeks = sorted(vote_df[vote_df['season'] == season]['week'].unique())
        
        for week in weeks:
            judge_data = get_week_judge_scores(judge_df_processed, season, week)
            vote_data = get_week_vote_data(vote_df, season, week)
            
            weekly_results = calculate_weekly_ranks(season, week, judge_data, vote_data)
            all_results.extend(weekly_results)
            
            sensitivity_results = sensitivity_analysis_rank_methods(season, week, judge_data, vote_data)
            all_sensitivity_results.extend(sensitivity_results)
            
            noise_results = sensitivity_analysis_noise_level(season, week, judge_data, vote_data)
            all_noise_results.extend(noise_results)
    
    if all_results:
        results_df = pd.DataFrame(all_results)
        
        results_df = results_df.sort_values(['season', 'week', 'rank_combination_rank'],
                                           ascending=[True, True, True])
        
        import datetime
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'rank_results_{timestamp}.csv'
        results_df.to_csv(output_file, index=False, float_format='%.6f')
        
        print(f"\n排名结果已保存到 {output_file}")
        print(f"共 {len(results_df)} 条记录")
    
    if all_sensitivity_results:
        print("\n运行敏感性分析...")
        sample_season = seasons[0]
        sample_week = sorted(vote_df[vote_df['season'] == sample_season]['week'].unique())[0]
        
        visualize_sensitivity_analysis(all_sensitivity_results + all_noise_results, language='eng')
        visualize_sensitivity_analysis(all_sensitivity_results + all_noise_results, language='cn')
        
        print("敏感性分析图表已生成")

if __name__ == "__main__":
    main()